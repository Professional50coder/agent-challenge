"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, Check, Clock } from "lucide-react";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { useCoAgent } from "@copilotkit/react-core";
import { ComplianceScoring } from "@/components/ComplianceScoring";
import { ComplianceQuestionnaire } from "@/components/ComplianceQuestionnaire";
import { ComplianceQuestion } from "@/mastra/schemas/compliance";
import { KPICard } from "@/components/ui/kpi-card";
import { Flashcard } from "@/components/ui/flashcard";
import { z } from "zod";

export default function ComplianceAssessment() {
  const [assessment, setAssessment] = useState({
    overallScore: 78,
    findings: [],
    statistics: {
      implemented: 34,
      partial: 12,
      missing: 8,
      notAssessed: 2,
      criticalCount: 2,
      highCount: 5,
      mediumCount: 8,
      lowCount: 15,
    },
    metadata: {
      assessmentDate: new Date().toISOString(),
      assessmentType: "Initial",
      assessor: "Crypto Compliance Agent",
      framework: "FATF",
    },
  });

  const [questions] = useState<Array<z.infer<typeof ComplianceQuestion>>>([
    {
      id: "1",
      text: "Does the project implement proper KYC/AML procedures?",
      weight: "Critical" as const,
      category: "Identity & Access",
      subCategory: "KYC/AML",
    },
    {
      id: "2",
      text: "Are there mechanisms to prevent money laundering?",
      weight: "High" as const,
      category: "Security",
      subCategory: "Anti-Money Laundering",
    },
  ]);

  const { state, setState } = useCoAgent<{
    answers: Record<string, { answer: string; evidence?: string[] }>;
  }>({
    name: "cryptoAgent",
    initialState: {
      answers: {},
    },
  });

  const handleAnswer = (
    questionId: string,
    answer: "Yes" | "No" | "N/A",
    evidence?: string[]
  ) => {
    setState({
      answers: {
        ...state.answers,
        [questionId]: { answer, evidence }
      }
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-8"
      >
        <h1 className="text-4xl font-bold mb-8">Crypto Compliance Assessment</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Overall Score"
            value={`${assessment.statistics.implemented}%`}
            icon={Shield}
            trend={{ value: 5, isPositive: true }}
          />
          <KPICard
            title="Critical Findings"
            value={assessment.statistics.criticalCount}
            icon={AlertTriangle}
            className="bg-red-50"
          />
          <KPICard
            title="Completed"
            value={assessment.statistics.implemented}
            icon={Check}
            className="bg-green-50"
          />
          <KPICard
            title="Pending"
            value={assessment.statistics.notAssessed}
            icon={Clock}
            className="bg-blue-50"
          />
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">Compliance Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {questions.map((question) => (
              <Flashcard
                key={question.id}
                front={
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">{question.text}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {question.weight}
                    </span>
                  </div>
                }
                back={
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Category: {question.category}
                    </p>
                    <p className="text-sm text-gray-600">
                      Subcategory: {question.subCategory}
                    </p>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-green-100 text-green-800 rounded-md">
                        Yes
                      </button>
                      <button className="px-3 py-1 bg-red-100 text-red-800 rounded-md">
                        No
                      </button>
                      <button className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md">
                        N/A
                      </button>
                    </div>
                  </div>
                }
              />
            ))}
          </div>
        </div>

        <div className="mt-12">
          <ComplianceScoring assessment={assessment} />
          <ComplianceQuestionnaire questions={questions} onAnswer={handleAnswer} />
        </div>
      </motion.div>

      {/* Copilot Sidebar */}
      <CopilotSidebar
        defaultOpen={true}
        labels={{
          title: "Compliance Assessment Assistant",
          initial: `👋 Hi! I'm your Crypto Compliance Assistant. I can help you:

- Assess your project's compliance with regulations
- Verify specific compliance claims
- Generate recommendations for improvements
- Calculate risk scores and metrics

Let me know what you'd like to evaluate!`
        }}
      />
    </div>
  );
}