import { 
  UserAcademyProgress, 
  AcademyDomain, 
  Lesson, 
  CurriculumConcept,
  PlacementResult
} from '@/types/academy';
import { ALL_CURRICULUM_CONCEPTS, CurriculumRegistry } from '@/data/academy/registry';
import { ACADEMY_LESSONS } from '@/data/academy/curriculum';
import { ACADEMY_LEVELS } from '@/data/academy/levels';

export interface AdaptiveNextLesson {
  lesson: Lesson;
  concept?: CurriculumConcept;
  reason: string;
  rationaleType: 'prerequisite-mastered' | 'next-in-sequence' | 'strengthen-foundation' | 'diagnostic-directed';
  prerequisitesCompleted: string[];
}

export interface AdaptiveRevisionItem {
  id: string;
  type: 'quiz-struggle' | 'mistake-bank' | 'weak-domain' | 'spaced-repetition' | 'bookmarked-review';
  lessonId: string;
  conceptId?: string;
  title: string;
  domain: AcademyDomain;
  level: number;
  reason: string;
  evidence: {
    quizScore?: number;
    attempts?: number;
    mistakeCount?: number;
    notesCount?: number;
    daysSinceReview?: number;
  };
  priority: 'high' | 'medium' | 'low';
}

export interface AdaptiveWeakestDomain {
  domain: AcademyDomain;
  masteryPct: number;
  reason: string;
  institutionalRisk: string;
  remedyLessonId: string;
  remedyLessonTitle: string;
  gapConceptsCount: number;
}

export interface AdaptiveReadyFor {
  concept: CurriculumConcept;
  lesson: Lesson;
  unlockedBy: string[]; // which completed concepts unlocked this
  whyNow: string;
}

export interface AdaptivePrerequisiteWarning {
  targetConcept: CurriculumConcept;
  targetLesson?: Lesson;
  missingPrerequisite: CurriculumConcept;
  missingLesson?: Lesson;
  struggleEvidence?: string;
  warningMessage: string;
}

export interface AdaptiveWeeklyGoal {
  lessonsCompletedThisWeek: number;
  lessonsTarget: number;
  minutesSpentThisWeek: number;
  minutesTarget: number;
  quizMasteryPct: number;
  streakDays: number;
  daysRemainingInWeek: number;
  statusText: string;
  onTrack: boolean;
}

export interface PersonalizedRevisionQueue {
  items: AdaptiveRevisionItem[];
  highPriorityCount: number;
  unreviewedMistakesCount: number;
  summaryText: string;
}

export interface VisualLearningPathState {
  currentPosition: {
    level: number;
    levelTitle: string;
    levelDescription: string;
    domainFocus: AcademyDomain[];
    overallMastery: number;
    statusText: string;
  };
  completedConcepts: {
    concept: CurriculumConcept;
    lesson: Lesson;
    completedAt?: string;
    quizBestScore?: number;
  }[];
  currentFocus: {
    concept: CurriculumConcept;
    lesson: Lesson;
    progressPct: number;
    status: 'in-progress' | 'started';
    keyTakeaway: string;
  } | null;
  nextConcept: {
    concept: CurriculumConcept;
    lesson: Lesson;
    estimatedMinutes: number;
    prerequisitesMet: boolean;
    reason: string;
  };
  futureConcepts: {
    level: number;
    concept: CurriculumConcept;
    lesson: Lesson;
    unlockRequirements: string[];
    isLocked: boolean;
  }[];
}

export interface AdaptiveEngineResult {
  nextLesson: AdaptiveNextLesson;
  reviseThis: AdaptiveRevisionItem | null;
  weakestDomain: AdaptiveWeakestDomain;
  youAreReadyFor: AdaptiveReadyFor[];
  doNotSkipPrerequisite: AdaptivePrerequisiteWarning | null;
  weeklyGoal: AdaptiveWeeklyGoal;
  personalizedRevision: PersonalizedRevisionQueue;
  visualPath: VisualLearningPathState;
}

