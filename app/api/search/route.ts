import { type NextRequest, NextResponse } from "next/server"
import { searchKnowledgeBase } from "@/lib/knowledge-base"
import { checkRateLimit, getRateLimitInfo } from "@/lib/rate-limit"
import { addSecurityHeaders } from "@/lib/security-headers"

export async function GET(request: NextRequest) {
  try {
    const clientId = request.headers.get("x-client-id") || request.ip || "anonymous"

    if (!checkRateLimit(clientId, 20, 60000)) {
      const rateLimitInfo = getRateLimitInfo(clientId, 20)
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

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")
    const limit = Number.parseInt(searchParams.get("limit") || "5")

    if (!query) {
      const response = NextResponse.json({ error: "Query parameter required" }, { status: 400 })
      return addSecurityHeaders(response)
    }

    // Validate query length
    if (query.length > 1000) {
      const response = NextResponse.json({ error: "Query too long (max 1000 characters)" }, { status: 400 })
      return addSecurityHeaders(response)
    }

    // Validate limit
    if (limit < 1 || limit > 50) {
      const response = NextResponse.json({ error: "Limit must be between 1 and 50" }, { status: 400 })
      return addSecurityHeaders(response)
    }

    const results = searchKnowledgeBase(query, limit)
    const response = NextResponse.json({
      query,
      results,
      count: results.length,
    })

    // Add rate limit headers
    const rateLimitInfo = getRateLimitInfo(clientId, 20)
    response.headers.set("X-RateLimit-Limit", rateLimitInfo.limit.toString())
    response.headers.set("X-RateLimit-Remaining", rateLimitInfo.remaining.toString())
    response.headers.set("X-RateLimit-Reset", Math.ceil(rateLimitInfo.reset / 1000).toString())

    return addSecurityHeaders(response)
  } catch (error) {
    console.error("Search API error:", error)
    const response = NextResponse.json({ error: "Search failed" }, { status: 500 })
    return addSecurityHeaders(response)
  }
}
