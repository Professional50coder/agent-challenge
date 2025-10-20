import { z } from 'zod';

// Risk levels matching the UI's finding matrix
export const RiskLevel = z.enum(['Critical', 'High', 'Medium', 'Low', 'Informational']);
export type RiskLevel = z.infer<typeof RiskLevel>;

// Implementation status (from the donut charts)
export const ImplementationStatus = z.enum(['Implemented', 'Partial', 'Missing', 'NotAssessed']);
export type ImplementationStatus = z.infer<typeof ImplementationStatus>;

// Compliance finding schema
export const ComplianceFinding = z.object({
  id: z.string(),
  title: z.string(),
  riskLevel: RiskLevel,
  status: ImplementationStatus,
  details: z.string(),
  evidence: z.array(z.string()),
  recommendations: z.array(z.string()),
  dateAssessed: z.string(),
  score: z.number().min(0).max(100),
});

// Assessment results (matches UI scoring)
export const AssessmentResult = z.object({
  overallScore: z.number().min(0).max(100),
  findings: z.array(ComplianceFinding),
  statistics: z.object({
    implemented: z.number(),
    partial: z.number(),
    missing: z.number(),
    notAssessed: z.number(),
    criticalCount: z.number(),
    highCount: z.number(),
    mediumCount: z.number(),
    lowCount: z.number(),
  }),
  metadata: z.object({
    assessmentDate: z.string(),
    assessmentType: z.string(),
    assessor: z.string(),
    framework: z.string().default('FATF'),
  }),
});

// Question types from the assessment UI
export const ComplianceQuestion = z.object({
  id: z.string(),
  text: z.string(),
  weight: RiskLevel,
  category: z.string(),
  subCategory: z.string().optional(),
  evidence: z.array(z.string()).optional(),
  comments: z.array(z.string()).optional(),
});

export type Finding = z.infer<typeof ComplianceFinding>;
export type Assessment = z.infer<typeof AssessmentResult>;
export type Question = z.infer<typeof ComplianceQuestion>;