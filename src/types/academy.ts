import { Trade } from '@/types';

export type AcademyDomain = 
  | 'Market Knowledge' 
  | 'Technical Analysis' 
  | 'Fundamental Analysis'
  | 'Risk Management' 
  | 'Execution' 
  | 'Trading Psychology' 
  | 'Behavioral Finance'
  | 'Quantitative Analysis' 
  | 'Portfolio Management' 
  | 'Derivatives'
  | 'Macro Economics'
  | 'Market Microstructure'
  | 'Research'
  | 'Professional Practice';

export type CurriculumCategory =
  | 'MARKETS'
  | 'TRADING FUNDAMENTALS'
  | 'TECHNICAL ANALYSIS'
  | 'FUNDAMENTAL ANALYSIS'
  | 'RISK MANAGEMENT'
  | 'EXECUTION'
  | 'PSYCHOLOGY'
  | 'BEHAVIORAL FINANCE'
  | 'QUANTITATIVE TRADING'
  | 'DERIVATIVES'
  | 'MACRO'
  | 'MARKET MICROSTRUCTURE'
  | 'PORTFOLIO MANAGEMENT'
  | 'SYSTEMATIC TRADING'
  | 'INSTITUTIONAL TRADING';

export type AcademyDifficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Institutional';

export interface CurriculumFormula {
  name: string;
  expression: string;
  variables?: { symbol: string; meaning: string }[];
  notes?: string;
}

export interface CurriculumExample {
  scenario: string;
  analysis: string;
  outcome?: string;
}

export interface CurriculumCaseStudy {
  title: string;
  era?: string;
  overview: string;
  keyTakeaway: string;
}

export interface CurriculumConcept {
  id: string;
  title: string;
  category: CurriculumCategory;
  level: number; // 0 to 10
  difficulty: AcademyDifficulty;
  description: string;
  simpleExplanation: string; // Plain-English intuition / explain like I'm 10
  professionalDefinition: string; // Rigorous institutional definition
  prerequisites: string[]; // Concept IDs required before unlocking this concept
  relatedConcepts: string[]; // Concept IDs semantically related
  formulas?: CurriculumFormula[];
  examples: CurriculumExample[];
  artifacts?: LessonArtifact[];
  quizzes?: QuizQuestion[];
  caseStudies?: CurriculumCaseStudy[];
  commonMistakes: string[];
  learningObjectives: string[];
  estimatedLearningTime: number; // in minutes
  domain?: AcademyDomain; // legacy compatibility mapping
}

export type ConceptStatus = 'completed' | 'in-progress' | 'unlocked' | 'locked';

export interface ConceptDependencyNode {
  id: string;
  title: string;
  category: CurriculumCategory;
  level: number;
  prerequisites: string[];
  dependents: string[];
  status: ConceptStatus;
  missingPrerequisites: string[];
}

export interface ConceptDependencyGraph {
  nodes: Record<string, ConceptDependencyNode>;
  adjacencyList: Record<string, string[]>; // conceptId -> dependent conceptIds
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex?: number;
  correctAnswerIndex?: number;
  explanation: string;
  type?: 'conceptual' | 'numerical' | 'scenario' | 'chart';
  hint?: string;
  scenarioContext?: string;
}

export interface LessonArtifact {
  type: 
    | 'risk-diagram' 
    | 'equity-drawdown' 
    | 'expected-value' 
    | 'market-structure' 
    | 'options-payoff' 
    | 'normal-distribution' 
    | 'correlation-explorer' 
    | 'compounding-simulator' 
    | 'order-book-depth' 
    | 'formula-card'
    | 'portfolio-weights';
  title: string;
  description: string;
  defaultConfig?: Record<string, any>;
}

export interface Lesson {
  id: string;
  level: number; // 0 to 10
  title: string;
  slug: string;
  domain: AcademyDomain;
  difficulty: AcademyDifficulty;
  estimatedMinutes: number;
  prerequisites: string[]; // lesson ids
  objectives: string[];
  learningObjectives?: string[];
  
  // Section A: What is it?
  whatIsIt: string;
  description?: string;
  
  // Section B: Professional Definition
  professionalDefinition: string;
  
  // Section C: Why Does It Matter?
  whyItMatters: string;
  
  // Section D: Visual Explanation & Artifacts
  visualExplanation: string;
  artifact?: LessonArtifact;
  
  // Section E: Numerical Example
  numericalExample?: {
    setup: string;
    calculation: string;
    result: string;
    takeaway: string;
  };
  
  // Section F: Trading Example
  tradingExample: {
    context: string;
    scenario: string;
    outcome: string;
  };
  
  // Section G: Professional Perspective
  professionalPerspective: string;
  
  // Section H: Common Mistakes
  commonMistakes: string[];
  
  // Section I: Practice Exercise
  practiceExercise?: {
    prompt: string;
    solution: string;
    hint: string;
  };
  
