import { Card } from "@/components/ui/card"

interface FindingMatrixData {
  weight: "Critical" | "High" | "Medium" | "Low" | "Informational"
  implemented: number
  partial: number
  missing: number
}

interface FindingMatrixProps {
  data: FindingMatrixData[]
}

export function FindingMatrix({ data }: FindingMatrixProps) {
  const getWeightColor = (weight: string) => {
    switch (weight) {
      case "Critical":
        return "text-red-400"
      case "High":
        return "text-orange-400"
      case "Medium":
        return "text-yellow-400"
      case "Low":
        return "text-blue-400"
      case "Informational":
        return "text-slate-400"
      default:
        return "text-slate-400"
    }
  }

  const getStatusColor = (status: "implemented" | "partial" | "missing") => {
    switch (status) {
      case "implemented":
        return "bg-emerald-500/20 text-emerald-400"
      case "partial":
        return "bg-orange-500/20 text-orange-400"
      case "missing":
        return "bg-red-500/20 text-red-400"
      default:
        return "bg-slate-500/20 text-slate-400"
    }
  }

  return (
    <Card className="border-slate-700 bg-slate-800 p-6">
      <h3 className="font-semibold text-white mb-4">Finding Matrix</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-4 text-slate-400 font-medium">Question Weight</th>
              <th className="text-center py-3 px-4 text-slate-400 font-medium">Implemented</th>
              <th className="text-center py-3 px-4 text-slate-400 font-medium">Partial</th>
              <th className="text-center py-3 px-4 text-slate-400 font-medium">Missing</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                <td className={`py-3 px-4 font-medium ${getWeightColor(row.weight)}`}>{row.weight}</td>
                <td className="text-center py-3 px-4">
                  <span
                    className={`inline-flex items-center justify-center w-12 h-10 rounded ${getStatusColor("implemented")}`}
                  >
                    {row.implemented}
                  </span>
                </td>
                <td className="text-center py-3 px-4">
                  <span
                    className={`inline-flex items-center justify-center w-12 h-10 rounded ${getStatusColor("partial")}`}
                  >
                    {row.partial}
                  </span>
                </td>
                <td className="text-center py-3 px-4">
                  <span
                    className={`inline-flex items-center justify-center w-12 h-10 rounded ${getStatusColor("missing")}`}
                  >
                    {row.missing}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
