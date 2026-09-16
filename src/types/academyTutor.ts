import { AcademyDomain, Lesson, AcademyConcept } from '@/types/academy';

export type TutorMode = 'BEGINNER' | 'INTERMEDIATE' | 'PROFESSIONAL' | 'QUANT';

export type EpistemicClassification = 
  | 'FACT' 
  | 'ASSUMPTION' 
  | 'EXAMPLE' 
  | 'SIMULATION' 
  | 'HISTORICAL OBSERVATION' 
  | 'HYPOTHESIS';

export type MethodologyStep = 
  | 'EXPLAIN' 
  | 'VISUALIZE' 
  | 'EXAMPLE' 
  | 'CALCULATE' 
  | 'PRACTICE' 
  | 'TEST' 
  | 'CORRECT' 
  | 'REINFORCE' 
  | 'RECOMMEND';

export type TutorCommandId = 
  | 'EXPLAIN_SIMPLY'
  | 'EXPLAIN_NUMBERS'
  | 'SHOW_EXAMPLE'
  | 'COUNTEREXAMPLE'
  | 'COMPARE'
  | 'TEST_ME'
  | 'CHALLENGE_ME'
  | 'EXPLAIN_MISTAKE'
  | 'WHAT_NEXT'
  | 'TEACH_DEEPER';

export interface TutorCommandDef {
  id: TutorCommandId;
  label: string;
  phrase: string;
  description: string;
  iconName: string;
}

export interface InteractiveQuizPayload {
  questionId: string;
  conceptId?: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  misconceptionMap?: Record<number, string>; // why specific wrong choices were selected
  similarFollowUpQuestion?: {
    questionText: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
  };
}

export interface CalculationStep {
  stepNumber: number;
  label: string;
  formula: string;
  plugIn: string;
  result: string;
}

export interface RemediationState {
  originalQuestionId: string;
  userWrongChoiceIndex: number;
  misconceptionIdentified: string;
  whyIncorrect: string;
  correctReasoning: string;
  reTestQuestion: {
    questionText: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
  };
  reTestAnswered?: boolean;
  reTestUserChoiceIndex?: number;
  reTestPassed?: boolean;
}

export interface EpistemicStatement {
  type: EpistemicClassification;
  text: string;
}

export interface TutorMessageSection {
  methodologyStep: MethodologyStep;
  heading?: string;
  content: string;
  epistemicType?: EpistemicClassification;
  calculationSteps?: CalculationStep[];
  asciiVisualization?: string;
  interactiveQuiz?: InteractiveQuizPayload;
  remediation?: RemediationState;
}

export interface TutorChatMessage {
  id: string;
  sender: 'tutor' | 'user';
  text?: string;
  sections?: TutorMessageSection[];
  timestamp: string;
  modeAtGeneration?: TutorMode;
  conceptInFocus?: {
    id: string;
    title: string;
    level: number;
    domain: AcademyDomain;
  };
  suggestedFollowUpCommands?: TutorCommandId[];
  isSafetyRefusal?: boolean;
}

export interface UserAcademicProfile {
  level: number;
  masteryPct: number;
  completedLessonsCount: number;
  completedLessonIds: string[];
  unreviewedMistakesCount: number;
  weakestDomains: { domain: AcademyDomain; score: number }[];
  recentMistakes: {
    questionId: string;
    questionText: string;
    domain: AcademyDomain;
    explanation: string;
  }[];
  placementCompleted: boolean;
}
