import { Exa } from "exa-js"
import OpenAI from "openai"

let exaClient: Exa | null = null
let exaAvailable = false
let exaChatClient: OpenAI | null = null

export function getExaClient(): Exa | null {
  if (!exaAvailable && !process.env.EXA_API_KEY) {
    console.warn("[Not] EXA_API_KEY not configured - web search disabled")
    return null
  }

  if (!exaClient && process.env.EXA_API_KEY) {
    try {
      exaClient = new Exa(process.env.EXA_API_KEY)
      exaAvailable = true
    } catch (error) {
      console.error("[Not] Failed to initialize Exa client:", error)
      exaAvailable = false
      return null
    }
  }
  return exaClient
}

export function getExaChatClient(): OpenAI | null {
  if (typeof window !== "undefined") {
    console.warn("[Not] Exa chat client cannot be initialized in browser environment")
    return null
  }

  if (!process.env.EXA_API_KEY) {
    console.warn("[Not] EXA_API_KEY not configured - Exa chat disabled")
    return null
  }

  if (!exaChatClient) {
    try {
      exaChatClient = new OpenAI({
        baseURL: "https://api.exa.ai",
        apiKey: process.env.EXA_API_KEY,
        dangerouslyAllowBrowser: false,
      })
    } catch (error) {
      console.error("[Not] Failed to initialize Exa chat client:", error)
      return null
    }
  }
  return exaChatClient
}

export interface SearchResult {
  title: string
  url: string
  text: string
  score: number
}

export async function searchCompliance(query: string, limit = 5): Promise<SearchResult[]> {
  try {
    const exa = getExaClient()
    if (!exa) {
      console.warn("[Not] Exa client not available - skipping web search")
      return []
    }

    const results = await exa.searchAndContents(query, {
      text: true,
      type: "auto",
      numResults: limit,
    })

    return results.results.map((result: any) => ({
      title: result.title,
      url: result.url,
      text: result.text || "",
      score: result.score || 0,
    }))
  } catch (error) {
    console.error("[Not] Exa search error:", error)
    return []
  }
}

export async function getWebsiteContent(urls: string[]): Promise<SearchResult[]> {
  try {
    const exa = getExaClient()
    if (!exa) {
      console.warn("[Not] Exa client not available - cannot fetch website content")
      return []
    }

    const results = await exa.getContents(urls, {
      text: true,
    })

    return results.results.map((result: any) => ({
      title: result.title || "",
      url: result.url,
      text: result.text || "",
      score: 1,
    }))
  } catch (error) {
    console.error("[Not] Exa content fetch error:", error)
    return []
  }
}

export async function conductComplianceResearch(topic: string): Promise<string> {
  try {
    const exa = getExaClient()
    if (!exa) {
      console.warn("[Not] Exa client not available - cannot conduct research")
      return ""
    }

    const research = await exa.research.create({
      instructions: `Provide a comprehensive summary of ${topic} including current regulations, requirements, and best practices. Focus on crypto and blockchain compliance aspects.`,
      model: "exa-research-fast",
    })

    let fullResponse = ""
    const stream = await exa.research.get(research.research_id, { stream: true })

    for await (const event of stream) {
      if (event.type === "text") {
        fullResponse += event.text
      }
    }

    return fullResponse
  } catch (error) {
    console.error("[Not] Exa research error:", error)
    return ""
  }
}

export async function exaChatCompletion(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  model = "exa-research-fast",
): Promise<string> {
  try {
    const client = getExaChatClient()
    if (!client) {
      console.warn("[Not] Exa chat client not available")
      return ""
    }

    const completion = await client.chat.completions.create({
      model,
      messages,
      stream: false,
    })

    return completion.choices[0]?.message?.content || ""
  } catch (error) {
    console.error("[Not] Exa chat completion error:", error)
    return ""
  }
}

export async function* exaChatCompletionStream(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  model = "exa-research-fast",
): AsyncGenerator<string> {
  try {
    const client = getExaChatClient()
    if (!client) {
      console.warn("[Not] Exa chat client not available")
      return
    }

    const completion = await client.chat.completions.create({
      model,
      messages,
      stream: true,
    })

    for await (const chunk of completion) {
      if (chunk.choices[0]?.delta?.content) {
        yield chunk.choices[0].delta.content
      }
    }
  } catch (error) {
    console.error("[Not] Exa chat streaming error:", error)
  }
}
