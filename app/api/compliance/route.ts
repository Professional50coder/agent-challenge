import { type NextRequest, NextResponse } from "next/server"
import { streamText } from "ai"
import { getKnowledgeBaseContext, searchKnowledgeBase } from "@/lib/knowledge-base"
import { validateApiKey } from "@/lib/auth"
import { checkRateLimit, getRateLimitInfo } from "@/lib/rate-limit"
import { addSecurityHeaders } from "@/lib/security-headers"
import { searchCompliance } from "@/lib/exa-client"
import { structuredComplianceAnalysis } from "@/lib/gemini-client"

const complianceTools = {
  analyzeKYC: {
    description:
      "Analyze Know Your Customer (KYC) compliance requirements and procedures for a specific jurisdiction and business type",
    parameters: {
      type: "object",
      properties: {
        jurisdiction: {
          type: "string",
          description: "The jurisdiction to analyze KYC requirements for (e.g., US, EU, UK, Singapore)",
        },
        businessType: {
          type: "string",
          description: "Type of crypto business (exchange, wallet, lending, staking, custodian, etc.)",
        },
        customerBase: {
          type: "string",
          description: "Target customer base (retail, institutional, both)",
        },
      },
      required: ["jurisdiction", "businessType"],
    },
  },
  analyzeAML: {
    description: "Analyze Anti-Money Laundering (AML) compliance requirements and procedures",
    parameters: {
      type: "object",
      properties: {
        jurisdiction: {
          type: "string",
          description: "The jurisdiction to analyze AML requirements for",
        },
        transactionVolume: {
          type: "string",
          description: "Expected transaction volume (low, medium, high, very-high)",
        },
        riskProfile: {
          type: "string",
          description: "Business risk profile (low, medium, high)",
        },
      },
      required: ["jurisdiction", "transactionVolume"],
    },
  },
  analyzeRegulatory: {
    description: "Analyze general regulatory requirements for crypto businesses in a jurisdiction",
    parameters: {
      type: "object",
      properties: {
        jurisdiction: {
          type: "string",
          description: "The jurisdiction to analyze",
        },
        services: {
          type: "array",
          items: { type: "string" },
          description: "List of services offered (trading, staking, lending, custody, etc.)",
        },
        operatingModel: {
          type: "string",
          description: "Operating model (centralized, decentralized, hybrid)",
        },
      },
      required: ["jurisdiction", "services"],
    },
  },
  assessRisk: {
    description: "Assess compliance risk level based on current practices and identify gaps",
    parameters: {
      type: "object",
      properties: {
        currentPractices: {
          type: "string",
          description: "Description of current compliance practices",
        },
        jurisdiction: {
          type: "string",
          description: "The jurisdiction",
        },
        existingControls: {
          type: "array",
          items: { type: "string" },
          description: "List of existing compliance controls",
        },
      },
      required: ["currentPractices", "jurisdiction"],
    },
  },
  searchRegulations: {
    description: "Search the compliance knowledge base for specific regulations and requirements",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query for compliance information",
        },
        category: {
          type: "string",
          description: "Filter by category (KYC, AML, Licensing, Services, Sanctions)",
        },
      },
      required: ["query"],
    },
  },
}

