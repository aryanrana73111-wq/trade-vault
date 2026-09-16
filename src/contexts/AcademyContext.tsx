import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useData } from './DataContext';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { 
  UserAcademyProgress, 
  AcademyDomain, 
  PlacementResult 
} from '@/types/academy';
import { ACADEMY_LESSONS, ACADEMY_CONCEPTS } from '@/data/academy/curriculum';

interface JournalStatsSummary {
  totalTrades: number;
  winRate: number;
  avgWinR: number;
  avgLossR: number;
  expectedValueR: number;
  maxDrawdownPct: number;
  profitFactor: number;
  commonEmotions: { emotion: string; count: number }[];
  rulesViolatedCount: number;
}

interface AcademyContextType {
  progress: UserAcademyProgress;
  loading: boolean;
  journalStats: JournalStatsSummary;
  completeLesson: (lessonId: string) => Promise<void>;
  recordQuizAttempt: (
    lessonId: string, 
    scorePct: number, 
    mistakes?: {
      questionId: string;
      questionText: string;
      domain: AcademyDomain;
      userChoice: string;
      correctAnswer: string;
      explanation: string;
    }[]
  ) => Promise<void>;
  toggleBookmark: (type: 'lesson' | 'concept', id: string) => Promise<void>;
  saveNote: (entityId: string, note: string) => Promise<void>;
  recordPlacementResult: (result: PlacementResult) => Promise<void>;
  markMistakeReviewed: (questionId: string) => Promise<void>;
  markConceptMastered: (conceptId: string) => Promise<void>;
  updateDailyGoal: (minutes: number) => Promise<void>;
  updateWeeklyGoal: (lessons: number, minutes: number) => Promise<void>;
  logStudyTime: (minutes: number) => Promise<void>;
  resetProgress: () => Promise<void>;
}

const DEFAULT_PROGRESS: UserAcademyProgress = {
  currentLevel: 0,
  overallMastery: 0,
  domainMastery: {
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
  },
  completedLessons: [],
  masteredConcepts: [],
  quizAttempts: {},
  bookmarkedLessons: [],
  bookmarkedConcepts: [],
  personalNotes: {},
  mistakeBank: [],
  learningStreakDays: 0,
  lastActiveDate: '',
  dailyGoalMinutes: 15,
  todayMinutesSpent: 0,
  weeklyGoalLessons: 3,
  weeklyGoalMinutes: 75,
  placementTestCompleted: false
};

const AcademyContext = createContext<AcademyContextType | null>(null);

export const useAcademy = () => {
  const context = useContext(AcademyContext);
  if (!context) throw new Error('useAcademy must be used within an AcademyProvider');
  return context;
};

