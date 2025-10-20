import { useState } from 'react';
import { useCoAgent } from "@copilotkit/react-core";
import { ComplianceScoring } from '@/components/ComplianceScoring';
import { ComplianceQuestionnaire } from '@/components/ComplianceQuestionnaire';
import type { Assessment, Question } from '@/mastra/schemas/compliance';

const EXAMPLE_QUESTIONS: Question[] = [
  {
    id: '1',
    text: 'Is the institution\'s information security program based on a risk assessment that identifies reasonably foreseeable internal and external risks?',
    weight: 'Critical',
    category: 'Risk Assessment',
    subCategory: 'Program Foundation'
  },
  {
    id: '2',
    text: 'Have you developed, implemented, and do you maintain a comprehensive information security program?',
    weight: 'High',
    category: 'Security Program',
  },
  // Add more questions based on the UI screenshots
];

export default function CompliancePage() {
  const [assessment, setAssessment] = useState<Assessment>({
    overallScore: 73,
    findings: [],
    statistics: {
      implemented: 34,
      partial: 43,
      missing: 12,
      notAssessed: 2,
      criticalCount: 3,
      highCount: 5,
      mediumCount: 8,
      lowCount: 12,
    },
    metadata: {
      assessmentDate: new Date().toISOString(),
      assessmentType: 'Initial',
      assessor: 'Crypto Compliance Agent',
      framework: 'FATF',
    }
  });

  const { state, setState } = useCoAgent<{
    currentAssessment?: Assessment;
    answers: Record<string, any>;
  }>({
    name: "cryptoAgent",
    initialState: {
      answers: {},
    },
  });

  const handleAnswer = async (questionId: string, answer: 'Yes' | 'No' | 'N/A', evidence?: string[]) => {
    // Update local state
    const newAnswers = {
      ...state.answers,
      [questionId]: { answer, evidence }
    };

    // Update agent state
    setState({
      ...state,
      answers: newAnswers
    });

    // In a real implementation, we'd call the agent to:
    // 1. Verify any claims made
    // 2. Update the assessment score
    // 3. Generate new findings based on the answer
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900">
            Crypto Compliance Assessment
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Complete the assessment below to evaluate your project's compliance status.
          </p>
        </div>

        {/* Score Overview */}
        <div className="mb-12">
          <ComplianceScoring assessment={assessment} />
        </div>

        {/* Assessment Questionnaire */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Assessment Questions</h2>
          <ComplianceQuestionnaire
            questions={EXAMPLE_QUESTIONS}
            onAnswer={handleAnswer}
          />
        </div>
      </div>
    </main>
  );
}