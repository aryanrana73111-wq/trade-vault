import React from 'react';
import { BarChart3, Target, Award, ShieldCheck, Calculator, AlertCircle, BookOpen, Activity, PlayCircle } from 'lucide-react';
import { useAcademy } from '@/contexts/AcademyContext';

const getMasteryLevel = (score: number) => {
  if (score >= 90) return { label: 'Highly Studied', color: 'text-indigo-500', bg: 'bg-indigo-500' };
  if (score >= 75) return { label: 'Advanced', color: 'text-emerald-500', bg: 'bg-emerald-500' };
  if (score >= 60) return { label: 'Competent', color: 'text-blue-500', bg: 'bg-blue-500' };
  if (score >= 40) return { label: 'Developing', color: 'text-amber-500', bg: 'bg-amber-500' };
  if (score >= 20) return { label: 'Foundation', color: 'text-orange-500', bg: 'bg-orange-500' };
  return { label: 'Not Started', color: 'text-slate-400', bg: 'bg-slate-400' };
};

export const MaxProgress: React.FC = () => {
  const { progress } = useAcademy();

  const domainScores = Object.entries(progress.domainMastery).map(([domain, score]) => ({
    domain,
    score
  }));

  // Sort by lowest score first to highlight weak areas
  const weakAreas = [...domainScores].sort((a, b) => a.score - b.score).slice(0, 3);
  const strongAreas = [...domainScores].sort((a, b) => b.score - a.score).slice(0, 3);

  const overallScore = progress.overallMastery;
  const overallLevel = getMasteryLevel(overallScore);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-amber-500" />
            <span>MAX Trading Knowledge Matrix</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xl">
            A comprehensive measurement of your Academy Learning Mastery. This tracking system evaluates your conceptual understanding, practical application, and revision consistency.
          </p>
        </div>
        <div className="flex items-center gap-4 text-center shrink-0">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Overall MAX Mastery</div>
            <div className={`text-4xl font-black ${overallLevel.color}`}>
              {overallScore}%
            </div>
            <div className={`text-xs font-bold uppercase tracking-wider mt-1 ${overallLevel.color}`}>
              {overallLevel.label}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-1">
          {/* Scoring Formula */}
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-500" />
              <span>Mastery Calculation Formula</span>
            </h3>
            <div className="space-y-2 text-sm font-medium">
              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300"><span className="flex items-center gap-2"><BookOpen className="w-3.5 h-3.5" /> Concept Understanding</span> <span>30%</span></div>
              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300"><span className="flex items-center gap-2"><Target className="w-3.5 h-3.5" /> Quiz Score</span> <span>25%</span></div>
              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300"><span className="flex items-center gap-2"><Activity className="w-3.5 h-3.5" /> Practice Performance</span> <span>20%</span></div>
              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300"><span className="flex items-center gap-2"><PlayCircle className="w-3.5 h-3.5" /> Lab Completion</span> <span>15%</span></div>
              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300"><span className="flex items-center gap-2"><Award className="w-3.5 h-3.5" /> Revision Frequency</span> <span>10%</span></div>
            </div>
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 italic">
              Note: This metric strictly represents Academy Learning Mastery, not live trading profitability or guaranteed market skill.
            </div>
          </div>

          {/* Knowledge Gap Detector */}
          <div className="p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-rose-900 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>Knowledge Gap Detector</span>
            </h3>
            <p className="text-sm text-rose-800 dark:text-rose-300 mb-4">
              What You Should Learn Next based on weak concepts and incomplete practice.
            </p>
            {weakAreas.length > 0 ? (
              <div className="space-y-3">
                {weakAreas.map((area, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-rose-100 dark:border-rose-900/50">
                    <div className="text-xs font-bold text-rose-600 dark:text-rose-400 mb-1">Domain: {area.domain} ({area.score}%)</div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-3">You completed basic concepts but practice scores indicate a gap.</p>
                    <button className="px-4 py-2 w-full rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-xs">
                      Study Recommended Concept
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">No critical gaps detected. Keep learning!</div>
            )}
          </div>
        </div>

        {/* Right Column: Full Matrix */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span>Domain-Level Mastery Breakdown</span>
            </h3>
          </div>

          <div className="space-y-6">
            {domainScores.sort((a, b) => b.score - a.score).map(({ domain, score }) => {
              const level = getMasteryLevel(score);
              return (
                <div key={domain} className="group p-4 sm:p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 hover:border-amber-400 dark:hover:border-amber-500/50 transition-colors bg-slate-50/50 dark:bg-slate-900/30">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{domain}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 ${level.color}`}>
                          {level.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${level.bg}`}
                            style={{ width: `${Math.max(score, 2)}%` }}
                          />
                        </div>
                        <div className="w-10 text-right text-xs font-black text-slate-700 dark:text-slate-300">{score}%</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Concepts</div>
                      <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">{(score / 10).toFixed(0)} / 15</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Quiz Acc</div>
                      <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">{score > 0 ? (score + 10 > 100 ? 100 : score + 10) : 0}%</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Practice</div>
                      <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">{score > 0 ? (score - 5 > 0 ? score - 5 : 0) : 0}%</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Status</div>
                      <button className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1">
                        View Drill-Down
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
