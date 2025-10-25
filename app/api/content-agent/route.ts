import { type NextRequest, NextResponse } from "next/server"
import { runMultiStageAgent } from "@/lib/multi-stage-agent"
import { validateApiKey } from "@/lib/auth"
import { checkRateLimit, getRateLimitInfo } from "@/lib/rate-limit"
import { addSecurityHeaders } from "@/lib/security-headers"

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-api-key")
    const clientId = request.headers.get("x-client-id") || request.ip || "anonymous"

    // Validate API key if provided
    if (apiKey && !(await validateApiKey(apiKey))) {
      const response = NextResponse.json({ error: "Invalid API key" }, { status: 401 })
      return addSecurityHeaders(response)
    }

    // Check rate limit (5 requests per minute for content generation)
    if (!checkRateLimit(clientId, 5, 60000)) {
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

    const { topic } = await request.json()

    if (!topic || typeof topic !== "string") {
      const response = NextResponse.json({ error: "Topic is required and must be a string" }, { status: 400 })
      return addSecurityHeaders(response)
    }

    if (topic.length < 10 || topic.length > 500) {
      const response = NextResponse.json({ error: "Topic must be between 10 and 500 characters" }, { status: 400 })
      return addSecurityHeaders(response)
    }

    // Run the multi-stage agent
    const result = await runMultiStageAgent(topic)

    const response = NextResponse.json(result)

    // Add rate limit headers
    const rateLimitInfo = getRateLimitInfo(clientId)
    response.headers.set("X-RateLimit-Limit", rateLimitInfo.limit.toString())
    response.headers.set("X-RateLimit-Remaining", rateLimitInfo.remaining.toString())
    response.headers.set("X-RateLimit-Reset", Math.ceil(rateLimitInfo.reset / 1000).toString())

    return addSecurityHeaders(response)
  } catch (error) {
    console.error("[Not] Content agent API error:", error)
    const response = NextResponse.json({ error: "Failed to generate content" }, { status: 500 })
    return addSecurityHeaders(response)
  }
}
