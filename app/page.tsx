"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Loader2,
  Send,
  Shield,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MessageSquare,
  Lock,
  TrendingUp,
  Zap,
  AlertTriangle,
  ExternalLink,
  BookOpen,
} from "lucide-react"
import { ComplianceDashboard } from "@/components/compliance-dashboard"

interface ComplianceResult {
  status: "compliant" | "warning" | "non-compliant"
  score: number
  jurisdiction?: string
  findings: string[]
  recommendations: string[]
  riskFactors?: string[]
  nextSteps?: string[]
  sources?: string[]
}

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function Home() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ComplianceResult | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [rateLimitInfo, setRateLimitInfo] = useState<{ remaining: number; limit: number } | null>(null)
  const [sources, setSources] = useState<string[]>([])
  const [setupWarning, setSetupWarning] = useState<string | null>(null)

  const suggestedQuestions = [
    "What are the KYC requirements for a crypto exchange in the US?",
    "How do I ensure AML compliance for my trading platform?",
    "What regulatory requirements apply to crypto lending services?",
    "How can I assess my compliance risk level?",
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setShowSuggestions(false)
    const userMessage: Message = { role: "user", content: query, timestamp: new Date() }
    setMessages((prev) => [...prev, userMessage])

    try {
      const response = await fetch("/api/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      })

      const remaining = response.headers.get("X-RateLimit-Remaining")
      const limit = response.headers.get("X-RateLimit-Limit")
      if (remaining && limit) {
        setRateLimitInfo({ remaining: Number.parseInt(remaining), limit: Number.parseInt(limit) })
      }

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to analyze compliance")
      }

      const data = await response.json()
      setResult(data)
      setSources(data.sources || [])

      if (data.nextSteps?.some((step: string) => step.includes("credit card") || step.includes("EXA_API_KEY"))) {
        setSetupWarning("Some features are not fully configured. See setup instructions below.")
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: `Compliance Analysis: ${data.status} (Score: ${data.score}%)${data.jurisdiction ? ` - ${data.jurisdiction}` : ""}`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error:", error)
      const errorMessage: Message = {
        role: "assistant",
        content: error instanceof Error ? error.message : "Failed to analyze compliance. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
      setQuery("")
    }
  }

  const handleSuggestedQuestion = (question: string) => {
    setQuery(question)
    setShowSuggestions(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/20 p-2">
                <Shield className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Compliance Agent</h1>
                <p className="text-sm text-slate-400">AI-Powered Crypto Regulatory Intelligence</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/content-agent">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Content Agent
                </Button>
              </Link>
              {rateLimitInfo && (
                <div className="text-xs text-slate-400">
                  Requests: {rateLimitInfo.remaining}/{rateLimitInfo.limit}
                </div>
              )}
              <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-1">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <span className="text-sm text-emerald-400">AI Powered</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-blue-500/10 px-3 py-1">
                <Lock className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-blue-400">Secure</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {setupWarning && (
        <div className="border-b border-yellow-700 bg-yellow-900/20 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-yellow-200">{setupWarning}</p>
                <p className="text-xs text-yellow-300 mt-1">
                  To enable full features, add your API keys in the Vercel dashboard under Environment Variables.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {result && (
          <div className="mb-8">
            <ComplianceDashboard
              score={result.score}
              status={result.status}
              findings={[
                {
                  id: "1",
                  title: "Information Security Program",
                  severity: "critical",
                  description: "16 CFR 314.4(b) - Institution's information security program based on risk assessment",
                  regulation: "16 CFR 314.4(b)",
                },
                {
                  id: "2",
                  title: "Access Control Implementation",
                  severity: "high",
                  description: "Ensure proper access control measures are in place",
                },
                {
                  id: "3",
                  title: "Data Classification",
                  severity: "medium",
                  description: "Implement data classification standards",
                },
              ]}
              assets={{ total: 100, trend: -12 }}
              contacts={[
                { name: "John Doe", role: "Security Officer", email: "john@example.com" },
                { name: "Jane Smith", role: "Compliance Manager", email: "jane@example.com" },
              ]}
              deployments={[
                {
                  name: "Purple Lab",
                  classification: "Confidential",
                  environment: "Development",
                  scope: "Enterprise",
                },
              ]}
            />
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="flex h-[600px] flex-col border-slate-700 bg-slate-800">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 p-6">
                {messages.length === 0 && showSuggestions ? (
                  <div className="flex h-full flex-col items-center justify-center">
                    <div className="text-center">
                      <MessageSquare className="mx-auto h-12 w-12 text-slate-600 mb-4" />
                      <p className="text-slate-400 mb-6">Ask about crypto compliance requirements</p>
                      <div className="space-y-2">
                        {suggestedQuestions.map((q, i) => (
                          <button
                            key={i}
                            onClick={() => handleSuggestedQuestion(q)}
                            className="block w-full text-left rounded-lg border border-slate-600 bg-slate-700/50 p-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-slate-100 transition-colors"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-xs rounded-lg px-4 py-2 ${
                          msg.role === "user" ? "bg-emerald-600 text-white" : "bg-slate-700 text-slate-100"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input */}
              <form onSubmit={handleSubmit} className="border-t border-slate-700 p-4">
                <div className="flex gap-2">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask about compliance requirements..."
                    className="border-slate-600 bg-slate-700 text-white placeholder:text-slate-500"
                    disabled={loading}
                  />
                  <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {result && (
              <>
                {/* Compliance Score */}
                <Card className="border-slate-700 bg-slate-800 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white">Compliance Score</h3>
                    {result.status === "compliant" && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                    {result.status === "warning" && <AlertCircle className="h-5 w-5 text-yellow-400" />}
                    {result.status === "non-compliant" && <AlertCircle className="h-5 w-5 text-red-400" />}
                  </div>
                  <div className="text-3xl font-bold text-emerald-400 mb-2">{result.score}%</div>
                  <div className="text-sm text-slate-400 capitalize">{result.status}</div>
                  {result.jurisdiction && (
                    <div className="text-xs text-slate-500 mt-2">Jurisdiction: {result.jurisdiction}</div>
                  )}
                </Card>

                {sources && sources.length > 0 && (
                  <Card className="border-slate-700 bg-slate-800 p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-4 w-4 text-blue-400" />
                      <h3 className="font-semibold text-white">Research Sources</h3>
                    </div>
                    <ul className="space-y-2">
                      {sources.map((source, i) => (
                        <li key={i} className="text-xs text-slate-400 truncate hover:text-slate-300">
                          {source}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* Findings */}
                {result.findings.length > 0 && (
                  <Card className="border-slate-700 bg-slate-800 p-6">
                    <h3 className="font-semibold text-white mb-3">Key Findings</h3>
                    <ul className="space-y-2">
                      {result.findings.map((finding, i) => (
                        <li key={i} className="flex gap-2 text-sm text-slate-300">
                          <span className="text-emerald-400">•</span>
                          {finding}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* Risk Factors */}
                {result.riskFactors && result.riskFactors.length > 0 && (
                  <Card className="border-slate-700 bg-slate-800 p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="h-4 w-4 text-red-400" />
                      <h3 className="font-semibold text-white">Risk Factors</h3>
                    </div>
                    <ul className="space-y-2">
                      {result.riskFactors.map((risk, i) => (
                        <li key={i} className="flex gap-2 text-sm text-slate-300">
                          <span className="text-red-400">⚠</span>
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* Recommendations */}
                {result.recommendations.length > 0 && (
                  <Card className="border-slate-700 bg-slate-800 p-6">
                    <h3 className="font-semibold text-white mb-3">Recommendations</h3>
                    <ul className="space-y-2">
                      {result.recommendations.map((rec, i) => (
                        <li key={i} className="flex gap-2 text-sm text-slate-300">
                          <span className="text-yellow-400">→</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* Next Steps */}
                {result.nextSteps && result.nextSteps.length > 0 && (
                  <Card className="border-slate-700 bg-slate-800 p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="h-4 w-4 text-blue-400" />
                      <h3 className="font-semibold text-white">Next Steps</h3>
                    </div>
                    <ol className="space-y-2">
                      {result.nextSteps.map((step, i) => (
                        <li key={i} className="flex gap-2 text-sm text-slate-300">
                          <span className="text-blue-400">{i + 1}.</span>
                          {step.includes("https://") ? (
                            <>
                              {step.split(/(https?:\/\/[^\s]+)/g).map((part, j) =>
                                part.match(/^https?:\/\//) ? (
                                  <a
                                    key={j}
                                    href={part}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 underline inline-flex items-center gap-1"
                                  >
                                    {part}
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                ) : (
                                  <span key={j}>{part}</span>
                                ),
                              )}
                            </>
                          ) : (
                            step
                          )}
                        </li>
                      ))}
                    </ol>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
