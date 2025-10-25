"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, Send, Sparkles, BookOpen } from "lucide-react"
import { MultiStageViewer } from "@/components/multi-stage-viewer"
import type { MultiStageAgentResult } from "@/lib/multi-stage-agent"

export default function ContentAgentPage() {
  const [topic, setTopic] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<MultiStageAgentResult | null>(null)

  const suggestedTopics = [
    "Summarize FATF KYC updates 2024",
    "Explain FATF Travel Rule for crypto exchanges",
    "Indian DEX KYC requirements and compliance",
    "EU MiCA regulation impact on crypto businesses",
    "Singapore crypto licensing requirements",
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) return

    setLoading(true)
    try {
      const response = await fetch("/api/content-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to generate content")
      }

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("Error:", error)
      alert(error instanceof Error ? error.message : "Failed to generate content")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/20 p-2">
              <BookOpen className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Content Agent</h1>
              <p className="text-sm text-slate-400">6-Stage Compliance Content Generation</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {!result ? (
          <div className="space-y-8">
            {/* Input Section */}
            <Card className="border-slate-700 bg-slate-800 p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Compliance Topic</label>
                  <div className="flex gap-2">
                    <Input
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g., Summarize FATF KYC updates 2024"
                      className="border-slate-600 bg-slate-700 text-white placeholder:text-slate-500"
                      disabled={loading}
                    />
                    <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </form>
            </Card>

            {/* Suggested Topics */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Suggested Topics</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {suggestedTopics.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setTopic(t)
                    }}
                    className="text-left rounded-lg border border-slate-600 bg-slate-800 p-4 hover:bg-slate-700 hover:border-slate-500 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-white">{t}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* How It Works */}
            <Card className="border-slate-700 bg-slate-800 p-6">
              <h3 className="font-semibold text-white mb-4">How It Works</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <div className="text-2xl font-bold text-purple-400 mb-2">1</div>
                  <p className="text-sm text-slate-300">
                    <strong>Topic Understanding</strong> - Analyze compliance context
                  </p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400 mb-2">2</div>
                  <p className="text-sm text-slate-300">
                    <strong>RAG Search</strong> - Fetch compliance docs
                  </p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400 mb-2">3</div>
                  <p className="text-sm text-slate-300">
                    <strong>Fact Checker</strong> - Verify correctness
                  </p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400 mb-2">4</div>
                  <p className="text-sm text-slate-300">
                    <strong>Content Generator</strong> - Write educational posts
                  </p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400 mb-2">5</div>
                  <p className="text-sm text-slate-300">
                    <strong>Reviewer</strong> - Polish & simplify
                  </p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400 mb-2">6</div>
                  <p className="text-sm text-slate-300">
                    <strong>Reflection</strong> - Rate accuracy & engagement
                  </p>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <Button
              onClick={() => setResult(null)}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              ← Back
            </Button>
            <MultiStageViewer result={result} />
          </div>
        )}
      </div>
    </main>
  )
}
