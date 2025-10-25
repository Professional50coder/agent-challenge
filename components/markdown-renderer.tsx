"use client"

import type React from "react"

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const parseMarkdown = (text: string) => {
    const lines = text.split("\n")
    const elements: React.ReactNode[] = []
    let currentList: string[] = []
    let inCodeBlock = false
    let codeBlockContent = ""

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 my-3 ml-2">
            {currentList.map((item, i) => (
              <li key={i} className="text-slate-300">
                {item}
              </li>
            ))}
          </ul>,
        )
        currentList = []
      }
    }

    lines.forEach((line, index) => {
      // Code blocks
      if (line.trim().startsWith("```")) {
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${elements.length}`} className="bg-slate-900 p-3 rounded my-3 overflow-x-auto">
              <code className="text-slate-300 text-xs">{codeBlockContent}</code>
            </pre>,
          )
          codeBlockContent = ""
          inCodeBlock = false
        } else {
          inCodeBlock = true
        }
        return
      }

      if (inCodeBlock) {
        codeBlockContent += line + "\n"
        return
      }

      // Headers
      if (line.startsWith("# ")) {
        flushList()
        elements.push(
          <h1 key={`h1-${index}`} className="text-2xl font-bold text-white mt-4 mb-2">
            {line.replace(/^# /, "")}
          </h1>,
        )
        return
      }

      if (line.startsWith("## ")) {
        flushList()
        elements.push(
          <h2 key={`h2-${index}`} className="text-xl font-bold text-emerald-400 mt-3 mb-2">
            {line.replace(/^## /, "")}
          </h2>,
        )
        return
      }

      if (line.startsWith("### ")) {
        flushList()
        elements.push(
          <h3 key={`h3-${index}`} className="text-lg font-semibold text-blue-400 mt-2 mb-1">
            {line.replace(/^### /, "")}
          </h3>,
        )
        return
      }

      // Bold and italic
      const processedLine = line
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/\*([^*]+)\*/g, "<em>$1</em>")
        .replace(/`([^`]+)`/g, "<code>$1</code>")

      // Bullet points
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        currentList.push(line.replace(/^[\s]*[-*]\s/, ""))
        return
      }

      // Numbered lists
      if (/^\d+\.\s/.test(line.trim())) {
        flushList()
        const match = line.match(/^(\d+)\.\s(.+)/)
        if (match) {
          elements.push(
            <div key={`num-${index}`} className="flex gap-3 my-2 ml-2">
              <span className="font-semibold text-emerald-400 min-w-fit">{match[1]}.</span>
              <span className="text-slate-300">{match[2]}</span>
            </div>,
          )
        }
        return
      }

      // Empty lines
      if (line.trim() === "") {
        flushList()
        elements.push(<div key={`empty-${index}`} className="h-2" />)
        return
      }

      // Regular paragraphs
      flushList()
      if (line.trim()) {
        elements.push(
          <p key={`p-${index}`} className="text-slate-300 leading-relaxed my-2">
            {processedLine}
          </p>,
        )
      }
    })

    flushList()
    return elements
  }

  return <div className={`space-y-2 ${className}`}>{parseMarkdown(content)}</div>
}
