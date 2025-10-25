"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FindingMatrix } from "./finding-matrix"
import { CircularProgress } from "./circular-progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertCircle, XCircle, Users, LinkIcon } from "lucide-react"

interface ComplianceDashboardProps {
  score: number
  status: "compliant" | "warning" | "non-compliant"
  findings: Array<{
    id: string
    title: string
    severity: "critical" | "high" | "medium" | "low"
    description: string
    regulation?: string
  }>
  assets?: {
    total: number
    trend: number
  }
  contacts?: Array<{
    name: string
    role: string
    email?: string
  }>
  deployments?: Array<{
    name: string
    classification: string
    environment: string
    scope: string
  }>
}

export function ComplianceDashboard({
  score,
  status,
  findings,
  assets,
  contacts,
  deployments,
}: ComplianceDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const findingMatrix = [
    { weight: "Critical" as const, implemented: 34, partial: 0, missing: 5 },
    { weight: "High" as const, implemented: 43, partial: 65, missing: 12 },
    { weight: "Medium" as const, implemented: 12, partial: 22, missing: 8 },
    { weight: "Low" as const, implemented: 43, partial: 45, missing: 15 },
    { weight: "Informational" as const, implemented: 55, partial: 2, missing: 3 },
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/20 text-red-400"
      case "high":
        return "bg-orange-500/20 text-orange-400"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400"
      case "low":
        return "bg-blue-500/20 text-blue-400"
      default:
        return "bg-slate-500/20 text-slate-400"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <XCircle className="h-4 w-4" />
      case "high":
        return <AlertCircle className="h-4 w-4" />
      case "medium":
        return <AlertCircle className="h-4 w-4" />
      case "low":
        return <CheckCircle2 className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Score */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-700 bg-slate-800 p-6">
          <p className="text-sm text-slate-400 mb-2">Overall Score</p>
          <div className="flex items-end gap-2">
            <div className="text-4xl font-bold text-emerald-400">{score}%</div>
            <span className="text-sm text-slate-400 mb-1">
              {status === "compliant" && "Compliant"}
              {status === "warning" && "Warning"}
              {status === "non-compliant" && "Non-Compliant"}
            </span>
          </div>
        </Card>

        {assets && (
          <Card className="border-slate-700 bg-slate-800 p-6">
            <p className="text-sm text-slate-400 mb-2">Total Assets</p>
            <div className="flex items-end gap-2">
              <div className="text-4xl font-bold text-white">{assets.total}</div>
              <span className={`text-sm mb-1 ${assets.trend < 0 ? "text-red-400" : "text-emerald-400"}`}>
                {assets.trend < 0 ? "↓" : "↑"} {Math.abs(assets.trend)}%
              </span>
            </div>
          </Card>
        )}

        <Card className="border-slate-700 bg-slate-800 p-6">
          <p className="text-sm text-slate-400 mb-2">Critical Findings</p>
          <div className="text-4xl font-bold text-red-400">
            {findings.filter((f) => f.severity === "critical").length}
          </div>
        </Card>

        <Card className="border-slate-700 bg-slate-800 p-6">
          <p className="text-sm text-slate-400 mb-2">Total Findings</p>
          <div className="text-4xl font-bold text-orange-400">{findings.length}</div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800 border border-slate-700">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="findings">Findings</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <FindingMatrix data={findingMatrix} />

          <div className="grid gap-6 md:grid-cols-2">
            <CircularProgress
              value={score}
              label="Compliance Score"
              sublabel="Based on assessment"
              trend={{ value: 23, direction: "up" }}
              size="md"
            />
            <CircularProgress
              value={findings.length}
              max={100}
              label="Finding Distribution"
              sublabel="151 controls"
              trend={{ value: 23, direction: "down" }}
              size="md"
            />
          </div>
        </TabsContent>

        <TabsContent value="findings" className="space-y-4">
          {findings.map((finding) => (
            <Card key={finding.id} className="border-slate-700 bg-slate-800 p-4">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded ${getSeverityColor(finding.severity)}`}>
                  {getSeverityIcon(finding.severity)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-white">{finding.title}</h4>
                    <Badge className={getSeverityColor(finding.severity)}>{finding.severity}</Badge>
                  </div>
                  <p className="text-sm text-slate-400 mb-2">{finding.description}</p>
                  {finding.regulation && <p className="text-xs text-slate-500">Regulation: {finding.regulation}</p>}
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          {contacts && contacts.length > 0 && (
            <Card className="border-slate-700 bg-slate-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-blue-400" />
                <h3 className="font-semibold text-white">Contacts</h3>
              </div>
              <div className="space-y-3">
                {contacts.map((contact, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-700/50 rounded">
                    <div>
                      <p className="font-medium text-white">{contact.name}</p>
                      <p className="text-sm text-slate-400">{contact.role}</p>
                    </div>
                    {contact.email && (
                      <a href={`mailto:${contact.email}`} className="text-blue-400 hover:text-blue-300">
                        {contact.email}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {deployments && deployments.length > 0 && (
            <Card className="border-slate-700 bg-slate-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <LinkIcon className="h-5 w-5 text-emerald-400" />
                <h3 className="font-semibold text-white">Deployments</h3>
              </div>
              <div className="space-y-3">
                {deployments.map((deployment, idx) => (
                  <div key={idx} className="p-3 bg-slate-700/50 rounded">
                    <p className="font-medium text-white mb-2">{deployment.name}</p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-slate-400">Classification</p>
                        <p className="text-slate-300">{deployment.classification}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Environment</p>
                        <p className="text-slate-300">{deployment.environment}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Scope</p>
                        <p className="text-slate-300">{deployment.scope}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
