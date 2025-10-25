interface CircularProgressProps {
  value: number
  max?: number
  label: string
  sublabel?: string
  trend?: { value: number; direction: "up" | "down" }
  size?: "sm" | "md" | "lg"
}

export function CircularProgress({ value, max = 100, label, sublabel, trend, size = "md" }: CircularProgressProps) {
  const percentage = (value / max) * 100
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const sizeClasses = {
    sm: "w-24 h-24",
    md: "w-32 h-32",
    lg: "w-40 h-40",
  }

  const textSizeClasses = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-5xl",
  }

  const getColor = () => {
    if (percentage >= 80) return "#10b981" // emerald
    if (percentage >= 60) return "#3b82f6" // blue
    if (percentage >= 40) return "#f59e0b" // amber
    return "#ef4444" // red
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={`relative ${sizeClasses[size]}`}>
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle cx="50" cy="50" r="45" fill="none" stroke="#334155" strokeWidth="8" />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={getColor()}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`font-bold text-white ${textSizeClasses[size]}`}>{Math.round(percentage)}</div>
          {sublabel && <div className="text-xs text-slate-400">{sublabel}</div>}
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-slate-300">{label}</p>
        {trend && (
          <p className={`text-xs mt-1 ${trend.direction === "up" ? "text-emerald-400" : "text-red-400"}`}>
            {trend.direction === "up" ? "↑" : "↓"} {Math.abs(trend.value)}%
          </p>
        )}
      </div>
    </div>
  )
}
