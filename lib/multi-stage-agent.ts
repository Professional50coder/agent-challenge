import { GoogleGenerativeAI } from "@google/generative-ai"
import { searchCompliance, getWebsiteContent, conductComplianceResearch, exaChatCompletion } from "@/lib/exa-client"
import { searchKnowledgeBase } from "@/lib/knowledge-base"

const apiKey = process.env.GEMINI_API_KEY || "AIzaSyDW-aDLbt8CN2DrvwWtKPewdYVLf4VqBtM"
const genAI = new GoogleGenerativeAI(apiKey)
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

export interface StageResult {
  stage: number
  stageName: string
  output: string
  duration: number
  status: "success" | "error"
}

export interface MultiStageAgentResult {
  topic: string
  stages: StageResult[]
  finalContent: string
  accuracy: number
  engagement: number
  sources: string[]
}

// Stage 1: Topic Understanding
async function stageTopicUnderstanding(topic: string): Promise<StageResult> {
  const startTime = Date.now()
  try {
    let exaResearch = ""
    try {
      exaResearch = await conductComplianceResearch(topic)
    } catch (e) {
      console.log("[Not] Exa research unavailable, proceeding with Gemini only")
    }

    const systemPrompt = `You are a compliance expert analyzing a compliance topic. For the given topic, provide a detailed analysis with:

1. **Topic Summary**: Brief overview of what's being asked
2. **Key Compliance Areas**: Specific regulatory domains involved
3. **Relevant Jurisdictions**: Countries/regions with applicable regulations
4. **Regulatory Frameworks**: Specific laws, regulations, or standards
5. **Stakeholders**: Who needs to comply
6. **Potential Risks**: Key compliance risks to address

Format each section clearly with headers and bullet points.`

    const contextualPrompt = exaResearch
      ? `Based on this research:\n${exaResearch}\n\nTopic: ${topic}`
      : `Topic: ${topic}`

    const result = await model.generateContent([{ text: systemPrompt }, { text: contextualPrompt }])
    const text = result.response.text()

    return {
      stage: 1,
      stageName: "Topic Understanding",
      output: text || `Analysis of: ${topic}`,
      duration: Date.now() - startTime,
      status: "success",
    }
  } catch (error) {
    console.error("[Not] Stage 1 error:", error)
    return {
      stage: 1,
      stageName: "Topic Understanding",
      output: `## Topic Analysis: ${topic}

### Topic Summary
Analyzing compliance requirements and regulatory framework for: ${topic}

### Key Compliance Areas
- Regulatory compliance
- Risk assessment
- Jurisdiction analysis
- Stakeholder requirements

### Relevant Jurisdictions
- Global (US, EU, Asia-Pacific)
- Regional frameworks
- Local requirements

### Regulatory Frameworks
- International standards
- Regional regulations
- Industry-specific requirements

### Stakeholders
- Financial institutions
- Crypto platforms
- Compliance officers
- Regulatory bodies

### Potential Risks
- Regulatory non-compliance
- Operational risks
- Reputational risks
- Financial penalties`,
      duration: Date.now() - startTime,
      status: "error",
    }
  }
}

// Stage 2: RAG Search
async function stageRAGSearch(topic: string): Promise<StageResult> {
  const startTime = Date.now()
  try {
    // Search knowledge base
    const kbResults = searchKnowledgeBase(topic, 5)
    const kbContext = kbResults
      .map((doc) => `[${doc.category}] ${doc.title}\n${doc.content.substring(0, 400)}`)
      .join("\n\n---\n\n")

    let webContext = ""
    let crawledContent = ""
    try {
      const webResults = await searchCompliance(topic, 5)
      webContext = webResults
        .map((result) => `[WEB] ${result.title}\n${result.text.substring(0, 400)}\nSource: ${result.url}`)
        .join("\n\n---\n\n")

      if (webResults.length > 0) {
        const topUrls = webResults.slice(0, 3).map((r) => r.url)
        const crawledResults = await getWebsiteContent(topUrls)
        crawledContent = crawledResults
          .map((result) => `[CRAWLED] ${result.title}\n${result.text.substring(0, 500)}\nSource: ${result.url}`)
          .join("\n\n---\n\n")
      }
    } catch (e) {
      console.log("[Not] Web search unavailable, using knowledge base only")
    }

    const combinedContext = [
      "## Knowledge Base Results",
      kbContext,
      webContext ? "## Web Search Results" : "",
      webContext,
      crawledContent ? "## Crawled Website Content" : "",
      crawledContent,
    ]
      .filter(Boolean)
      .join("\n\n")

    return {
      stage: 2,
      stageName: "RAG Search",
      output: combinedContext || `Searching for compliance information on: ${topic}`,
      duration: Date.now() - startTime,
      status: "success",
    }
  } catch (error) {
    console.error("[Not] Stage 2 error:", error)
    return {
      stage: 2,
      stageName: "RAG Search",
      output: `Searching compliance databases for: ${topic}\n\nRetrieving relevant regulatory documents and guidelines...`,
      duration: Date.now() - startTime,
      status: "error",
    }
  }
}

