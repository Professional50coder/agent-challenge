"use client"

import type React from "react"

interface EnhancedContentRendererProps {
  content: string
  className?: string
}

// Compliance keywords to highlight
const COMPLIANCE_KEYWORDS = [
  "KYC",
  "AML",
  "FATF",
  "RBI",
  "DEX",
  "cryptocurrency",
  "regulation",
  "compliance",
  "regulatory",
  "framework",
  "requirement",
  "jurisdiction",
  "sanctions",
  "travel rule",
  "OFAC",
  "FinCEN",
  "SEC",
  "CFTC",
  "MAS",
  "FCA",
  "BaFin",
  "AMF",
  "CNB",
  "ESMA",
  "EBA",
  "EIOPA",
  "EFSA",
  "ESRB",
  "ECB",
  "EU",
  "USA",
  "India",
  "Singapore",
  "Hong Kong",
  "Japan",
  "UK",
  "Europe",
  "Asia",
  "compliance officer",
  "due diligence",
  "risk assessment",
  "money laundering",
  "terrorist financing",
  "beneficial owner",
  "customer identification",
  "transaction monitoring",
  "suspicious activity",
  "reporting",
  "documentation",
  "audit",
  "verification",
  "identity",
  "authentication",
]

// Component to render text with highlighted keywords and clickable links
function TextWithHighlights({ text }: { text: string }) {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0

  // First, split by URLs
  const urlMatches = Array.from(text.matchAll(urlRegex))

  if (urlMatches.length === 0) {
    // No URLs, just highlight keywords
    return <HighlightedText text={text} />
  }

  urlMatches.forEach((match) => {
    const url = match[0]
    const startIndex = match.index!

    // Add text before URL with keyword highlighting
    if (startIndex > lastIndex) {
      parts.push(<HighlightedText key={`text-${lastIndex}`} text={text.substring(lastIndex, startIndex)} />)
    }

    // Add clickable URL
    parts.push(
      <a
        key={`url-${startIndex}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 hover:text-blue-300 underline inline-flex items-center gap-1"
      >
        <span>{url}</span>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4m-4-6l6 6m0 0l-6 6m6-6H3"
          />
        </svg>
      </a>,
    )

    lastIndex = startIndex + url.length
  })

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(<HighlightedText key={`text-${lastIndex}`} text={text.substring(lastIndex)} />)
  }

  return <>{parts}</>
}

// Component to highlight keywords in text
function HighlightedText({ text }: { text: string }) {
  const parts: React.ReactNode[] = []
  let lastIndex = 0

  // Create regex for all keywords (case-insensitive)
  const keywordRegex = new RegExp(`\\b(${COMPLIANCE_KEYWORDS.join("|")})\\b`, "gi")
  const matches = Array.from(text.matchAll(keywordRegex))

  if (matches.length === 0) {
    return <>{text}</>
  }

  matches.forEach((match) => {
    const keyword = match[0]
    const startIndex = match.index!

    // Add text before keyword
    if (startIndex > lastIndex) {
      parts.push(text.substring(lastIndex, startIndex))
    }

    // Add highlighted keyword
    parts.push(
      <mark key={`keyword-${startIndex}`} className="bg-emerald-500/30 text-emerald-100 px-1 rounded">
        {keyword}
      </mark>,
    )

    lastIndex = startIndex + keyword.length
  })

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return <>{parts}</>
}

export function EnhancedContentRenderer({ content, className = "" }: EnhancedContentRendererProps) {
  const parseContent = (text: string) => {
    const lines = text.split("\n")
    const elements: React.ReactNode[] = []
    let currentList: string[] = []
    let inCodeBlock = false
    let codeBlockContent = ""

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-2 my-4 ml-4">
            {currentList.map((item, i) => (
              <li key={i} className="text-slate-300">
                <TextWithHighlights text={item} />
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
            <pre
              key={`code-${elements.length}`}
              className="bg-slate-900 p-4 rounded my-4 overflow-x-auto border border-slate-700"
            >
              <code className="text-slate-300 text-xs font-mono">{codeBlockContent}</code>
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
        const headerText = line.replace(/^# /, "")
        elements.push(
          <h1 key={`h1-${index}`} className="text-3xl font-bold text-white mt-6 mb-3">
            <TextWithHighlights text={headerText} />
          </h1>,
        )
        return
      }

      if (line.startsWith("## ")) {
        flushList()
        const headerText = line.replace(/^## /, "")
        elements.push(
          <h2
            key={`h2-${index}`}
            className="text-2xl font-bold text-emerald-400 mt-5 mb-3 border-b border-emerald-500/30 pb-2"
          >
            <TextWithHighlights text={headerText} />
          </h2>,
        )
        return
      }

      if (line.startsWith("### ")) {
        flushList()
        const headerText = line.replace(/^### /, "")
        elements.push(
          <h3 key={`h3-${index}`} className="text-xl font-semibold text-blue-400 mt-4 mb-2">
            <TextWithHighlights text={headerText} />
          </h3>,
        )
        return
      }

      // Bullet points
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        const cleanedLine = line.replace(/^[\s]*[-*]\s/, "")
        currentList.push(cleanedLine)
        return
      }

      // Numbered lists
      if (/^\d+\.\s/.test(line.trim())) {
        flushList()
        const match = line.match(/^(\d+)\.\s(.+)/)
        if (match) {
          elements.push(
            <div key={`num-${index}`} className="flex gap-3 my-3 ml-4">
              <span className="font-semibold text-emerald-400 min-w-fit">{match[1]}.</span>
              <span className="text-slate-300">
                <TextWithHighlights text={match[2]} />
              </span>
            </div>,
          )
        }
        return
      }

      // Empty lines
      if (line.trim() === "") {
        flushList()
        elements.push(<div key={`empty-${index}`} className="h-3" />)
        return
      }

      // Regular paragraphs
      flushList()
      if (line.trim()) {
        elements.push(
          <p key={`p-${index}`} className="text-slate-300 leading-relaxed my-3">
            <TextWithHighlights text={line} />
          </p>,
        )
      }
    })

    flushList()
    return elements
  }

  return <div className={`space-y-2 ${className}`}>{parseContent(content)}</div>
}
