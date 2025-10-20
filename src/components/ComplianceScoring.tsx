import { useState } from 'react';
import { Assessment, Finding, RiskLevel } from '@/mastra/schemas/compliance';

const riskLevelColors = {
  Critical: 'bg-red-600',
  High: 'bg-orange-500',
  Medium: 'bg-yellow-500',
  Low: 'bg-blue-400',
  Informational: 'bg-gray-400',
};

interface ScoringProps {
  assessment: Assessment;
}

export function ComplianceScoring({ assessment }: ScoringProps) {
  const { overallScore, statistics, findings } = assessment;
  
  // Calculate grade based on score (like in the UI image)
  const getGrade = (score: number) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  return (
    <div className="space-y-8">
      {/* Overall Score Display */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Overall Compliance Score</h2>
        <div className="flex items-center space-x-4">
          <div className="text-5xl font-bold">{overallScore}%</div>
          <div className={`text-3xl px-4 py-2 rounded ${
            overallScore >= 70 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
          }`}>
            {getGrade(overallScore)}
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          title="Implementation" 
          value={statistics.implemented}
          total={statistics.implemented + statistics.partial + statistics.missing}
          color="bg-green-500"
        />
        <StatCard 
          title="Critical Findings" 
          value={statistics.criticalCount}
          color="bg-red-500"
        />
        <StatCard 
          title="High Risk" 
          value={statistics.highCount}
          color="bg-orange-500"
        />
        <StatCard 
          title="Medium Risk" 
          value={statistics.mediumCount}
          color="bg-yellow-500"
        />
      </div>

      {/* Findings Matrix (like in the UI) */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Finding Matrix</h2>
        <div className="space-y-3">
          {Object.entries(riskLevelColors).map(([level, color]) => (
            <div key={level} className="flex items-center space-x-2">
              <span className="w-24">{level}</span>
              <div className="flex-1 h-8 bg-gray-100 rounded-md overflow-hidden">
                <div 
                  className={`h-full ${color}`}
                  style={{ 
                    width: `${getFindingPercentage(findings, level as typeof RiskLevel['_type'])}%` 
                  }}
                />
              </div>
              <span className="w-16 text-right">
                {getFindingCount(findings, level as typeof RiskLevel['_type'])}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper component for stat cards
function StatCard({ 
  title, 
  value, 
  total, 
  color 
}: { 
  title: string; 
  value: number; 
  total?: number;
  color: string;
}) {
  const percentage = total ? Math.round((value / total) * 100) : null;
  
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="text-sm text-gray-600">{title}</div>
      <div className="mt-2 flex items-baseline">
        <div className="text-2xl font-semibold">{value}</div>
        {percentage !== null && (
          <div className="ml-2 text-sm text-gray-500">
            ({percentage}%)
          </div>
        )}
      </div>
      <div className={`h-1 mt-2 rounded-full ${color}`} />
    </div>
  );
}

// Helper functions for findings
function getFindingCount(findings: Finding[], level: typeof RiskLevel['_type']): number {
  return findings.filter(f => f.riskLevel === level).length;
}

function getFindingPercentage(findings: Finding[], level: typeof RiskLevel['_type']): number {
  const count = getFindingCount(findings, level);
  return findings.length ? Math.round((count / findings.length) * 100) : 0;
}