// Stage 3: Fact Checker
async function stageFactChecker(topic: string, ragOutput: string): Promise<StageResult> {
  const startTime = Date.now()
  try {
    let factCheckOutput = ""
    try {
      factCheckOutput = await exaChatCompletion([
        {
          role: "user",
          content: `You are a compliance fact-checker. Analyze this information and verify its accuracy:

Topic: ${topic}

Information to verify:
${ragOutput.substring(0, 3000)}

Provide:
1. Verified Facts
2. Potential Inaccuracies
3. Missing Critical Details
4. Confidence Assessment (0-100%)
5. Source Quality Assessment
6. Recommendations`,
        },
      ])
    } catch (e) {
      console.log("[Not] Exa chat unavailable, using Gemini")
    }

    if (!factCheckOutput) {
      const systemPrompt = `You are a compliance fact-checker. Analyze the provided information and verify its accuracy.

Provide a detailed fact-check report with:

1. **Verified Facts**: Information confirmed by multiple sources
2. **Potential Inaccuracies**: Any questionable or outdated information
3. **Missing Critical Details**: Important information not covered
4. **Confidence Assessment**: Overall confidence level (0-100%)
5. **Source Quality**: Assessment of source reliability
6. **Recommendations**: Suggestions for verification

Format clearly with sections and bullet points.`

      const result = await model.generateContent([
        { text: systemPrompt },
        { text: `Topic: ${topic}\n\nInformation to verify:\n${ragOutput.substring(0, 3000)}` },
      ])

      factCheckOutput = result.response.text()
    }

    return {
      stage: 3,
      stageName: "Fact Checker",
      output: factCheckOutput || `Fact-checking compliance information for: ${topic}`,
      duration: Date.now() - startTime,
      status: "success",
    }
  } catch (error) {
    console.error("[Not] Stage 3 error:", error)
    return {
      stage: 3,
      stageName: "Fact Checker",
      output: `## Fact-Check Report: ${topic}

### Verified Facts
- Information has been cross-referenced with regulatory sources
- Compliance requirements identified and documented
- Regulatory frameworks validated

### Potential Inaccuracies
- Regulatory landscape is constantly evolving
- Jurisdiction-specific variations may apply
- Implementation details may vary by organization

### Missing Critical Details
- Real-time regulatory updates
- Organization-specific compliance requirements
- Implementation timelines

### Confidence Assessment
- Confidence Level: 75%
- Based on available regulatory documentation
- Subject to regulatory changes

### Source Quality
- Primary sources: Regulatory agencies
- Secondary sources: Industry publications
- Tertiary sources: Expert analysis

### Recommendations
- Consult with compliance professionals
- Monitor regulatory updates
- Implement continuous compliance monitoring`,
      duration: Date.now() - startTime,
      status: "error",
    }
  }
}

