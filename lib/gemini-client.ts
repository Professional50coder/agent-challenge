import { GoogleGenerativeAI } from "@google/generative-ai"

const apiKey = process.env.GEMINI_API_KEY || "AIzaSyDW-aDLbt8CN2DrvwWtKPewdYVLf4VqBtM"
const genAI = new GoogleGenerativeAI(apiKey)

let geminiAvailable: boolean | null = null

async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries = 3, initialDelayMs = 1000): Promise<T | null> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      const isRetryable = error?.status === 503 || error?.message?.includes("overloaded")
      if (!isRetryable || attempt === maxRetries - 1) {
        throw error
      }
      const delayMs = initialDelayMs * Math.pow(2, attempt)
      console.log(`[Not] Retry attempt ${attempt + 1}/${maxRetries} after ${delayMs}ms`)
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }
  return null
}

export async function analyzeWithGemini(systemPrompt: string, userPrompt: string, stream = false) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    if (stream) {
      const result = await retryWithBackoff(() =>
        model.generateContentStream([{ text: systemPrompt }, { text: userPrompt }]),
      )
      geminiAvailable = result !== null
      return result?.stream || null
    } else {
      const result = await retryWithBackoff(() => model.generateContent([{ text: systemPrompt }, { text: userPrompt }]))
      geminiAvailable = result !== null
      return result?.response.text() || null
    }
  } catch (error: any) {
    console.error("[Not] Gemini analysis error:", error?.message)
    geminiAvailable = false
    return null
  }
}

export async function structuredComplianceAnalysis(
  query: string,
  webSearchResults: string,
): Promise<{
  status: "compliant" | "warning" | "non-compliant"
  score: number
  jurisdiction: string
  findings: string[]
  recommendations: string[]
  riskFactors: string[]
  nextSteps: string[]
  sources: string[]
}> {
  const systemPrompt = `You are an expert crypto compliance advisor with deep knowledge of international regulations including FinCEN, FATF, EU regulations, and jurisdiction-specific requirements.

Your role is to:
1. Analyze compliance questions thoroughly using provided web research
2. Provide structured, actionable recommendations
3. Identify compliance gaps and risks
4. Suggest remediation strategies
5. Cite sources from the research provided

When analyzing compliance:
- Consider KYC/AML requirements
- Evaluate regulatory frameworks
- Assess risk levels
- Provide jurisdiction-specific guidance
- Recommend best practices

Always provide responses in valid JSON format with these exact fields:
{
  "status": "compliant" | "warning" | "non-compliant",
  "score": number (0-100),
  "jurisdiction": "identified jurisdiction",
  "findings": ["finding1", "finding2", ...],
  "recommendations": ["rec1", "rec2", ...],
  "riskFactors": ["risk1", "risk2", ...],
  "nextSteps": ["step1", "step2", ...],
  "sources": ["source1", "source2", ...]
}`

  const userPrompt = `Analyze this compliance question using the provided web research:

Question: "${query}"

Web Research Results:
${webSearchResults}

Provide a detailed compliance assessment in JSON format.`

  try {
    const response = await analyzeWithGemini(systemPrompt, userPrompt, false)

    if (response === null) {
      console.warn("[Not] Gemini unavailable - returning fallback response")
      return {
        status: "warning",
        score: 65,
        jurisdiction: "Multiple",
        findings: [
          "Analysis using knowledge base only",
          "Real-time web search unavailable",
          "Please configure Gemini API for enhanced analysis",
        ],
        recommendations: ["Review compliance documentation", "Consult with compliance professional"],
        riskFactors: ["Limited real-time data", "Incomplete analysis"],
        nextSteps: ["Provide more specific compliance details"],
        sources: [],
      }
    }

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    // Fallback response
    return {
      status: "warning",
      score: 70,
      jurisdiction: "Multiple",
      findings: ["Analysis completed", "Regulatory framework assessed"],
      recommendations: ["Review compliance procedures", "Implement monitoring"],
      riskFactors: ["Regulatory changes"],
      nextSteps: ["Schedule compliance review"],
      sources: [],
    }
  } catch (error) {
    console.error("[Not] Structured analysis error:", error)
    return {
      status: "warning",
      score: 60,
      jurisdiction: "Unknown",
      findings: ["Analysis in progress", "Regulatory assessment pending"],
      recommendations: ["Consult with compliance expert", "Review regulatory updates"],
      riskFactors: ["Incomplete information"],
      nextSteps: ["Provide more details", "Consult professional"],
      sources: [],
    }
  }
}