function executeComplianceTool(toolName: string, params: Record<string, any>): string {
  switch (toolName) {
    case "analyzeKYC": {
      const kycRequirements: Record<string, string> = {
        US: `KYC Requirements for ${params.businessType} in United States:
- Customer Identification Program (CIP) mandatory
- Verify identity with government-issued ID (driver's license, passport)
- Collect: Full name, DOB, address, SSN/Tax ID
- Beneficial ownership verification for entities (UBO)
- Risk-based Customer Due Diligence (CDD)
- Enhanced Due Diligence (EDD) for high-risk customers
- Documentation retention: Minimum 5 years
- Ongoing monitoring and updating of customer information
- Politically Exposed Persons (PEP) screening
- Sanctions list screening (OFAC)`,
        EU: `KYC Requirements for ${params.businessType} in European Union:
- Customer Due Diligence (CDD) under AMLD5
- Identity verification with government-issued ID
- Beneficial ownership register access
- Enhanced Due Diligence for high-risk jurisdictions
- PEP screening and monitoring
- GDPR compliance for data handling
- Documentation retention: 5 years minimum
- Risk-based approach implementation
- Ongoing transaction monitoring
- Sanctions screening (EU, UN lists)`,
        UK: `KYC Requirements for ${params.businessType} in United Kingdom:
- Customer Due Diligence under Money Laundering Regulations 2017
- Identity verification with government-issued ID
- Beneficial ownership verification
- Enhanced due diligence for high-risk customers
- PEP screening
- Sanctions list screening (UK, UN, EU lists)
- Documentation retention: 5 years
- Ongoing monitoring requirements
- FCA compliance for regulated activities`,
      }

      return (
        kycRequirements[params.jurisdiction] ||
        `KYC Requirements for ${params.businessType} in ${params.jurisdiction}: Standard international KYC procedures apply`
      )
    }

    case "analyzeAML": {
      const amlRequirements = `AML Compliance for ${params.jurisdiction}:
- Transaction Monitoring: Real-time monitoring of all transactions
- Suspicious Activity Reporting (SAR): File for suspicious transactions
- Currency Transaction Reports (CTR): Report cash transactions over threshold
- Transaction Threshold: $${params.transactionVolume === "high" ? "5,000" : "10,000"} for SAR
- Staff Training: Mandatory AML training for all employees
- Compliance Officer: Designate AML compliance officer
- Written Policies: Document AML procedures and controls
- Independent Audit: Annual compliance audit recommended
- Customer Risk Categorization: Implement risk scoring
- Ongoing Due Diligence: Monitor customer activity continuously
- Sanctions Screening: Screen all customers and transactions
- Record Keeping: Maintain transaction records for 5+ years`

      return amlRequirements
    }

    case "analyzeRegulatory": {
      const services = params.services.join(", ")
      return `Regulatory Requirements for ${params.jurisdiction}:
- Services Offered: ${services}
- Licensing: May require money transmitter or crypto asset service provider license
- Consumer Protection: Implement consumer protection measures
- Data Privacy: Comply with local data protection laws (GDPR, CCPA, etc.)
- Operational Resilience: Implement business continuity and disaster recovery
- Incident Reporting: Report security incidents to regulators
- Regular Audits: Conduct compliance audits
- Capital Requirements: May need to maintain minimum capital
- Insurance: Consider cyber liability and E&O insurance
- Regulatory Reporting: Submit regular compliance reports`
    }

    case "assessRisk": {
      const controls = params.existingControls || []
      const controlsText =
        controls.length > 0 ? `Existing Controls: ${controls.join(", ")}` : "No existing controls documented"

      return `Risk Assessment for ${params.jurisdiction}:
${controlsText}
Current Practices: ${params.currentPractices}

Risk Analysis:
- Compliance Maturity: Assess against regulatory expectations
- Control Gaps: Identify missing controls
- Remediation Priority: High, Medium, Low
- Timeline: Develop remediation timeline
- Resource Requirements: Estimate resources needed
- Ongoing Monitoring: Implement continuous monitoring

Recommendations:
1. Conduct full compliance audit
2. Document all policies and procedures
3. Implement automated monitoring systems
4. Establish compliance training program
5. Schedule regular compliance reviews`
    }

    case "searchRegulations": {
      const results = searchKnowledgeBase(params.query, 5)
      if (results.length === 0) {
        return `No specific regulations found for "${params.query}". Please consult with a compliance expert.`
      }

      return (
        `Regulations found for "${params.query}":\n\n` +
        results
          .map((doc) => `[${doc.category} - ${doc.jurisdiction}] ${doc.title}\n${doc.content.substring(0, 400)}...`)
          .join("\n\n")
      )
    }

    default:
      return "Tool execution completed"
  }
}

