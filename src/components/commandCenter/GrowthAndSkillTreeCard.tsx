import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Award, 
  Sparkles, 
  TrendingUp, 
  BookOpenCheck, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  Unlock, 
  GraduationCap 
} from 'lucide-react';
import { TraderLevelInfo, ThirtyDayImprovementPlan } from '@/types/commandCenter';

interface GrowthAndSkillTreeCardProps {
  traderLevel: TraderLevelInfo;
  userId?: string;
}

const DEFAULT_30_DAY_PLAN: ThirtyDayImprovementPlan = {
  week1Observation: [
    { task: 'Log 100% of emotional states and screenshots for all closed trades', done: true },
    { task: 'Perform post-trade audit on all stop-loss placements', done: false }
  ],
  week2Correction: [
    { task: 'Eliminate all executions outside of London & NY session hours', done: false },
    { task: 'Cap maximum risk at strict 1.0% per trade', done: true }
  ],
  week3Experiment: [
    { task: 'Test trailing stop-loss model vs manual discretionary exits', done: false },
    { task: 'Run 10-trade sample testing A+ setup criteria strictly', done: false }
  ],
  week4Review: [
    { task: 'Compare week 1 vs week 3 profit factor and rule adherence', done: false },
    { task: 'Refine primary strategy entry checklist with empirical lessons', done: false }
  ],
  lastSavedAt: Date.now()
};

export function GrowthAndSkillTreeCard({ traderLevel, userId = 'default' }: GrowthAndSkillTreeCardProps) {
  const navigate = useNavigate();
  const planStorageKey = `tv_30d_plan_${userId}`;

  const [plan, setPlan] = useState<ThirtyDayImprovementPlan>(() => {
    try {
      const saved = localStorage.getItem(planStorageKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_30_DAY_PLAN;
  });

  const toggleTask = (week: keyof Omit<ThirtyDayImprovementPlan, 'lastSavedAt'>, index: number) => {
    const next = {
      ...plan,
      [week]: plan[week].map((item, i) => i === index ? { ...item, done: !item.done } : item),
      lastSavedAt: Date.now()
    };
    setPlan(next);
    try {
      localStorage.setItem(planStorageKey, JSON.stringify(next));
    } catch {}
  };

  const skillTiers = [
    { name: 'Foundation Builder', tier: 'Tier 1', unlocked: traderLevel.level >= 1, desc: 'Trade logging & basic risk controls' },
    { name: 'Risk Discipline Controller', tier: 'Tier 2', unlocked: traderLevel.level >= 3, desc: 'Position sizing & stop-loss rules' },
    { name: 'Execution Specialist', tier: 'Tier 3', unlocked: traderLevel.level >= 5, desc: 'Session windows & MFE/MAE capture' },
    { name: 'Behavioral Protocol Architect', tier: 'Tier 4', unlocked: traderLevel.level >= 7, desc: 'FOMO & revenge elimination' },
    { name: 'Quantitative Master Researcher', tier: 'Tier 5', unlocked: traderLevel.level >= 9, desc: 'Statistical expectancy calibration' }
  ];

  return (
    <div className="p-4 sm:p-5 lg:p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/[0.08] shadow-xs space-y-5">
      {/* Header with Trader Level */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/60">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Trader Growth Center & Skill Tree
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-mono">
                Level {traderLevel.level}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Rank: <strong className="text-slate-800 dark:text-slate-200">{traderLevel.title}</strong> • {traderLevel.currentXp} Process XP
            </p>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className="w-full sm:w-48 space-y-1">
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>Next: {traderLevel.nextLevelTitle}</span>
            <span>{traderLevel.progressPercent}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${traderLevel.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 1. Trader Skill Tree */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Professional Competency Tree
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
          {skillTiers.map((skill, idx) => (
            <div
              key={skill.name}
              className={`p-3 rounded-xl border flex flex-col justify-between ${
                skill.unlocked
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-900/60'
                  : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{skill.tier}</span>
                  {skill.unlocked ? (
                    <Unlock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block leading-tight">
                  {skill.name}
                </span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
                  {skill.desc}
                </p>
              </div>

              <span className={`text-[10px] font-bold font-mono mt-3 ${skill.unlocked ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                {skill.unlocked ? '✓ Unlocked' : 'Locked'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. 30-Day Trader Improvement Roadmap */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            30-Day Process Improvement Plan
          </h4>
          <span className="text-[10px] text-slate-400 font-mono">
            Interactive Roadmap
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Week 1 */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 block uppercase">
              Week 1: Observation
            </span>
            <div className="space-y-1.5">
              {plan.week1Observation.map((task, i) => (
                <label key={i} className="flex items-start gap-2 text-[11px] cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggleTask('week1Observation', i)}
                    className="mt-0.5 rounded text-blue-600"
                  />
                  <span className={task.done ? 'line-through opacity-70' : ''}>{task.task}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Week 2 */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block uppercase">
              Week 2: Correction
            </span>
            <div className="space-y-1.5">
              {plan.week2Correction.map((task, i) => (
                <label key={i} className="flex items-start gap-2 text-[11px] cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggleTask('week2Correction', i)}
                    className="mt-0.5 rounded text-amber-600"
                  />
                  <span className={task.done ? 'line-through opacity-70' : ''}>{task.task}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Week 3 */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 block uppercase">
              Week 3: Experiment
            </span>
            <div className="space-y-1.5">
              {plan.week3Experiment.map((task, i) => (
                <label key={i} className="flex items-start gap-2 text-[11px] cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggleTask('week3Experiment', i)}
                    className="mt-0.5 rounded text-purple-600"
                  />
                  <span className={task.done ? 'line-through opacity-70' : ''}>{task.task}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Week 4 */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block uppercase">
              Week 4: Review
            </span>
            <div className="space-y-1.5">
              {plan.week4Review.map((task, i) => (
                <label key={i} className="flex items-start gap-2 text-[11px] cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggleTask('week4Review', i)}
                    className="mt-0.5 rounded text-emerald-600"
                  />
                  <span className={task.done ? 'line-through opacity-70' : ''}>{task.task}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
