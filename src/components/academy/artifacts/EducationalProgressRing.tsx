import React, { useState } from 'react';
import { EducationalChartCard } from './EducationalChartCard';
import { Award, CheckCircle2, Flame, Sparkles } from 'lucide-react';

export const EducationalProgressRing: React.FC = () => {
  const [completedModules, setCompletedModules] = useState<number>(14);
  const totalModules = 20;

  const percentage = Math.round((completedModules / totalModules) * 100);
  const radius = 68;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <EducationalChartCard
      title="Curriculum Competency & Progress Ring"
      subtitle="Geometric circular completion indicator measuring verified domain milestones"
      badge="Educational Example"
      category="SKILL ASSESSMENT & LEARNING"
      units="Percentage Completed (%)"
      whatAmILookingAt="An SVG radial progress ring visualizing student progression through a multi-tiered curriculum track. The colored arc corresponds to fully verified lessons and quizzes; remaining grey space highlights impending knowledge dependencies."
      whyItMatters="Visualizing progress in circular intervals reinforces incremental habit compounding. Breaking down a massive topic (like Institutional Market Microstructure) into atomic 5% increments prevents cognitive overload."
      commonMistake="Skimming modules without testing retention. High completion numbers are meaningless without passing the associated diagnostic scenario quizzes."
      metrics={[
        { label: 'Completion Rate', value: `${percentage}%`, color: 'text-blue-600 dark:text-blue-400', subtext: 'Verified Milestones' },
        { label: 'Modules Passed', value: `${completedModules} / ${totalModules}`, color: 'text-emerald-600', subtext: 'Lessons Completed' },
        { label: 'Pending Modules', value: `${totalModules - completedModules}`, color: 'text-slate-400', subtext: 'Remaining in Level' },
        { label: 'Current Tier', value: percentage >= 80 ? 'Mastery Tier' : percentage >= 50 ? 'Intermediate' : 'Foundational', subtext: 'Proficiency Status' }
      ]}
      controls={
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            <span>Simulate Completed Modules:</span>
            <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{completedModules} of {totalModules} ({percentage}%)</span>
          </div>
          <input
            type="range"
            min={0}
            max={totalModules}
            step={1}
            value={completedModules}
            onChange={e => setCompletedModules(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
        </div>
      }
    >
      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-4">
        {/* SVG Ring Stage */}
        <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Track */}
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-slate-200 dark:text-slate-800"
              fill="transparent"
            />
            {/* Progress Arc */}
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="url(#progressGradient)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-500 ease-out"
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
              {percentage}%
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Mastery
            </span>
          </div>
        </div>

        {/* Milestone Milestones Breakdown */}
        <div className="space-y-3 w-full max-w-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Curriculum Milestones</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
              completedModules >= 5 
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' 
                : 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-400'
            }`}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Foundational Mechanics (25%)</span>
              </div>
              <span className="font-bold">{completedModules >= 5 ? 'Unlocked' : 'Pending'}</span>
            </div>

            <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
              completedModules >= 10 
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' 
                : 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-400'
            }`}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Risk & Expectancy Engine (50%)</span>
              </div>
              <span className="font-bold">{completedModules >= 10 ? 'Unlocked' : 'Pending'}</span>
            </div>

            <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
              completedModules >= 18 
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' 
                : 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-400'
            }`}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Institutional Microstructure (90%)</span>
              </div>
              <span className="font-bold">{completedModules >= 18 ? 'Unlocked' : 'Pending'}</span>
            </div>
          </div>
        </div>
      </div>
    </EducationalChartCard>
  );
};