async function analyzeComplianceWithAgent(query: string, stream = false) {
  try {
    const knowledgeContext = getKnowledgeBaseContext(query)

    const webResults = await searchCompliance(query, 5)
    const webSearchContext = webResults
      .map((result) => `[${result.title}]\n${result.text.substring(0, 500)}\nSource: ${result.url}`)
      .join("\n\n")

    // Combine knowledge base and web search results
    const combinedContext = [knowledgeContext, webSearchContext].filter(Boolean).join("\n\n---\n\n")

    if (stream) {
      // For streaming, use Gemini directly
      const { stream: responseStream } = await streamText({
        model: "google/gemini-2.0-flash",
        system: `You are an expert crypto compliance advisor. Analyze the compliance question using the provided context and provide a detailed assessment.`,
        prompt: `Context:\n${combinedContext}\n\nQuestion: ${query}`,
        maxTokens: 2000,
      })
      return responseStream
    } else {
      // For non-streaming, use structured analysis
      const result = await structuredComplianceAnalysis(query, combinedContext)
      return result
    }
  } catch (error) {
    console.error("[Not] Agent analysis error:", error)
    return {
      status: "warning",
      score: 60,
      jurisdiction: "Unknown",
      findings: [
        "Analysis service temporarily unavailable",
        "Please ensure Vercel AI Gateway is configured with a valid payment method",
      ],
      recommendations: [
        "Add credit card to Vercel account",
        "Set EXA_API_KEY environment variable for enhanced web search",
        "Consult with compliance professional",
      ],
      riskFactors: ["Service configuration incomplete"],
      nextSteps: [
        "Visit https://vercel.com/account/billing/overview to add payment method",
        "Add EXA_API_KEY to environment variables in Vercel dashboard",
        "Retry your compliance query",
      ],
      sources: [],
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-api-key")
    const clientId = request.headers.get("x-client-id") || request.ip || "anonymous"
    const stream = request.headers.get("accept") === "text/event-stream"

    // Validate API key if provided
    if (apiKey && !(await validateApiKey(apiKey))) {
      const response = NextResponse.json({ error: "Invalid API key" }, { status: 401 })
      return addSecurityHeaders(response)
    }

    // Check rate limit
    if (!checkRateLimit(clientId, 10, 60000)) {
      const rateLimitInfo = getRateLimitInfo(clientId)
      const response = NextResponse.json(
        {
          error: "Rate limit exceeded",
          retryAfter: Math.ceil((rateLimitInfo.reset - Date.now()) / 1000),
        },
        { status: 429 },
      )
      response.headers.set("Retry-After", Math.ceil((rateLimitInfo.reset - Date.now()) / 1000).toString())
      return addSecurityHeaders(response)
    }

    const { query } = await request.json()

    if (!query || typeof query !== "string") {
      const response = NextResponse.json({ error: "Query is required and must be a string" }, { status: 400 })
      return addSecurityHeaders(response)
    }

    // Validate query length
    if (query.length > 5000) {
      const response = NextResponse.json({ error: "Query too long (max 5000 characters)" }, { status: 400 })
      return addSecurityHeaders(response)
    }

    // Validate query content
    if (query.length < 10) {
      const response = NextResponse.json({ error: "Query too short (min 10 characters)" }, { status: 400 })
      return addSecurityHeaders(response)
    }

    const result = await analyzeComplianceWithAgent(query, stream)

    if (stream && result instanceof ReadableStream) {
      const response = new NextResponse(result, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      })
      return addSecurityHeaders(response)
    }

    const response = NextResponse.json(result)

    // Add rate limit headers
    const rateLimitInfo = getRateLimitInfo(clientId)
    response.headers.set("X-RateLimit-Limit", rateLimitInfo.limit.toString())
    response.headers.set("X-RateLimit-Remaining", rateLimitInfo.remaining.toString())
    response.headers.set("X-RateLimit-Reset", Math.ceil(rateLimitInfo.reset / 1000).toString())

    return addSecurityHeaders(response)
  } catch (error) {
    console.error("[Not] Compliance API error:", error)
    const response = NextResponse.json({ error: "Failed to analyze compliance" }, { status: 500 })
    return addSecurityHeaders(response)
  }
}