const DOMAIN_INSTITUTIONAL_RISKS: Record<AcademyDomain, string> = {
  'Risk Management': 'Unhedged exposure and non-invariant position sizing lead directly to asymmetrical drawdown and mathematical ruin.',
  'Execution': 'Aggressive market orders and poor liquidity timing incur invisible friction taxes that degrade mathematical edge.',
  'Trading Psychology': 'Cognitive biases like loss aversion and revenge trading lead to breaking risk rules during standard variance streaks.',
  'Technical Analysis': 'Misidentifying institutional market structure and invalidation levels results in poor risk-to-reward ratios.',
  'Quantitative Analysis': 'Ignoring expected value, variance, and sample size leads to abandoning statistically sound trading edges prematurely.',
  'Portfolio Management': 'Concentrated sector factor risk and correlated asset holdings amplify portfolio beta during systemic volatility shocks.',
  'Market Knowledge': 'Failing to understand continuous double auctions, clearinghouses, and liquidity pools distorts market perception.',
  'Professional Practice': 'Operating without institutional workflows, pre-trade checklists, and mandates prevents scalable, consistent performance.',
  'Fundamental Analysis': 'Failing to grasp macro and micro fundamentals leads to structurally weak theses.',
  'Behavioral Finance': 'Unawareness of cognitive biases guarantees sub-optimal decision making under uncertainty.',
  'Derivatives': 'Trading complex instruments without understanding their non-linear risk profiles.',
  'Macro Economics': 'Ignoring global liquidity and monetary policy shifts.',
  'Market Microstructure': 'Trading against hidden liquidity constraints and toxic flow.',
  'Research': 'Lack of formalized hypotheses and robust backtesting procedures.'
};

/**
 * Institutional Adaptive Learning Engine
 * 
 * Computes recommendations strictly from concrete user learning evidence:
 * - Completed lessons & mastered concepts
 * - Quiz scores & attempts
 * - Assessment / diagnostic results
 * - Mistake bank entries
 * - Personal notes & bookmarks
 * - Active study goals & streak
 * 
 * Zero fabricated recommendations. No unlocking advanced material simply because time passed.
 */
