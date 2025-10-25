"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Loader2 } from "lucide-react"

interface SearchResult {
  id: string
  title: string
  content: string
  category: string
  jurisdiction: string
  score: number
}

export function KnowledgeSearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setSearched(true)

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=5`)
      const data = await response.json()
      setResults(data.results || [])
    } catch (error) {
      console.error("Search error:", error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search knowledge base..."
          className="border-slate-600 bg-slate-700 text-white placeholder:text-slate-500"
          disabled={loading}
        />
        <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </form>

      {searched && results.length === 0 && !loading && (
        <Card className="border-slate-700 bg-slate-800 p-4">
          <p className="text-slate-400">No results found. Try different keywords.</p>
        </Card>
      )}

      {results.map((result) => (
        <Card key={result.id} className="border-slate-700 bg-slate-800 p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-white">{result.title}</h3>
            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">{result.category}</span>
          </div>
          <p className="text-sm text-slate-300 mb-2">{result.content.substring(0, 200)}...</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">{result.jurisdiction}</span>
            <span className="text-xs text-emerald-400">Match: {(result.score * 100).toFixed(0)}%</span>
          </div>
        </Card>
      ))}
    </div>
  )
}