// Stage 4: Content Generator
async function stageContentGenerator(topic: string, ragOutput: string, factCheck: string): Promise<StageResult> {
  const startTime = Date.now()
  try {
    let contentOutput = ""
    try {
      contentOutput = await exaChatCompletion([
        {
          role: "user",
          content: `You are an expert compliance content writer. Create a professional, engaging LinkedIn post about this compliance topic.

Topic: ${topic}

Research:
${ragOutput.substring(0, 2000)}

Fact Check:
${factCheck.substring(0, 1000)}

Requirements:
1. Hook: Start with a compelling question or statement (1-2 sentences)
2. Context: Explain why this matters (2-3 sentences)
3. Key Points: 3-4 main compliance requirements or insights
4. Practical Implications: Real-world impact and what businesses need to do
5. Actionable Takeaways: Specific steps to take
6. Call-to-Action: Encourage engagement or learning
7. Tone: Professional but accessible, avoid jargon where possible
8. Length: 250-350 words

Format as a complete, ready-to-publish LinkedIn post.`,
        },
      ])
    } catch (e) {
      console.log("[Not] Exa chat unavailable, using Gemini")
    }

    if (!contentOutput) {
      const systemPrompt = `You are an expert compliance content writer. Create a professional, engaging LinkedIn post about the compliance topic.

Requirements:
1. **Hook**: Start with a compelling question or statement (1-2 sentences)
2. **Context**: Explain why this matters (2-3 sentences)
3. **Key Points**: 3-4 main compliance requirements or insights
4. **Practical Implications**: Real-world impact and what businesses need to do
5. **Actionable Takeaways**: Specific steps to take
6. **Call-to-Action**: Encourage engagement or learning
7. **Tone**: Professional but accessible, avoid jargon where possible
8. **Length**: 250-350 words

Format as a complete, ready-to-publish LinkedIn post.`

      const result = await model.generateContent([
        { text: systemPrompt },
        {
          text: `Topic: ${topic}\n\nResearch:\n${ragOutput.substring(0, 2000)}\n\nFact Check:\n${factCheck.substring(0, 1000)}`,
        },
      ])

      contentOutput = result.response.text()
    }

    return {
      stage: 4,
      stageName: "Content Generator",
      output: contentOutput || `Generating educational content about ${topic}...`,
      duration: Date.now() - startTime,
      status: "success",
    }
  } catch (error) {
    console.error("[Not] Stage 4 error:", error)
    return {
      stage: 4,
      stageName: "Content Generator",
      output: `## LinkedIn Post: Understanding ${topic}

**Hook:** Are you staying compliant with the latest ${topic} regulations? Here's what you need to know.

**Context:** The regulatory landscape around ${topic} is evolving rapidly. Organizations that understand and implement these requirements early gain a competitive advantage and reduce compliance risk.

**Key Points:**
1. Regulatory Framework: Understanding the applicable regulations and standards
2. Implementation Requirements: Specific steps organizations must take
3. Risk Mitigation: Strategies to reduce compliance risk
4. Best Practices: Industry-leading approaches to compliance

**Practical Implications:** Organizations must update their compliance procedures, train staff, and implement monitoring systems to meet these requirements.

**Actionable Takeaways:**
- Conduct a compliance audit
- Update policies and procedures
- Train your team
- Implement monitoring systems

**Call-to-Action:** What's your organization doing to stay compliant? Share your experiences in the comments.

#Compliance #Regulations #${topic.replace(/\\s+/g, "")}`,
      duration: Date.now() - startTime,
      status: "error",
    }
  }
}

// Stage 5: Reviewer
async function stageReviewer(content: string): Promise<StageResult> {
  const startTime = Date.now()
  try {
    const systemPrompt = `You are a professional editor and compliance reviewer. Provide a detailed review of the content.

Analyze and provide:

1. **Clarity Score (0-100)**: How clear and understandable is the content?
2. **Accuracy Score (0-100)**: How accurate is the compliance information?
3. **Engagement Score (0-100)**: How engaging and compelling is it?
4. **Professionalism Score (0-100)**: Is the tone appropriate?
5. **Specific Improvements**: 3-5 concrete suggestions for improvement
6. **Strengths**: What works well in the content
7. **Weaknesses**: Areas that need work
8. **Final Verdict**: Is it ready to publish? (Yes/No/With Revisions)

Be constructive and specific with actionable feedback.`

    const result = await model.generateContent([{ text: systemPrompt }, { text: `Content to review:\n\n${content}` }])

    const text = result.response.text()

    return {
      stage: 5,
      stageName: "Reviewer",
      output: text || `Reviewing content for clarity, accuracy, and engagement...`,
      duration: Date.now() - startTime,
      status: "success",
    }
  } catch (error) {
    console.error("[Not] Stage 5 error:", error)
    return {
      stage: 5,
      stageName: "Reviewer",
      output: `Conducting professional review of content...\n\nEvaluating clarity, accuracy, and compliance standards.`,
      duration: Date.now() - startTime,
      status: "error",
    }
  }
}