export const AcademyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { trades, rules } = useData();
  const [progress, setProgress] = useState<UserAcademyProgress>(() => {
    try {
      const cached = localStorage.getItem('tradevault_academy_progress');
      if (cached) return JSON.parse(cached);
    } catch (e) {
      // ignore
    }
    return DEFAULT_PROGRESS;
  });
  const [loading, setLoading] = useState(false);

  // Compute real user journal stats for direct Academy theory-to-practice integration
  const [journalStats, setJournalStats] = useState<JournalStatsSummary>({
    totalTrades: 0,
    winRate: 0,
    avgWinR: 0,
    avgLossR: 0,
    expectedValueR: 0,
    maxDrawdownPct: 0,
    profitFactor: 0,
    commonEmotions: [],
    rulesViolatedCount: 0
  });

  useEffect(() => {
    if (!trades || trades.length === 0) {
      setJournalStats({
        totalTrades: 0,
        winRate: 0,
        avgWinR: 0,
        avgLossR: 0,
        expectedValueR: 0,
        maxDrawdownPct: 0,
        profitFactor: 0,
        commonEmotions: [],
        rulesViolatedCount: 0
      });
      return;
    }

    const closed = trades.filter(t => (t.result && t.result !== 'PENDING') || t.pnl !== undefined);
    const total = closed.length;
    if (total === 0) return;

    let wins = 0;
    let winRSum = 0;
    let winCount = 0;
    let lossRSum = 0;
    let lossCount = 0;
    let grossProfit = 0;
    let grossLoss = 0;
    const emotionCounts: Record<string, number> = {};

    closed.forEach(t => {
      const pnl = t.pnl ?? 0;
      const r = t.rMultiple ?? 0;
      if (pnl > 0) {
        wins += 1;
        grossProfit += pnl;
        winRSum += r;
        winCount += 1;
      } else if (pnl < 0) {
        grossLoss += Math.abs(pnl);
        lossRSum += Math.abs(r);
        lossCount += 1;
      }

      // Track psychological tags
      if (t.emotions && Array.isArray(t.emotions)) {
        t.emotions.forEach(em => {
          emotionCounts[em] = (emotionCounts[em] || 0) + 1;
        });
      }
    });

    const winRate = Math.round((wins / total) * 100);
    const avgWinR = winCount > 0 ? Number((winRSum / winCount).toFixed(2)) : 0;
    const avgLossR = lossCount > 0 ? Number((lossRSum / lossCount).toFixed(2)) : 1;
    const pWin = winRate / 100;
    const pLoss = 1 - pWin;
    const expectedValueR = Number(((pWin * avgWinR) - (pLoss * avgLossR)).toFixed(2));
    const profitFactor = grossLoss > 0 ? Number((grossProfit / grossLoss).toFixed(2)) : grossProfit > 0 ? 99 : 0;

    // Peak to trough drawdown
    let peak = 0;
    let running = 0;
    let maxDd = 0;
    closed.forEach(t => {
      running += (t.pnl ?? 0);
      if (running > peak) peak = running;
      const dd = peak > 0 ? ((peak - running) / peak) * 100 : 0;
      if (dd > maxDd) maxDd = dd;
    });

    const commonEmotions = Object.entries(emotionCounts)
      .map(([emotion, count]) => ({ emotion, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setJournalStats({
      totalTrades: total,
      winRate,
      avgWinR,
      avgLossR,
      expectedValueR,
      maxDrawdownPct: Number(maxDd.toFixed(1)),
      profitFactor,
      commonEmotions,
      rulesViolatedCount: trades.filter(t => (t as any).rulesBroken?.length > 0).length
    });
  }, [trades]);

  // Load user progress from Firestore
  useEffect(() => {
    if (!user) return;
    const loadProgress = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'users', user.uid, 'academy', 'profile');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data() as UserAcademyProgress;
          setProgress(data);
          localStorage.setItem('tradevault_academy_progress', JSON.stringify(data));
        }
      } catch (err) {
        console.warn('Academy Firestore sync notification: utilizing offline cache.', err);
      } finally {
        setLoading(false);
      }
    };
    loadProgress();
  }, [user]);

  // Save progress helper
  const persistProgress = async (newProgress: UserAcademyProgress) => {
    setProgress(newProgress);
    try {
      localStorage.setItem('tradevault_academy_progress', JSON.stringify(newProgress));
      if (user) {
        const docRef = doc(db, 'users', user.uid, 'academy', 'profile');
        await setDoc(docRef, newProgress, { merge: true });
      }
    } catch (e) {
      console.error('Error persisting academy progress:', e);
    }
  };

  // Recalculate domain and overall mastery from actual user accomplishments
  const recalculateMastery = (
    completedLessonIds: string[], 
    quizAttempts: UserAcademyProgress['quizAttempts']
  ) => {
    const domainScores: Record<AcademyDomain, { total: number; earned: number }> = {
      'Market Knowledge': { total: 0, earned: 0 },
      'Technical Analysis': { total: 0, earned: 0 },
      'Fundamental Analysis': { total: 0, earned: 0 },
      'Risk Management': { total: 0, earned: 0 },
      'Execution': { total: 0, earned: 0 },
      'Trading Psychology': { total: 0, earned: 0 },
      'Behavioral Finance': { total: 0, earned: 0 },
      'Quantitative Analysis': { total: 0, earned: 0 },
      'Portfolio Management': { total: 0, earned: 0 },
      'Derivatives': { total: 0, earned: 0 },
      'Macro Economics': { total: 0, earned: 0 },
      'Market Microstructure': { total: 0, earned: 0 },
      'Research': { total: 0, earned: 0 },
      'Professional Practice': { total: 0, earned: 0 }
    };

    ACADEMY_LESSONS.forEach(l => {
      domainScores[l.domain].total += 100;
      if (completedLessonIds.includes(l.id)) {
        // Base lesson completion = 60 points
        domainScores[l.domain].earned += 60;
        // Quiz performance contributes up to 40 points
        const quiz = quizAttempts[l.id];
        if (quiz) {
          domainScores[l.domain].earned += Math.round((quiz.bestScore / 100) * 40);
        }
      }
    });

    const newDomainMastery: Record<AcademyDomain, number> = {
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

    let totalPoints = 0;
    let totalMax = 0;

    (Object.keys(domainScores) as AcademyDomain[]).forEach(domain => {
      const { total, earned } = domainScores[domain];
      const pct = total > 0 ? Math.min(100, Math.round((earned / total) * 100)) : 0;
      newDomainMastery[domain] = pct;
      totalPoints += earned;
      totalMax += total;
    });

    const overallMastery = totalMax > 0 ? Math.min(100, Math.round((totalPoints / totalMax) * 100)) : 0;

    // Highest unlocked level based on completed lessons
    let highestLevel = 0;
    completedLessonIds.forEach(id => {
      const lesson = ACADEMY_LESSONS.find(l => l.id === id);
      if (lesson && lesson.level > highestLevel) {
        highestLevel = lesson.level;
      }
    });

    return { domainMastery: newDomainMastery, overallMastery, currentLevel: highestLevel };
  };

  const completeLesson = async (lessonId: string) => {
    if (progress.completedLessons.includes(lessonId)) return;
    const completedLessons = [...progress.completedLessons, lessonId];
    
    // Auto-master concept linked to lesson if exists
    const lesson = ACADEMY_LESSONS.find(l => l.id === lessonId);
    const masteredConcepts = [...progress.masteredConcepts];
    if (lesson?.relatedConceptIds) {
      lesson.relatedConceptIds.forEach(cId => {
        if (!masteredConcepts.includes(cId)) masteredConcepts.push(cId);
      });
    }

    const { domainMastery, overallMastery, currentLevel } = recalculateMastery(
      completedLessons, 
      progress.quizAttempts
    );

    const updated: UserAcademyProgress = {
      ...progress,
      completedLessons,
      masteredConcepts,
      domainMastery,
      overallMastery,
      currentLevel: Math.max(progress.currentLevel, currentLevel),
      lastActiveDate: new Date().toISOString().split('T')[0]
    };

    await persistProgress(updated);
  };

  const recordQuizAttempt = async (
    lessonId: string, 
    scorePct: number, 
    mistakes?: {
      questionId: string;
      questionText: string;
      domain: AcademyDomain;
      userChoice: string;
      correctAnswer: string;
      explanation: string;
    }[]
  ) => {
    const prev = progress.quizAttempts[lessonId] || { attempts: 0, bestScore: 0, lastScore: 0 };
    const updatedAttempts = {
      ...progress.quizAttempts,
      [lessonId]: {
        attempts: prev.attempts + 1,
        bestScore: Math.max(prev.bestScore, scorePct),
        lastScore: scorePct
      }
    };

    // If score >= 70%, also count lesson as completed
    let completedLessons = [...progress.completedLessons];
    if (scorePct >= 70 && !completedLessons.includes(lessonId)) {
      completedLessons.push(lessonId);
    }

    // Add mistakes to mistake bank
    let mistakeBank = [...progress.mistakeBank];
    if (mistakes && mistakes.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      mistakes.forEach(m => {
        if (!mistakeBank.some(existing => existing.questionId === m.questionId)) {
          mistakeBank.unshift({
            ...m,
            reviewed: false,
            dateAdded: today
          });
        }
      });
    }

    const { domainMastery, overallMastery, currentLevel } = recalculateMastery(
      completedLessons, 
      updatedAttempts
    );

    const updated: UserAcademyProgress = {
      ...progress,
      quizAttempts: updatedAttempts,
      completedLessons,
      mistakeBank,
      domainMastery,
      overallMastery,
      currentLevel: Math.max(progress.currentLevel, currentLevel),
      lastActiveDate: new Date().toISOString().split('T')[0]
    };

    await persistProgress(updated);
  };

  const toggleBookmark = async (type: 'lesson' | 'concept', id: string) => {
    let updated: UserAcademyProgress;
    if (type === 'lesson') {
      const exists = progress.bookmarkedLessons.includes(id);
      const bookmarkedLessons = exists 
        ? progress.bookmarkedLessons.filter(b => b !== id) 
        : [...progress.bookmarkedLessons, id];
      updated = { ...progress, bookmarkedLessons };
    } else {
      const exists = progress.bookmarkedConcepts.includes(id);
      const bookmarkedConcepts = exists 
        ? progress.bookmarkedConcepts.filter(b => b !== id) 
        : [...progress.bookmarkedConcepts, id];
      updated = { ...progress, bookmarkedConcepts };
    }
    await persistProgress(updated);
  };

  const saveNote = async (entityId: string, note: string) => {
    const personalNotes = { ...progress.personalNotes, [entityId]: note };
    await persistProgress({ ...progress, personalNotes });
  };

  const recordPlacementResult = async (result: PlacementResult) => {
    const updated: UserAcademyProgress = {
      ...progress,
      placementTestCompleted: true,
      currentLevel: result.recommendedStartingLevel,
      domainMastery: result.domainScores,
      placementTestResult: {
        assessedLevel: result.assessedLevel,
        recommendedStartingLevel: result.recommendedStartingLevel,
        domainScores: result.domainScores,
        completedAt: new Date().toISOString()
      }
    };
    await persistProgress(updated);
  };

  const markMistakeReviewed = async (questionId: string) => {
    const mistakeBank = progress.mistakeBank.map(m => 
      m.questionId === questionId ? { ...m, reviewed: true } : m
    );
    await persistProgress({ ...progress, mistakeBank });
  };

  const markConceptMastered = async (conceptId: string) => {
    const exists = progress.masteredConcepts.includes(conceptId);
    const masteredConcepts = exists
      ? progress.masteredConcepts.filter(c => c !== conceptId)
      : [...progress.masteredConcepts, conceptId];
    await persistProgress({ ...progress, masteredConcepts });
  };

  const updateDailyGoal = async (minutes: number) => {
    await persistProgress({ ...progress, dailyGoalMinutes: minutes });
  };

  const updateWeeklyGoal = async (lessons: number, minutes: number) => {
    await persistProgress({ 
      ...progress, 
      weeklyGoalLessons: lessons, 
      weeklyGoalMinutes: minutes 
    });
  };

  const logStudyTime = async (minutes: number) => {
    const today = new Date().toISOString().split('T')[0];
    let streak = progress.learningStreakDays;
    if (progress.lastActiveDate !== today) {
      // Calculate day diff
      const lastDate = new Date(progress.lastActiveDate);
      const currDate = new Date(today);
      const diffTime = Math.abs(currDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) streak += 1;
      else if (diffDays > 1) streak = 1;
    }
    const updated: UserAcademyProgress = {
      ...progress,
      todayMinutesSpent: progress.todayMinutesSpent + minutes,
      learningStreakDays: streak,
      lastActiveDate: today
    };
    await persistProgress(updated);
  };

  const resetProgress = async () => {
    await persistProgress(DEFAULT_PROGRESS);
  };

  return (
    <AcademyContext.Provider
      value={{
        progress,
        loading,
        journalStats,
        completeLesson,
        recordQuizAttempt,
        toggleBookmark,
        saveNote,
        recordPlacementResult,
        markMistakeReviewed,
        markConceptMastered,
        updateDailyGoal,
        updateWeeklyGoal,
        logStudyTime,
        resetProgress
      }}
    >
      {children}
    </AcademyContext.Provider>
  );
};
