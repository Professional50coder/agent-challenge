import { useState } from 'react';
import { z } from 'zod';
import { ComplianceQuestion, RiskLevel } from '@/mastra/schemas/compliance';

interface QuestionnaireProps {
  questions: Array<z.infer<typeof ComplianceQuestion>>;
  onAnswer: (questionId: string, answer: 'Yes' | 'No' | 'N/A', evidence?: string[]) => void;
}

export function ComplianceQuestionnaire({ questions, onAnswer }: QuestionnaireProps) {
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<{ [key: string]: string[] }>({});
  const [comments, setComments] = useState<{ [key: string]: string }>({});

  const handleAnswer = (questionId: string, value: 'Yes' | 'No' | 'N/A') => {
    onAnswer(questionId, value, evidence[questionId]);
  };

  const addEvidence = (questionId: string, files: FileList | null) => {
    if (!files) return;
    // In a real implementation, this would upload files and store URLs
    setEvidence(prev => ({
      ...prev,
      [questionId]: [...(prev[questionId] || []), ...Array.from(files).map(f => f.name)]
    }));
  };

  return (
    <div className="space-y-6">
      {questions.map(question => (
        <div key={question.id} className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-start space-x-4">
            {/* Risk Level Badge */}
            <div className={`px-3 py-1 rounded-full text-sm ${getRiskLevelStyles(question.weight)}`}>
              {question.weight}
            </div>

            {/* Question Content */}
            <div className="flex-1">
              <h3 className="text-lg font-medium mb-4">{question.text}</h3>

              {/* Answer Options */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  {['Yes', 'No', 'N/A'].map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option}
                        onChange={() => handleAnswer(question.id, option as 'Yes' | 'No' | 'N/A')}
                        className="form-radio"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>

                {/* Evidence Upload */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Evidence
                  </label>
                  <div className="mt-1 flex items-center space-x-4">
                    <input
                      type="file"
                      multiple
                      onChange={(e) => addEvidence(question.id, e.target.files)}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                  </div>
                  {/* Evidence List */}
                  {evidence[question.id]?.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {evidence[question.id].map((file, idx) => (
                        <div key={idx} className="text-sm text-gray-600 flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>{file}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Comments */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Comments
                  </label>
                  <textarea
                    value={comments[question.id] || ''}
                    onChange={(e) => setComments(prev => ({
                      ...prev,
                      [question.id]: e.target.value
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper function for risk level styling
function getRiskLevelStyles(level: typeof RiskLevel['_type']): string {
  const styles = {
    Critical: 'bg-red-100 text-red-800',
    High: 'bg-orange-100 text-orange-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    Low: 'bg-blue-100 text-blue-800',
    Informational: 'bg-gray-100 text-gray-800',
  };
  return styles[level as keyof typeof styles] || styles.Informational;
}