  // Section J: Quiz
  quiz: QuizQuestion[];
  quizQuestions?: QuizQuestion[];
  
  // Section K: Mastery Check
  masteryCriteria: string;

  // Additional educational perspectives
  explainLikeIm10?: string;
  explainWithNumbers?: string;
  challengeQuestion?: string;
  deeperAnalysis?: string;
  
  // Formula if applicable
  formula?: {
    name: string;
    latex?: string;
    expression: string;
    variables: { symbol: string; meaning: string }[];
    notes?: string;
  };
  
  relatedConceptIds: string[];
}

export interface AcademyConcept {
  id: string;
  name: string;
  title?: string;
  level: number;
  domain: AcademyDomain;
  difficulty: AcademyDifficulty;
  shortDefinition: string;
  summary?: string;
  professionalDefinition: string;
  whyItMatters: string;
  formula?: string;
  mathematicalFormula?: string;
  numericalExample?: string;
  tradingExample?: string;
  institutionalPerspective?: string;
  institutionalInsight?: string;
  commonMistakes?: string[];
  commonPitfall?: string;
  explainLikeIm10?: string;
  explainWithNumbers?: string;
  prerequisites: string[];
  relatedConceptIds: string[];
  lessonId?: string;
}

export interface LevelInfo {
  level: number;
  title: string;
  subtitle: string;
  description: string;
  objective?: string;
  domainFocus: AcademyDomain[];
  difficulty: AcademyDifficulty;
  topicsCovered: string[];
  prerequisiteLevel?: number;
  learningOutcomes: string[];
}

export interface CaseStudy {
  id: string;
  title: string;
  subtitle: string;
  dateOrEra: string;
  marketAsset: string;
  domain: AcademyDomain;
  difficulty: AcademyDifficulty;
  context: string;
  marketConditions: string;
  availableInformation: string[];
  decisionPoint: string;
  choices: {
    id: string;
    label: string;
    description: string;
    isInstitutionalBestPractice: boolean;
    consequence: string;
  }[];
  consequencesSummary: string;
  professionalAnalysis: string;
  lessonsLearned: string[];
  chartData?: {
    time: string;
    price: number;
    benchmark?: number;
    volume?: number;
    annotation?: string;
  }[];
}

export interface Flashcard {
  id: string;
  level: number;
  domain: AcademyDomain;
  front: string;
  back: string;
  example?: string;
  formula?: string;
  mnemonic?: string;
}

export interface TradingFormula {
  id: string;
  name: string;
  domain: AcademyDomain;
  expression: string;
  description: string;
  variables: { symbol: string; label: string; defaultValue: number; unit?: string }[];
  calculate: (inputs: Record<string, number>) => number;
  formatResult: (value: number) => string;
  interpretation: string;
}

export interface GlossaryTerm {
  term: string;
  domain: AcademyDomain;
  level: number;
  definition: string;
  institutionalContext?: string;
  relatedTerms?: string[];
}

export interface UserAcademyProgress {
  currentLevel: number;
  overallMastery: number; // 0 to 100
  domainMastery: Record<AcademyDomain, number>; // 0 to 100
  completedLessons: string[]; // lesson ids
  masteredConcepts: string[]; // concept ids
  quizAttempts: Record<string, { attempts: number; bestScore: number; lastScore: number }>;
  bookmarkedLessons: string[];
  bookmarkedConcepts: string[];
  personalNotes: Record<string, string>; // entityId -> note
  mistakeBank: {
    questionId: string;
    questionText: string;
    domain: AcademyDomain;
    userChoice: string;
    correctAnswer: string;
    explanation: string;
    reviewed: boolean;
    dateAdded: string;
  }[];
  learningStreakDays: number;
  lastActiveDate: string;
  dailyGoalMinutes: number;
  todayMinutesSpent: number;
  weeklyGoalLessons?: number;
  weeklyGoalMinutes?: number;
  placementTestCompleted: boolean;
  placementTestResult?: {
    assessedLevel: number;
    recommendedStartingLevel: number;
    domainScores: Record<AcademyDomain, number>;
    completedAt: string;
  };
}

export interface PlacementResult {
  assessedLevel: number;
  recommendedStartingLevel: number;
  domainScores: Record<AcademyDomain, number>;
  confidence?: 'Preliminary' | 'Moderate' | 'High' | string;
  strengths?: AcademyDomain[];
  weaknesses?: AcademyDomain[];
  recommendedLessonIds?: string[];
  completedAt?: string;
}

export type AcademyNavTab = 
  | 'overview' 
  | 'levels' 
  | 'labs' 
  | 'case-studies' 
  | 'competency' 
  | 'tools' 
  | 'ai-tutor';

export type AcademyLabId = 
  | 'risk-lab' 
  | 'quant-lab' 
  | 'execution-lab' 
  | 'portfolio-lab' 
  | 'psychology-lab';