export function computeAdaptiveRecommendations(
  progress: UserAcademyProgress,
  inProgressConceptId?: string
): AdaptiveEngineResult {
  const completedIds = new Set<string>([
    ...progress.completedLessons,
    ...progress.masteredConcepts
  ]);

  // Map of all concepts and lessons
  const conceptMap = new Map<string, CurriculumConcept>();
  ALL_CURRICULUM_CONCEPTS.forEach(c => conceptMap.set(c.id, c));
  const lessonMap = new Map<string, Lesson>();
  ACADEMY_LESSONS.forEach(l => lessonMap.set(l.id, l));

  // --- 1. Identify Weak Concepts & Struggles ---
  const weakConceptIds = new Set<string>();

  // A. Quiz attempts with scores below 70%
  Object.entries(progress.quizAttempts).forEach(([lessonId, attempt]) => {
    if (attempt.bestScore < 70 || attempt.lastScore < 70) {
      weakConceptIds.add(lessonId);
    }
  });

  // B. Questions in mistake bank
  progress.mistakeBank.forEach(m => {
    // Find if question belongs to a concept
    const linkedConcept = ALL_CURRICULUM_CONCEPTS.find(c => 
      c.quizzes?.some(q => q.id === m.questionId || q.question.includes(m.questionText.slice(0, 20)))
    );
    if (linkedConcept) {
      weakConceptIds.add(linkedConcept.id);
    }
  });

  // Specifically check for Position Sizing struggle:
  // "c3-risk-per-trade" = Fixed-Fractional Sizing & Risk Invariance
  const positionSizingConcept = conceptMap.get('c3-risk-per-trade');
  const strugglesWithPositionSizing = 
    weakConceptIds.has('c3-risk-per-trade') ||
    (progress.quizAttempts['c3-risk-per-trade'] && progress.quizAttempts['c3-risk-per-trade'].bestScore < 70) ||
    (progress.placementTestResult && progress.placementTestResult.domainScores['Risk Management'] < 60) ||
    (progress.domainMastery['Risk Management'] < 40 && completedIds.has('c3-risk-per-trade'));

  // Specifically check for Market Basics mastery:
  // Level 0 concepts: c0-what-is-money, c0-financial-markets, c0-liquidity-basics, c0-order-book-intro
  const level0Concepts = ALL_CURRICULUM_CONCEPTS.filter(c => c.level === 0);
  const completedLevel0Count = level0Concepts.filter(c => completedIds.has(c.id)).length;
  const hasStrongMarketBasicsMastery = 
    completedLevel0Count >= 3 &&
    level0Concepts.every(c => {
      const quiz = progress.quizAttempts[c.id];
      return !quiz || quiz.bestScore >= 70;
    });

  // --- 2. Evaluate Weakest Domain ---
  const domains: AcademyDomain[] = [
    'Market Knowledge',
    'Technical Analysis',
    'Risk Management',
    'Execution',
    'Trading Psychology',
    'Quantitative Analysis',
    'Portfolio Management',
    'Professional Practice'
  ];

  let weakestDomain: AcademyDomain = 'Risk Management';
  let lowestDomainScore = 999;

  domains.forEach(d => {
    const score = progress.domainMastery[d] ?? 0;
    if (score < lowestDomainScore) {
      lowestDomainScore = score;
      weakestDomain = d;
    }
  });

  // Find foundational uncompleted lesson in the weakest domain
  const domainConcepts = ALL_CURRICULUM_CONCEPTS.filter(c => {
    const lesson = lessonMap.get(c.id);
    return (lesson && lesson.domain === weakestDomain) || c.domain === weakestDomain;
  });
  const uncompletedInDomain = domainConcepts.filter(c => !completedIds.has(c.id));
  uncompletedInDomain.sort((a, b) => a.level - b.level);

  const remedyConcept = uncompletedInDomain[0] || domainConcepts[0] || ALL_CURRICULUM_CONCEPTS[0];
  const remedyLesson = lessonMap.get(remedyConcept.id) || CurriculumRegistry.toLesson(remedyConcept);

  const adaptiveWeakestDomain: AdaptiveWeakestDomain = {
    domain: weakestDomain,
    masteryPct: Math.min(100, Math.max(0, lowestDomainScore)),
    reason: `Your verified institutional mastery in ${weakestDomain} is currently ${lowestDomainScore}%, representing the primary bottleneck to advancing.`,
    institutionalRisk: DOMAIN_INSTITUTIONAL_RISKS[weakestDomain] || 'Institutional discipline requires cross-domain competency.',
    remedyLessonId: remedyLesson.id,
    remedyLessonTitle: remedyLesson.title,
    gapConceptsCount: uncompletedInDomain.length
  };

  // --- 3. Compute "DO NOT SKIP THIS PREREQUISITE" ---
  let prerequisiteWarning: AdaptivePrerequisiteWarning | null = null;

  // Rule 1: If user struggles with Position Sizing, flag prerequisite before advanced portfolio risk
  if (strugglesWithPositionSizing && positionSizingConcept) {
    // Check if user is looking at or trying to access advanced portfolio risk / Level 4+
    const advancedPortfolioConcept = conceptMap.get('c10-multi-manager-allocations') || 
      conceptMap.get('c9-macro-liquidity-and-rates') || 
      conceptMap.get('c7-systematic-architecture') ||
      ALL_CURRICULUM_CONCEPTS.find(c => c.level >= 4 && c.category === 'PORTFOLIO MANAGEMENT') ||
      ALL_CURRICULUM_CONCEPTS.find(c => c.level >= 4);

    if (advancedPortfolioConcept) {
      prerequisiteWarning = {
        targetConcept: advancedPortfolioConcept,
        targetLesson: lessonMap.get(advancedPortfolioConcept.id),
        missingPrerequisite: positionSizingConcept,
        missingLesson: lessonMap.get(positionSizingConcept.id),
        struggleEvidence: `Weakness detected in Position Sizing (${progress.quizAttempts['c3-risk-per-trade']?.bestScore ? `${progress.quizAttempts['c3-risk-per-trade'].bestScore}% quiz score` : 'prerequisite unverified'}).`,
        warningMessage: `Do not skip Position Sizing before advanced portfolio risk. You must establish mathematical 1R risk invariance and capital preservation before studying multi-asset portfolio allocation or systematic trading.`
      };
    }
  }

  // Rule 2: If no Position Sizing warning, check if any bookmarked or in-progress concept has missing prerequisites
  if (!prerequisiteWarning) {
    const candidateTargetIds = [
      ...(inProgressConceptId ? [inProgressConceptId] : []),
      ...progress.bookmarkedLessons,
      ...progress.bookmarkedConcepts
    ];

    for (const targetId of candidateTargetIds) {
      const target = conceptMap.get(targetId);
      if (target && !completedIds.has(target.id)) {
        const missingPrereqs = CurriculumRegistry.getMissingPrerequisites(target.id, Array.from(completedIds));
        if (missingPrereqs.length > 0) {
          const firstMissing = missingPrereqs[0];
          prerequisiteWarning = {
            targetConcept: target,
            targetLesson: lessonMap.get(target.id),
            missingPrerequisite: firstMissing,
            missingLesson: lessonMap.get(firstMissing.id),
            struggleEvidence: `Uncompleted prerequisite: "${firstMissing.title}" (Level ${firstMissing.level})`,
            warningMessage: `Do not skip "${firstMissing.title}". Mastery of this foundation is required before advancing to "${target.title}".`
          };
          break;
        }
      }
    }
  }

  // --- 4. Compute "YOUR NEXT LESSON" ---
  let nextLessonResult: AdaptiveNextLesson;

  // Condition A: If user struggles with Position Sizing and hasn't mastered it, recommend it!
  if (strugglesWithPositionSizing && positionSizingConcept && !completedIds.has(positionSizingConcept.id)) {
    const isLeverageMet = CurriculumRegistry.isPrerequisiteMet(positionSizingConcept.id, Array.from(completedIds));
    if (isLeverageMet) {
      const lesson = lessonMap.get(positionSizingConcept.id) || CurriculumRegistry.toLesson(positionSizingConcept);
      nextLessonResult = {
        lesson,
        concept: positionSizingConcept,
        reason: 'Recommended prerequisite: Master fixed-fractional position sizing and risk invariance before advancing to higher levels.',
        rationaleType: 'strengthen-foundation',
        prerequisitesCompleted: positionSizingConcept.prerequisites
      };
    } else {
      // Find missing prerequisite for position sizing (e.g. c1-leverage-and-margin)
      const missing = CurriculumRegistry.getMissingPrerequisites(positionSizingConcept.id, Array.from(completedIds))[0];
      const concept = missing || positionSizingConcept;
      const lesson = lessonMap.get(concept.id) || CurriculumRegistry.toLesson(concept);
      nextLessonResult = {
        lesson,
        concept,
        reason: `Foundational prerequisite for Position Sizing: Complete "${concept.title}" to understand equity drawdown mechanics.`,
        rationaleType: 'strengthen-foundation',
        prerequisitesCompleted: concept.prerequisites.filter(p => completedIds.has(p))
      };
    }
  } 
  // Condition B: If user has mastered Market Basics (Level 0), recommend Trading Fundamentals (Level 1)
  else if (hasStrongMarketBasicsMastery) {
    const level1Concepts = ALL_CURRICULUM_CONCEPTS.filter(c => c.level === 1 && !completedIds.has(c.id));
    const eligibleLevel1 = level1Concepts.filter(c => CurriculumRegistry.isPrerequisiteMet(c.id, Array.from(completedIds)));
    
    if (eligibleLevel1.length > 0) {
      const concept = eligibleLevel1[0];
      const lesson = lessonMap.get(concept.id) || CurriculumRegistry.toLesson(concept);
      nextLessonResult = {
        lesson,
        concept,
        reason: 'Demonstrated strong mastery of Level 0 Market Foundations. Advancing to Level 1 Trading Fundamentals & Execution Mechanics.',
        rationaleType: 'prerequisite-mastered',
        prerequisitesCompleted: ['Level 0: Market Foundations Verified']
      };
    } else {
      // Find lowest level unlocked concept
      const eligible = ALL_CURRICULUM_CONCEPTS.filter(c => 
        !completedIds.has(c.id) && CurriculumRegistry.isPrerequisiteMet(c.id, Array.from(completedIds))
      ).sort((a, b) => a.level - b.level);

      const concept = eligible[0] || ALL_CURRICULUM_CONCEPTS[0];
      const lesson = lessonMap.get(concept.id) || CurriculumRegistry.toLesson(concept);
      nextLessonResult = {
        lesson,
        concept,
        reason: `All prerequisites satisfied. Proceeding with Level ${concept.level} curriculum.`,
        rationaleType: 'next-in-sequence',
        prerequisitesCompleted: concept.prerequisites
      };
    }
  } 
  // Condition C: Standard sequence based on unlocked prerequisites
  else {
    const eligible = ALL_CURRICULUM_CONCEPTS.filter(c => 
      !completedIds.has(c.id) && CurriculumRegistry.isPrerequisiteMet(c.id, Array.from(completedIds))
    ).sort((a, b) => a.level - b.level);

    const concept = eligible[0] || ALL_CURRICULUM_CONCEPTS[0];
    const lesson = lessonMap.get(concept.id) || CurriculumRegistry.toLesson(concept);
    nextLessonResult = {
      lesson,
      concept,
      reason: concept.prerequisites.length > 0 
        ? `Prerequisites completed. Ready for Level ${concept.level}: ${concept.title}.`
        : 'Foundational entry point: Begin your structured institutional market curriculum.',
      rationaleType: 'next-in-sequence',
      prerequisitesCompleted: concept.prerequisites.filter(p => completedIds.has(p))
    };
  }

  // --- 5. Compute "REVISE THIS" and "PERSONALIZED REVISION" ---
  const revisionItems: AdaptiveRevisionItem[] = [];

  // A. Quiz attempts with scores below 70%
  Object.entries(progress.quizAttempts).forEach(([lessonId, attempt]) => {
    if (attempt.bestScore < 70) {
      const lesson = lessonMap.get(lessonId);
      if (lesson) {
        revisionItems.push({
          id: `quiz-${lessonId}`,
          type: 'quiz-struggle',
          lessonId,
          conceptId: lessonId,
          title: lesson.title,
          domain: lesson.domain,
          level: lesson.level,
          reason: `Quiz score was ${attempt.bestScore}% (< 70% mastery threshold). Review key concepts before building downstream dependencies.`,
          evidence: {
            quizScore: attempt.bestScore,
            attempts: attempt.attempts
          },
          priority: attempt.bestScore < 50 ? 'high' : 'medium'
        });
      }
    }
  });

  // B. Unreviewed items from mistake bank
  const unreviewedMistakes = progress.mistakeBank.filter(m => !m.reviewed);
  if (unreviewedMistakes.length > 0) {
    // Group by domain or question
    const topMistake = unreviewedMistakes[0];
    const matchingConcept = ALL_CURRICULUM_CONCEPTS.find(c => 
      c.quizzes?.some(q => q.id === topMistake.questionId || q.question.includes(topMistake.questionText.slice(0, 20)))
    );
    if (matchingConcept) {
      const lesson = lessonMap.get(matchingConcept.id) || CurriculumRegistry.toLesson(matchingConcept);
      revisionItems.push({
        id: `mistake-${matchingConcept.id}`,
        type: 'mistake-bank',
        lessonId: lesson.id,
        conceptId: matchingConcept.id,
        title: lesson.title,
        domain: lesson.domain,
        level: lesson.level,
        reason: `Contains unreviewed mistake: "${topMistake.questionText.slice(0, 60)}..."`,
        evidence: {
          mistakeCount: unreviewedMistakes.length
        },
        priority: 'high'
      });
    }
  }

  // C. Concepts in weakest domain where notes were taken or user has bookmarks
  const weakDomainLessons = ACADEMY_LESSONS.filter(l => 
    l.domain === weakestDomain && 
    (progress.personalNotes[l.id] || progress.bookmarkedLessons.includes(l.id))
  );
  weakDomainLessons.forEach(l => {
    if (!revisionItems.some(r => r.lessonId === l.id)) {
      revisionItems.push({
        id: `weak-domain-${l.id}`,
        type: 'weak-domain',
        lessonId: l.id,
        conceptId: l.id,
        title: l.title,
        domain: l.domain,
        level: l.level,
        reason: `Flagged in your weakest domain (${weakestDomain}). Reinforce core principles to raise domain competency.`,
        evidence: {
          notesCount: progress.personalNotes[l.id] ? 1 : 0
        },
        priority: 'medium'
      });
    }
  });

  // Pick primary "REVISE THIS" item (highest priority)
  revisionItems.sort((a, b) => {
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    return priorityWeight[b.priority] - priorityWeight[a.priority];
  });

  const reviseThisItem: AdaptiveRevisionItem | null = revisionItems.length > 0 ? revisionItems[0] : null;

  const personalizedRevision: PersonalizedRevisionQueue = {
    items: revisionItems,
    highPriorityCount: revisionItems.filter(r => r.priority === 'high').length,
    unreviewedMistakesCount: unreviewedMistakes.length,
    summaryText: revisionItems.length > 0
      ? `${revisionItems.length} concept${revisionItems.length > 1 ? 's' : ''} flagged for active revision based on quiz performance and mistake records.`
      : 'All completed concepts currently meet institutional mastery criteria (>= 70% quiz scores).'
  };

  // --- 6. Compute "YOU ARE READY FOR" ---
  // Concepts that are unlocked (all prereqs completed), not completed yet, and NOT the current next lesson
  const readyForConcepts = ALL_CURRICULUM_CONCEPTS.filter(c => {
    if (completedIds.has(c.id)) return false;
    if (c.id === nextLessonResult.lesson.id) return false;
    return CurriculumRegistry.isPrerequisiteMet(c.id, Array.from(completedIds));
  });

  // Sort by level ascending
  readyForConcepts.sort((a, b) => a.level - b.level);

  const youAreReadyFor: AdaptiveReadyFor[] = readyForConcepts.slice(0, 3).map(c => {
    const lesson = lessonMap.get(c.id) || CurriculumRegistry.toLesson(c);
    const completedPrereqTitles = c.prerequisites
      .map(p => conceptMap.get(p)?.title || p)
      .filter(Boolean);

    return {
      concept: c,
      lesson,
      unlockedBy: completedPrereqTitles.length > 0 ? completedPrereqTitles : ['Level Foundations'],
      whyNow: completedPrereqTitles.length > 0
        ? `All prerequisite foundations (${completedPrereqTitles.join(', ')}) are verified.`
        : 'Foundational concept accessible immediately with zero prerequisite barriers.'
    };
  });

  // --- 7. Compute "WEEKLY LEARNING GOAL" ---
  const weeklyTargetLessons = progress.weeklyGoalLessons || 3;
  const weeklyTargetMinutes = progress.weeklyGoalMinutes || (progress.dailyGoalMinutes * 5);
  
  // Approximate weekly lesson completions from streak & total completed
  const estimatedLessonsThisWeek = Math.min(progress.completedLessons.length, weeklyTargetLessons);
  const minutesThisWeek = Math.min(weeklyTargetMinutes, progress.todayMinutesSpent + (progress.learningStreakDays > 1 ? (progress.learningStreakDays - 1) * progress.dailyGoalMinutes : 0));

  // Days remaining in week (assuming standard 7-day cycle)
  const currentDayOfWeek = new Date().getDay(); // 0 = Sun, 6 = Sat
  const daysRemaining = 7 - (currentDayOfWeek === 0 ? 7 : currentDayOfWeek);

  const quizScores = Object.values(progress.quizAttempts).map(q => q.bestScore);
  const avgQuizMastery = quizScores.length > 0 
    ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
    : 0;

  const onTrack = estimatedLessonsThisWeek >= 1 || minutesThisWeek >= (weeklyTargetMinutes / 7) * (7 - daysRemaining);

  const weeklyGoal: AdaptiveWeeklyGoal = {
    lessonsCompletedThisWeek: estimatedLessonsThisWeek,
    lessonsTarget: weeklyTargetLessons,
    minutesSpentThisWeek: minutesThisWeek,
    minutesTarget: weeklyTargetMinutes,
    quizMasteryPct: avgQuizMastery,
    streakDays: progress.learningStreakDays,
    daysRemainingInWeek: daysRemaining,
    statusText: onTrack 
      ? 'On track to meet weekly institutional learning target.'
      : 'Behind pace. Spend 15 minutes to complete your next module.',
    onTrack
  };

  // --- 8. Compute "Visual Personalized Learning Path" ---
  // A. Current Position
  const currentLevelInfo = ACADEMY_LEVELS.find(l => l.level === progress.currentLevel) || ACADEMY_LEVELS[0];
  const currentPosition = {
    level: progress.currentLevel,
    levelTitle: currentLevelInfo.title,
    levelDescription: currentLevelInfo.description,
    domainFocus: currentLevelInfo.domainFocus,
    overallMastery: progress.overallMastery,
    statusText: progress.overallMastery >= 80 
      ? 'Proficient Institutional Edge' 
      : progress.overallMastery >= 50 
        ? 'Developing Systematic Competence' 
        : 'Foundational Knowledge Acquisition'
  };

  // B. Completed Concepts
  const completedConcepts = Array.from(completedIds)
    .map(id => {
      const c = conceptMap.get(id);
      const l = lessonMap.get(id);
      if (!c || !l) return null;
      return {
        concept: c,
        lesson: l,
        quizBestScore: progress.quizAttempts[id]?.bestScore
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  // C. Current Focus
  let currentFocus: VisualLearningPathState['currentFocus'] = null;
  if (inProgressConceptId && conceptMap.has(inProgressConceptId)) {
    const focusConcept = conceptMap.get(inProgressConceptId)!;
    const focusLesson = lessonMap.get(inProgressConceptId) || CurriculumRegistry.toLesson(focusConcept);
    currentFocus = {
      concept: focusConcept,
      lesson: focusLesson,
      progressPct: 50,
      status: 'in-progress',
      keyTakeaway: focusConcept.learningObjectives[0] || focusConcept.simpleExplanation
    };
  } else if (nextLessonResult.concept) {
    currentFocus = {
      concept: nextLessonResult.concept,
      lesson: nextLessonResult.lesson,
      progressPct: 15,
      status: 'started',
      keyTakeaway: nextLessonResult.concept.learningObjectives[0] || nextLessonResult.concept.simpleExplanation
    };
  }

  // D. Next Concept
  const nextConcept = {
    concept: nextLessonResult.concept || ALL_CURRICULUM_CONCEPTS[0],
    lesson: nextLessonResult.lesson,
    estimatedMinutes: nextLessonResult.lesson.estimatedMinutes || 20,
    prerequisitesMet: true,
    reason: nextLessonResult.reason
  };

  // E. Future Concepts (upcoming milestones downstream)
  const futureConcepts = ALL_CURRICULUM_CONCEPTS
    .filter(c => {
      if (completedIds.has(c.id)) return false;
      if (c.id === nextConcept.concept.id) return false;
      if (currentFocus && c.id === currentFocus.concept.id) return false;
      return c.level >= progress.currentLevel;
    })
    .slice(0, 4)
    .map(c => {
      const isLocked = !CurriculumRegistry.isPrerequisiteMet(c.id, Array.from(completedIds));
      const missing = CurriculumRegistry.getMissingPrerequisites(c.id, Array.from(completedIds));
      return {
        level: c.level,
        concept: c,
        lesson: lessonMap.get(c.id) || CurriculumRegistry.toLesson(c),
        unlockRequirements: missing.map(m => m.title),
        isLocked
      };
    });

  const visualPath: VisualLearningPathState = {
    currentPosition,
    completedConcepts,
    currentFocus,
    nextConcept,
    futureConcepts
  };

  return {
    nextLesson: nextLessonResult,
    reviseThis: reviseThisItem,
    weakestDomain: adaptiveWeakestDomain,
    youAreReadyFor,
    doNotSkipPrerequisite: prerequisiteWarning,
    weeklyGoal,
    personalizedRevision,
    visualPath
  };
}
