import { AcademyDomain } from './academy';

export type AssessmentQuestionType = 
  | 'multiple-choice'
  | 'numerical'
  | 'scenario'
  | 'chart-interpretation'
  | 'risk-calculation'
  | 'execution-decision';

export type EducationalMasteryState = 
  | 'Not Started'
  | 'Learning'
  | 'Practicing'
  | 'Developing'
  | 'Proficient'
  | 'Strong';

export interface ChartContextData {
  type: 'candlestick-pattern' | 'market-structure-swing' | 'order-book-depth' | 'risk-ladder' | 'volume-profile' | 'equity-curve' | 'drawdown-chart' | 'probability-distribution' | 'correlation-matrix';
  caption: string;
  elements: {
    label?: string;
    points?: { x: number; y: number }[];
    points2?: { x: number; y: number }[];
    candles?: { open: number; high: number; low: number; close: number; time?: string }[];
    levels?: { price: number; type: 'support' | 'resistance' | 'entry' | 'stop' | 'target'; label: string }[];
    orderRows?: { side: 'bid' | 'ask'; price: number; size: number; total: number }[];
    distribution?: { value: number; count: number }[];
    correlationData?: { assetA: string; assetB: string; value: number }[];
  };
}

export interface AssessmentQuestion {
  id: string;
  domain: AcademyDomain;
  targetLevel: number; // 0 to 10
  type: AssessmentQuestionType;
  question: string;
  context?: string;
  chartData?: ChartContextData;
  options: string[];
  correctIndex: number;
  explanation: string;
  skillEvaluated: string;
  practicalApplication?: string;
}

export interface DomainAssessmentScore {
  domain: AcademyDomain;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  masteryState: EducationalMasteryState;
}

export interface ReassessmentDifferential {
  domain: AcademyDomain;
  previousScore: number;
  currentScore: number;
  scoreDelta: number; // e.g. +20 or -10
  improved: boolean;
  statusText: string;
}

export interface AssessmentResult {
  id: string;
  timestamp: string;
  assessedLevel: number;
  recommendedStartingLevel: number;
  overallAccuracy: number;
  confidenceLevel: 'Preliminary' | 'Moderate' | 'High';
  domainScores: Record<AcademyDomain, number>;
  domainDetails: Record<AcademyDomain, DomainAssessmentScore>;
  strongestDomain: AcademyDomain;
  weakestDomain: AcademyDomain;
  strengths: AcademyDomain[];
  weaknesses: AcademyDomain[];
  recommendedLessonIds: string[];
  answers: Record<string, number>;
  // Differential analysis compared to previous attempt (if reassessment)
  isReassessment?: boolean;
  differentials?: ReassessmentDifferential[];
  improvedDomains?: { domain: AcademyDomain; diff: number }[];
  remainingWeaknesses?: AcademyDomain[];
  recommendedNextStudy?: { lessonId: string; title: string; domain: AcademyDomain; reason: string }[];
}

export function getMasteryState(percentage: number): EducationalMasteryState {
  if (percentage <= 0) return 'Not Started';
  if (percentage < 25) return 'Learning';
  if (percentage < 50) return 'Practicing';
  if (percentage < 70) return 'Developing';
  if (percentage < 85) return 'Proficient';
  return 'Strong';
}

export function getMasteryBadgeColor(state: EducationalMasteryState): {
  bg: string;
  text: string;
  border: string;
} {
  switch (state) {
    case 'Not Started':
      return {
        bg: 'bg-slate-100 dark:bg-slate-800',
        text: 'text-slate-600 dark:text-slate-400',
        border: 'border-slate-200 dark:border-slate-700'
      };
    case 'Learning':
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-200 dark:border-amber-800'
      };
    case 'Practicing':
      return {
        bg: 'bg-blue-50 dark:bg-blue-950/40',
        text: 'text-blue-700 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-800'
      };
    case 'Developing':
      return {
        bg: 'bg-indigo-50 dark:bg-indigo-950/40',
        text: 'text-indigo-700 dark:text-indigo-300',
        border: 'border-indigo-200 dark:border-indigo-800'
      };
    case 'Proficient':
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-200 dark:border-emerald-800'
      };
    case 'Strong':
      return {
        bg: 'bg-purple-50 dark:bg-purple-950/40',
        text: 'text-purple-700 dark:text-purple-300',
        border: 'border-purple-200 dark:border-purple-800'
      };
  }
}
