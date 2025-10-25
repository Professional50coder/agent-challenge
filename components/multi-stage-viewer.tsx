"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Zap, CheckCircle2, AlertCircle, Clock, ExternalLink } from "lucide-react"
import { EnhancedContentRenderer } from "@/components/enhanced-content-renderer"
import type { MultiStageAgentResult, StageResult } from "@/lib/multi-stage-agent"

interface MultiStageViewerProps {
  result: MultiStageAgentResult
}

export function MultiStageViewer({ result }: MultiStageViewerProps) {
  const [expandedStages, setExpandedStages] = useState<number[]>([])

  const toggleStage = (stageNum: number) => {
    setExpandedStages((prev) => (prev.includes(stageNum) ? prev.filter((s) => s !== stageNum) : [...prev, stageNum]))
  }

  const getStageIcon = (stage: StageResult) => {
    if (stage.status === "success") {
      return <CheckCircle2 className="h-5 w-5 text-emerald-400" />
    }
    return <AlertCircle className="h-5 w-5 text-yellow-400" />
  }

  const getStageColor = (stageNum: number) => {
    const colors = [
      "from-blue-600 to-blue-700",
      "from-purple-600 to-purple-700",
      "from-pink-600 to-pink-700",
      "from-emerald-600 to-emerald-700",
      "from-orange-600 to-orange-700",
      "from-cyan-600 to-cyan-700",
    ]
    return colors[stageNum - 1] || colors[0]
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{result.topic}</h2>
            <p className="text-slate-400">6-Stage Compliance Content Generation Pipeline</p>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400">{result.accuracy}%</div>
              <div className="text-xs text-slate-400 uppercase tracking-wide">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">{result.engagement}%</div>
              <div className="text-xs text-slate-400 uppercase tracking-wide">Engagement</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stages */}
      <div className="space-y-3">
        {result.stages.map((stage) => (
          <Card
            key={stage.stage}
            className="border-slate-700 bg-slate-800 overflow-hidden hover:border-slate-600 transition-colors"
          >
            <button
              onClick={() => toggleStage(stage.stage)}
              className={`w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors bg-gradient-to-r ${getStageColor(stage.stage)} bg-opacity-10`}
            >
              <div className="flex items-center gap-3 flex-1 text-left">
                {getStageIcon(stage)}
                <div>
                  <div className="font-semibold text-white">
                    Stage {stage.stage}: {stage.stageName}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3" />
                    {stage.duration}ms
                  </div>
                </div>
              </div>
              {expandedStages.includes(stage.stage) ? (
                <ChevronUp className="h-5 w-5 text-slate-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-400" />
              )}
            </button>

            {expandedStages.includes(stage.stage) && (
              <div className="border-t border-slate-700 px-6 py-4 bg-slate-900/50">
                <EnhancedContentRenderer content={stage.output} className="text-sm" />
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Final Content */}
      <Card className="border-emerald-700 bg-emerald-900/20 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-emerald-400" />
          <h3 className="font-semibold text-white text-lg">Generated Content</h3>
        </div>
        <div className="bg-slate-900 rounded p-4 border border-slate-700">
          <EnhancedContentRenderer content={result.finalContent} className="text-sm" />
        </div>
        <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700 w-full">Copy to Clipboard</Button>
      </Card>

      {/* Sources */}
      {result.sources.length > 0 && (
        <Card className="border-slate-700 bg-slate-800 p-6">
          <h3 className="font-semibold text-white mb-3">Sources</h3>
          <ul className="space-y-2">
            {result.sources.map((source, i) => (
              <li key={i} className="text-xs text-slate-400 truncate hover:text-slate-300">
                <a
                  href={source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  {source}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