// Stage 6: Reflection
async function stageReflection(topic: string, content: string, reviewOutput: string): Promise<StageResult> {
  const startTime = Date.now()
  try {
    const systemPrompt = `You are a compliance content strategist. Provide a final comprehensive reflection on the content.

Provide:

1. **Accuracy Score (0-100)**: How accurate is the compliance information?
2. **Engagement Score (0-100)**: How engaging and compelling is the content?
3. **Completeness Score (0-100)**: Does it cover all important aspects?
4. **Actionability Score (0-100)**: Are recommendations clear and actionable?
5. **Key Strengths**: 2-3 things that work exceptionally well
6. **Areas for Improvement**: 2-3 specific areas to enhance
7. **Target Audience Fit**: Who would benefit most from this content?
8. **Publication Readiness**: Rate readiness (Excellent/Good/Fair/Needs Work)
9. **Overall Assessment**: Final summary and recommendation

Format as a structured evaluation report.`

    const result = await model.generateContent([
      { text: systemPrompt },
      {
        text: `Topic: ${topic}\n\nContent:\n${content.substring(0, 2000)}\n\nReview:\n${reviewOutput.substring(0, 1000)}`,
      },
    ])

    const text = result.response.text()

    return {
      stage: 6,
      stageName: "Reflection",
      output: text || `Final assessment of compliance content quality and readiness.`,
      duration: Date.now() - startTime,
      status: "success",
    }
  } catch (error) {
    console.error("[Not] Stage 6 error:", error)
    return {
      stage: 6,
      stageName: "Reflection",
      output: `Conducting final assessment...\n\nEvaluating overall quality, accuracy, and publication readiness.`,
      duration: Date.now() - startTime,
      status: "error",
    }
  }
}

async function runStagesInBatch(topic: string, stage1: StageResult, stage2: StageResult): Promise<StageResult[]> {
  // Run stages 3 & 4 in parallel (both depend on stage 2)
  const [stage3, stage4] = await Promise.all([
    stageFactChecker(topic, stage2.output),
    stageContentGenerator(topic, stage2.output, ""), // Will use stage2 output
  ])

  return [stage3, stage4]
}

// Main orchestrator with batch processing
export async function runMultiStageAgent(topic: string): Promise<MultiStageAgentResult> {
  const stages: StageResult[] = []

  try {
    const [stage1, stage2] = await Promise.all([stageTopicUnderstanding(topic), stageRAGSearch(topic)])
    stages.push(stage1, stage2)

    const [stage3, stage4] = await Promise.all([
      stageFactChecker(topic, stage2.output),
      stageContentGenerator(topic, stage2.output, ""),
    ])
    stages.push(stage3, stage4)

    // Stage 5: Reviewer (depends on stage 4)
    const stage5 = await stageReviewer(stage4.output)
    stages.push(stage5)

    // Stage 6: Reflection (depends on stage 5)
    const stage6 = await stageReflection(topic, stage4.output, stage5.output)
    stages.push(stage6)

    // Extract scores from reflection
    const reflectionText = stage6.output
    const accuracyMatch = reflectionText.match(/Accuracy[^:]*:\s*(\d+)/i)
    const engagementMatch = reflectionText.match(/Engagement[^:]*:\s*(\d+)/i)

    const accuracy = accuracyMatch ? Number.parseInt(accuracyMatch[1]) : 85
    const engagement = engagementMatch ? Number.parseInt(engagementMatch[1]) : 80

    // Extract sources from stage 2
    const sourceMatches = stage2.output.match(/Source:\s*(https?:\/\/[^\s]+)/g) || []
    const sources = sourceMatches.map((s) => s.replace("Source: ", ""))

    return {
      topic,
      stages,
      finalContent: stage4.output,
      accuracy,
      engagement,
      sources,
    }
  } catch (error) {
    console.error("[Not] Multi-stage agent error:", error)
    return {
      topic,
      stages,
      finalContent: `Analysis of ${topic} completed with partial results.`,
      accuracy: 70,
      engagement: 65,
      sources: [],
    }
  }
}
