import React, { useState } from 'react';
import { 
  ArrowRight, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Compass, 
  Target, 
  Sparkles, 
  BookOpen, 
  Brain, 
  TrendingUp, 
  Layers, 
  Flame, 
  Clock, 
  Calendar,
  Zap,
  Bookmark,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { 
  AdaptiveEngineResult, 
  AdaptiveRevisionItem, 
  AdaptiveReadyFor 
} from '@/lib/academy/adaptiveLearningEngine';
import { Lesson, CurriculumConcept } from '@/types/academy';
import { useAcademy } from '@/contexts/AcademyContext';

interface AdaptiveRecommendationsPanelProps {
  recommendations: AdaptiveEngineResult;
  onOpenLesson: (lesson: Lesson) => void;
  onOpenConcept?: (concept: CurriculumConcept) => void;
  onNavigateTab?: (tabId: string) => void;
  className?: string;
}

export const AdaptiveRecommendationsPanel: React.FC<AdaptiveRecommendationsPanelProps> = ({
  recommendations,
  onOpenLesson,
  onOpenConcept,
  onNavigateTab,
  className = ''
}) => {
  const { updateWeeklyGoal } = useAcademy();
  const [editingWeeklyGoal, setEditingWeeklyGoal] = useState(false);
  const [targetLessons, setTargetLessons] = useState(recommendations.weeklyGoal.lessonsTarget);
  const [targetMinutes, setTargetMinutes] = useState(recommendations.weeklyGoal.minutesTarget);

  const {
    nextLesson,
    reviseThis,
    weakestDomain,
    youAreReadyFor,
    doNotSkipPrerequisite,
    weeklyGoal,
    personalizedRevision
  } = recommendations;

  const handleSaveWeeklyGoal = async () => {
    await updateWeeklyGoal(targetLessons, targetMinutes);
    setEditingWeeklyGoal(false);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 1. CRITICAL PREREQUISITE WARNING: DO NOT SKIP THIS PREREQUISITE */}
      {doNotSkipPrerequisite && (
        <div className="p-5 sm:p-6 rounded-3xl bg-amber-500/10 dark:bg-amber-950/30 border-2 border-amber-500/40 dark:border-amber-700/60 shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white">
                    Do Not Skip This Prerequisite
                  </span>
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                    Mandatory Institutional Progression Rule
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                  Master "{doNotSkipPrerequisite.missingPrerequisite.title}" Before Proceeding
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                  {doNotSkipPrerequisite.warningMessage}
                </p>
                {doNotSkipPrerequisite.struggleEvidence && (
                  <div className="text-[11px] font-mono font-semibold text-amber-800 dark:text-amber-200/90 pt-0.5">
                    Basis: {doNotSkipPrerequisite.struggleEvidence}
                  </div>
                )}
              </div>
            </div>

            {doNotSkipPrerequisite.missingLesson && (
              <button
                onClick={() => onOpenLesson(doNotSkipPrerequisite.missingLesson!)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs bg-amber-600 hover:bg-amber-500 text-white shadow-sm flex items-center justify-center gap-2 whitespace-nowrap transition-all"
              >
                <span>Study Prerequisite Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2-COLUMN HERO: YOUR NEXT LESSON & REVISE THIS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CARD A: YOUR NEXT LESSON */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                  <Compass className="w-4 h-4" />
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Your Next Lesson
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Level {nextLesson.lesson.level} • {nextLesson.lesson.domain}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 leading-snug">
                {nextLesson.lesson.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {nextLesson.lesson.whatIsIt || nextLesson.lesson.description}
              </p>
            </div>

            {/* Rationale / Why recommended */}
            <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                Adaptive Recommendation Basis
              </span>
              <p className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed font-medium">
                {nextLesson.reason}
              </p>
            </div>

            {/* Prerequisites Verified */}
            {nextLesson.prerequisitesCompleted.length > 0 && (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Prerequisites satisfied: {nextLesson.prerequisitesCompleted.length} foundational item(s)</span>
              </div>
            )}
          </div>

          <button
            onClick={() => onOpenLesson(nextLesson.lesson)}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <span>Begin Lesson ({nextLesson.lesson.estimatedMinutes} mins)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* CARD B: REVISE THIS */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                  <RotateCcw className="w-4 h-4" />
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Revise This
                </span>
              </div>
              {reviseThis ? (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  reviseThis.priority === 'high' 
                    ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300'
                    : 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
                }`}>
                  {reviseThis.priority.toUpperCase()} PRIORITY REVISION
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                  ALL MASTERY VERIFIED
                </span>
              )}
            </div>

            {reviseThis ? (
              <>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 leading-snug">
                    {reviseThis.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span>Level {reviseThis.level}</span>
                    <span>•</span>
                    <span>{reviseThis.domain}</span>
                    {reviseThis.evidence.quizScore !== undefined && (
                      <>
                        <span>•</span>
                        <span className="font-bold text-rose-600 dark:text-rose-400">
                          Quiz Score: {reviseThis.evidence.quizScore}%
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
                    Evidence-Based Weakness
                  </span>
                  <p className="text-xs text-rose-900 dark:text-rose-200 leading-relaxed font-medium">
                    {reviseThis.reason}
                  </p>
                </div>
              </>
            ) : (
              <div className="py-6 text-center space-y-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  No Revision Deficits
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Every completed lesson currently exceeds the 70% institutional mastery threshold with zero unreviewed mistakes.
                </p>
              </div>
            )}
          </div>

          {reviseThis ? (
            <button
              onClick={() => {
                const lesson = nextLesson.lesson.id === reviseThis.lessonId ? nextLesson.lesson : null;
                if (lesson) {
                  onOpenLesson(lesson);
                } else if (onNavigateTab) {
                  onNavigateTab('quizzes');
                }
              }}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Revise Concept Now</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigateTab && onNavigateTab('quizzes')}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-2"
            >
              <span>Practice Active Recall Quizzes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3. YOUR WEAKEST DOMAIN & YOU ARE READY FOR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* YOUR WEAKEST DOMAIN */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Your Weakest Domain
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-black bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              {weakestDomain.masteryPct}% Verified Mastery
            </span>
          </div>

          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
              {weakestDomain.domain}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {weakestDomain.reason}
            </p>
          </div>

          {/* Institutional Risk Note */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Institutional Risk If Uncorrected
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {weakestDomain.institutionalRisk}
            </p>
          </div>

          {/* Targeted Remedy Action */}
          <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase">
                Recommended Remediation Module
              </span>
              <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 line-clamp-1">
                {weakestDomain.remedyLessonTitle}
              </h4>
            </div>
            <button
              onClick={() => onNavigateTab && onNavigateTab('skills')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shrink-0 shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>Domain Skill Tree</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* YOU ARE READY FOR */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                You Are Ready For
              </span>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Prerequisites 100% Satisfied
            </span>
          </div>

          {youAreReadyFor.length > 0 ? (
            <div className="space-y-3">
              {youAreReadyFor.map((item) => (
                <div
                  key={item.concept.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-3 hover:border-emerald-300 dark:hover:border-emerald-800 transition-all group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                        Level {item.concept.level}
                      </span>
                      <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors">
                        {item.concept.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {item.whyNow}
                    </p>
                  </div>

                  <button
                    onClick={() => onOpenLesson(item.lesson)}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-emerald-600 hover:text-white border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-all shrink-0"
                    title="Launch Lesson"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center space-y-2">
              <p className="text-xs text-slate-500">
                Complete your current lesson to unlock downstream advanced institutional topics.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 4. WEEKLY LEARNING GOAL & PERSONALIZED REVISION QUEUE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WEEKLY LEARNING GOAL */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                <Target className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Weekly Learning Goal
              </span>
            </div>

            <button
              onClick={() => setEditingWeeklyGoal(!editingWeeklyGoal)}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              {editingWeeklyGoal ? 'Close Edit' : 'Adjust Goals'}
            </button>
          </div>

          {editingWeeklyGoal ? (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Lessons / Week</label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={targetLessons}
                    onChange={(e) => setTargetLessons(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Study Mins / Week</label>
                  <input
                    type="number"
                    min="15"
                    max="600"
                    step="15"
                    value={targetMinutes}
                    onChange={(e) => setTargetMinutes(parseInt(e.target.value) || 15)}
                    className="w-full px-3 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>
              <button
                onClick={handleSaveWeeklyGoal}
                className="w-full py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                Save Weekly Target
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Progress Gauges */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                    Modules Finished
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-slate-900 dark:text-slate-100">
                      {weeklyGoal.lessonsCompletedThisWeek}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">
                      / {weeklyGoal.lessonsTarget} modules
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 mt-2 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${Math.min(100, Math.round((weeklyGoal.lessonsCompletedThisWeek / weeklyGoal.lessonsTarget) * 100))}%` }}
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                    Time Invested
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-slate-900 dark:text-slate-100">
                      {weeklyGoal.minutesSpentThisWeek}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">
                      / {weeklyGoal.minutesTarget} mins
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 mt-2 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${Math.min(100, Math.round((weeklyGoal.minutesSpentThisWeek / weeklyGoal.minutesTarget) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Status Note */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{weeklyGoal.daysRemainingInWeek} days remaining in cycle</span>
                </span>
                <span className={`font-bold ${weeklyGoal.onTrack ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {weeklyGoal.onTrack ? '● On Track' : '● Behind Pace'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* PERSONALIZED REVISION QUEUE */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                <Brain className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Personalized Revision
              </span>
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {personalizedRevision.items.length} in Queue
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {personalizedRevision.summaryText}
          </p>

          {personalizedRevision.items.length > 0 ? (
            <div className="space-y-2.5 max-h-[190px] overflow-y-auto pr-1">
              {personalizedRevision.items.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 truncate">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate">
                      {item.reason}
                    </p>
                  </div>

                  <button
                    onClick={() => onNavigateTab && onNavigateTab('quizzes')}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 transition-colors shrink-0"
                  >
                    Quiz
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center space-y-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
              <p className="text-xs text-slate-500">
                No outstanding revision tasks. Proceed with your learning path!
              </p>
            </div>
          )}

          {personalizedRevision.unreviewedMistakesCount > 0 && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-amber-600 dark:text-amber-400 font-semibold">
                {personalizedRevision.unreviewedMistakesCount} unreviewed mistake(s)
              </span>
              <button
                onClick={() => onNavigateTab && onNavigateTab('mistakes')}
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Review Mistake Bank →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
