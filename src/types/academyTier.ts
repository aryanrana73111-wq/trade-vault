export type AcademyTier = 'NORMAL' | 'MAX' | 'ULTRA';

export type MaxDomain =
  | 'Market Fundamentals'
  | 'Chart Reading & Technical'
  | 'Orders & Execution'
  | 'Risk Management'
  | 'Strategy & Styles'
  | 'Fundamental & Macro'
  | 'Trading Psychology'
  | 'Quantitative Thinking'
  | 'Portfolio Management'
  | 'Professional Concepts';

export interface MaxConceptItem {
  id: string; // e.g. C001, C051
  title: string;
  domain: MaxDomain;
  level: number; // 0 to 10
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Institutional';
  estimatedMinutes: number;
  subtitle: string;
  simpleExplanation: string;
  professionalExplanation: string;
  formulas: {
    name: string;
    expression: string;
    description: string;
    example: string;
  }[];
  expertNotes: string;
  mythVsEvidence: {
    myth: string;
    evidence: string;
    counterpoint?: string;
  };
  commonMistakes: string[];
  realScenario: {
    scenarioA: { title: string; desc: string; math: string };
    scenarioB: { title: string; desc: string; math: string };
    keyTakeaway: string;
  };
  resources: {
    type: 'Book' | 'Article' | 'Video' | 'Tool';
    title: string;
    authorOrSource: string;
    link?: string;
  }[];
  relatedConceptIds: string[];
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface RoadmapPhase {
  phase: number;
  title: string;
  timeframe: string;
  badgeColor: string;
  description: string;
  concepts: string[];
  resources: {
    type: 'book' | 'web' | 'video';
    name: string;
    source: string;
    url?: string;
  }[];
  milestone: string;
}

export interface MaxCaseStudy {
  id: string;
  number: number;
  title: string;
  setup: string;
  scenario: string;
  mathExplanation: string;
  realityOutcome: string;
  lesson: string;
  questions: string[];
  solution: string;
}

export interface MaxTradingMyth {
  id: number;
  myth: string;
  whyBelieved: string;
  math: string;
  verdict: string;
  calculatorShortcut?: string;
}

export interface BullBearDebate {
  id: number;
  topic: string;
  bullCase: {
    summary: string;
    points: string[];
  };
  bearCase: {
    summary: string;
    points: string[];
  };
  synthesis: string;
}

export interface UltraMasterclass {
  id: string; // MC01 - MC22
  number: number;
  title: string;
  lessonsCount: number;
  durationMinutes: number;
  prerequisite: string;
  category: string;
  description: string;
  lessons: {
    id: string;
    title: string;
    summary: string;
    durationMin: number;
  }[];
  includedCalculators: string[];
  researchPaperIds: string[];
  practicalAssignment: string;
}

export interface UltraResearchProject {
  id: string;
  title: string;
  hypothesis: string;
  asset: string;
  dataNeeded: string;
  testMethod: string;
  expectedOutcome: string;
  status: 'Formulating' | 'Data Gathering' | 'Analyzing' | 'Completed';
  findings?: string;
  pValue?: number;
  createdAt: string;
}

export interface UltraDecisionEntry {
  id: string;
  date: string;
  topic: string;
  hypothesis: string;
  evidenceFor: string;
  evidenceAgainst: string;
  assumptions: string;
  uncertainty: string;
  decision: string;
  reviewDate: string;
}

export interface UltraResearchPaper {
  id: string;
  title: string;
  authors: string;
  year: number;
  source: string;
  url: string;
  plainSummary: string;
  keyFinding: string;
  traderTakeaway: string;
  limitations: string;
  relatedConceptIds: string[];
}

export interface UltraBook {
  id: number;
  title: string;
  author: string;
  year: number;
  category: 'Psychology' | 'Technical' | 'Risk/Position' | 'Wisdom' | 'Quant' | 'Strategy' | 'Behavioral' | 'Academic' | 'India';
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Research';
  keyLesson: string;
  whyRecommended: string;
  freeAlternative?: string;
  externalSearchQuery: string;
}

export interface FormulaCompendiumEntry {
  id: string;
  name: string;
  section: 'Risk & Sizing' | 'Performance' | 'Statistics' | 'Derivatives' | 'Portfolio Theory' | 'Indicators' | 'Macro';
  formula: string;
  variables: { symbol: string; meaning: string }[];
  workedExample: string;
  commonMistake: string;
  calculatorKey?: string;
}

export interface CompetencyTrack {
  id: string;
  code: string;
  name: string;
  targetRole: string;
  description: string;
  questionCount: number;
  scenariosCount: number;
  domainsCovered: string[];
  prerequisites: string;
  badgeName: string;
}
