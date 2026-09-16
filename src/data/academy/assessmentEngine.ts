import { AcademyDomain } from '@/types/academy';
import { 
  AssessmentQuestion, 
  AssessmentResult, 
  DomainAssessmentScore, 
  ReassessmentDifferential,
  getMasteryState 
} from '@/types/assessment';
import { COMPREHENSIVE_ASSESSMENT_QUESTIONS } from './assessmentQuestions';

const ALL_DOMAINS: AcademyDomain[] = [
  'Market Knowledge',
  'Technical Analysis',
  'Fundamental Analysis',
  'Risk Management',
  'Execution',
  'Trading Psychology',
  'Behavioral Finance',
  'Quantitative Analysis',
  'Portfolio Management',
  'Derivatives',
  'Macro Economics',
  'Market Microstructure',
  'Research',
  'Professional Practice'
];

export function evaluateAcademyAssessment(
  answers: Record<string, number>,
  previousResult?: AssessmentResult | null,
  questions: AssessmentQuestion[] = COMPREHENSIVE_ASSESSMENT_QUESTIONS
): AssessmentResult {
  // Tally domain questions and correct answers
  const domainStats: Record<AcademyDomain, { total: number; correct: number }> = {
    'Market Knowledge': { total: 0, correct: 0 },
    'Technical Analysis': { total: 0, correct: 0 },
    'Fundamental Analysis': { total: 0, correct: 0 },
    'Risk Management': { total: 0, correct: 0 },
    'Execution': { total: 0, correct: 0 },
    'Trading Psychology': { total: 0, correct: 0 },
    'Behavioral Finance': { total: 0, correct: 0 },
    'Quantitative Analysis': { total: 0, correct: 0 },
    'Portfolio Management': { total: 0, correct: 0 },
    'Derivatives': { total: 0, correct: 0 },
    'Macro Economics': { total: 0, correct: 0 },
    'Market Microstructure': { total: 0, correct: 0 },
    'Research': { total: 0, correct: 0 },
    'Professional Practice': { total: 0, correct: 0 }
  };

  let totalQuestions = 0;
  let totalCorrect = 0;
  let highestLevelEarned = 0;

  questions.forEach(q => {
    domainStats[q.domain].total += 1;
    totalQuestions += 1;

    const userAns = answers[q.id];
    if (userAns === q.correctIndex) {
      domainStats[q.domain].correct += 1;
      totalCorrect += 1;
      if (q.targetLevel > highestLevelEarned) {
        highestLevelEarned = q.targetLevel;
      }
    }
  });

  // Calculate scores per domain
  const domainScores: Record<AcademyDomain, number> = {
    'Market Knowledge': 0,
    'Technical Analysis': 0,
    'Fundamental Analysis': 0,
    'Risk Management': 0,
    'Execution': 0,
    'Trading Psychology': 0,
    'Behavioral Finance': 0,
    'Quantitative Analysis': 0,
    'Portfolio Management': 0,
    'Derivatives': 0,
    'Macro Economics': 0,
    'Market Microstructure': 0,
    'Research': 0,
    'Professional Practice': 0
  };

  const domainDetails: Record<AcademyDomain, DomainAssessmentScore> = {} as any;
  const strengths: AcademyDomain[] = [];
  const weaknesses: AcademyDomain[] = [];

  ALL_DOMAINS.forEach(domain => {
    const stat = domainStats[domain];
    const pct = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
    domainScores[domain] = pct;
    domainDetails[domain] = {
      domain,
      totalQuestions: stat.total,
      correctAnswers: stat.correct,
      percentage: pct,
      masteryState: getMasteryState(pct)
    };

    if (pct >= 75) {
      strengths.push(domain);
    } else if (pct < 60) {
      weaknesses.push(domain);
    }
  });

  const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  // Identify Strongest and Weakest domain
  let strongestDomain = ALL_DOMAINS[0];
  let weakestDomain = ALL_DOMAINS[0];
  let highestScore = -1;
  let lowestScore = 999;

  ALL_DOMAINS.forEach(d => {
    const score = domainScores[d];
    if (score > highestScore) {
      highestScore = score;
      strongestDomain = d;
    }
    if (score < lowestScore) {
      lowestScore = score;
      weakestDomain = d;
    }
  });

  // Calculate Assessed Level (0 to 10)
  let assessedLevel = 0;
  if (overallAccuracy >= 90) assessedLevel = Math.min(highestLevelEarned, 9);
  else if (overallAccuracy >= 75) assessedLevel = Math.min(highestLevelEarned, 6);
  else if (overallAccuracy >= 60) assessedLevel = Math.min(highestLevelEarned, 4);
  else if (overallAccuracy >= 40) assessedLevel = Math.min(highestLevelEarned, 2);
  else assessedLevel = 0;

  // Recommended starting level incorporates foundational safety checks
  let recommendedStartingLevel = assessedLevel;
  if (domainScores['Risk Management'] < 70 && recommendedStartingLevel > 3) {
    // Risk Management must be mastered before advancing to high-leverage or algorithmic topics
    recommendedStartingLevel = 3;
  } else if (domainScores['Market Knowledge'] < 50) {
    recommendedStartingLevel = 0;
  }

  // Recommended lessons targeted to weaknesses
  const recommendedLessonIds: string[] = [];
  if (domainScores['Risk Management'] < 75) {
    recommendedLessonIds.push('l3-position-sizing-mathematics', 'l3-drawdown-and-risk-of-ruin', 'l3-expected-value-and-edge');
  }
  if (domainScores['Technical Analysis'] < 75) {
    recommendedLessonIds.push('l4-market-structure-swings', 'l4-atr-and-volatility-stops');
  }
  if (domainScores['Execution'] < 75) {
    recommendedLessonIds.push('l2-order-types-execution', 'l6-market-microstructure-and-tca');
  }
  if (domainScores['Quantitative Analysis'] < 75) {
    recommendedLessonIds.push('l8-probability-distributions-and-monte-carlo', 'l5-strategy-modeling-monte-carlo');
  }
  if (domainScores['Trading Psychology'] < 75) {
    recommendedLessonIds.push('l7-loss-aversion-and-disposition-effect');
  }
  if (domainScores['Portfolio Management'] < 75) {
    recommendedLessonIds.push('l9-portfolio-construction-risk-parity');
  }
  if (domainScores['Professional Practice'] < 75) {
    recommendedLessonIds.push('l10-hedge-fund-research-workflow');
  }

  // Reassessment Differential Analysis (if prior attempt exists)
  const isReassessment = !!previousResult;
  let differentials: ReassessmentDifferential[] | undefined;
  let improvedDomains: { domain: AcademyDomain; diff: number }[] | undefined;
  let remainingWeaknesses: AcademyDomain[] | undefined;
  let recommendedNextStudy: { lessonId: string; title: string; domain: AcademyDomain; reason: string }[] | undefined;

  if (isReassessment && previousResult) {
    differentials = ALL_DOMAINS.map(domain => {
      const prev = previousResult.domainScores[domain] || 0;
      const curr = domainScores[domain];
      const delta = curr - prev;
      return {
        domain,
        previousScore: prev,
        currentScore: curr,
        scoreDelta: delta,
        improved: delta > 0,
        statusText: delta > 0 ? `+${delta}% Improvement` : delta < 0 ? `${delta}% Regression` : 'Unchanged'
      };
    });

    improvedDomains = differentials
      .filter(d => d.scoreDelta > 0)
      .map(d => ({ domain: d.domain, diff: d.scoreDelta }))
      .sort((a, b) => b.diff - a.diff);

    remainingWeaknesses = ALL_DOMAINS.filter(d => domainScores[d] < 60);

    // Build targeted "What should I study next?" curriculum links
    recommendedNextStudy = [];
    if (domainScores['Risk Management'] < 60) {
      recommendedNextStudy.push({
        lessonId: 'l3-position-sizing-mathematics',
        title: 'Position Sizing Mathematics & Fixed-Fractional Risk',
        domain: 'Risk Management',
        reason: 'Essential for surviving drawdown periods and keeping loss amounts constant.'
      });
    }
    if (domainScores['Execution'] < 60) {
      recommendedNextStudy.push({
        lessonId: 'l2-order-types-execution',
        title: 'Limit Orders, Market Microstructure & Slippage Control',
        domain: 'Execution',
        reason: 'Stops friction tax from eroding trading edge.'
      });
    }
    if (domainScores['Technical Analysis'] < 60) {
      recommendedNextStudy.push({
        lessonId: 'l4-market-structure-swings',
        title: 'Market Structure & Protected Swings Analysis',
        domain: 'Technical Analysis',
        reason: 'Eliminates counter-trend entries and false breakout traps.'
      });
    }
    if (domainScores['Quantitative Analysis'] < 60) {
      recommendedNextStudy.push({
        lessonId: 'l8-probability-distributions-and-monte-carlo',
        title: 'Fat-Tailed Distributions & Monte Carlo Stress Testing',
        domain: 'Quantitative Analysis',
        reason: 'Teaches true mathematical edge and statistical significance.'
      });
    }
    if (recommendedNextStudy.length === 0) {
      recommendedNextStudy.push({
        lessonId: 'l10-hedge-fund-research-workflow',
        title: 'Institutional Research Methodology & Strategy Governance',
        domain: 'Professional Practice',
        reason: 'Advance towards full institutional research discipline.'
      });
    }
  }

  return {
    id: `assessment-${Date.now()}`,
    timestamp: new Date().toISOString(),
    assessedLevel,
    recommendedStartingLevel,
    overallAccuracy,
    confidenceLevel: totalQuestions >= 10 ? 'High' : 'Moderate',
    domainScores,
    domainDetails,
    strongestDomain,
    weakestDomain,
    strengths,
    weaknesses,
    recommendedLessonIds: Array.from(new Set(recommendedLessonIds)),
    answers,
    isReassessment,
    differentials,
    improvedDomains,
    remainingWeaknesses,
    recommendedNextStudy
  };
}
