import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Input';
import { useAcademy } from '@/contexts/AcademyContext';
import { useData } from '@/contexts/DataContext';
import { ACADEMY_LEVELS } from '@/data/academy/levels';
import { ALL_CURRICULUM_CONCEPTS } from '@/data/academy/registry';
import { 
  GraduationCap, 
  ArrowRight, 
  Sparkles, 
  Target, 
  Calculator, 
  Brain, 
  CheckCircle2, 
  AlertTriangle,
  Bot
} from 'lucide-react';

export const AcademyProgressWidget: React.FC<{ className?: string }> = ({ className = '' }) => {
  const navigate = useNavigate();
  const { progress } = useAcademy();
  const { trades } = useData();

  const currentLevelInfo = ACADEMY_LEVELS.find(l => l.level === progress.currentLevel) || ACADEMY_LEVELS[0];

  // Find next uncompleted concept in current level
  const currentLevelConcepts = ALL_CURRICULUM_CONCEPTS.filter(c => c.level === progress.currentLevel);
  const uncompleted = currentLevelConcepts.filter(c => !progress.completedLessons.includes(c.id));
  const nextConcept = uncompleted[0] || currentLevelConcepts[0] || ALL_CURRICULUM_CONCEPTS[0];

  const unreviewedMistakes = progress.mistakeBank.filter(m => !m.reviewed).length;

  return (
    <Card className={`p-4 sm:p-5 shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col justify-between w-full min-w-0 ${className}`}>
      <div className="min-w-0">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2 min-w-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="p-1.5 sm:p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">TradeVault Academy</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Quantitative & Institutional Path</p>
            </div>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 shrink-0">
            Level {progress.currentLevel}
          </span>
        </div>

        <div className="mt-3 sm:mt-4 space-y-2.5 sm:space-y-3 min-w-0">
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5 gap-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{currentLevelInfo.title}</span>
              <span className="font-bold text-blue-600 dark:text-blue-400 shrink-0">{progress.overallMastery}% Mastery</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(5, progress.overallMastery)}%` }}
              />
            </div>
          </div>

          <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1 min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block truncate">
              Next Priority Objective
            </span>
            <div className="flex items-center justify-between gap-2 min-w-0">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate flex-1" title={nextConcept ? nextConcept.title : 'Curriculum Mastered'}>
                {nextConcept ? nextConcept.title : 'Curriculum Mastered'}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold shrink-0">
                {nextConcept?.category || 'Fundamentals'}
              </span>
            </div>
          </div>

          {unreviewedMistakes > 0 && (
            <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between text-xs gap-2 min-w-0">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 min-w-0">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="truncate">{unreviewedMistakes} unreviewed mistake{unreviewedMistakes > 1 ? 's' : ''}</span>
              </div>
              <button
                onClick={() => navigate('/academy?tab=mistakes')}
                className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 underline shrink-0 min-h-[32px] flex items-center"
              >
                Review
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800 mt-3 sm:mt-4 flex items-center gap-2">
        <button
          onClick={() => navigate('/academy')}
          className="flex-1 py-2 px-2.5 sm:px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs min-h-[38px] truncate"
        >
          <span className="truncate">Continue</span>
          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
        </button>
        <button
          onClick={() => navigate('/academy?tab=tutor')}
          className="py-2 px-2.5 sm:px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1 shrink-0 min-h-[38px]"
          title="Ask AI Tutor"
        >
          <Bot className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Tutor</span>
        </button>
      </div>
    </Card>
  );
};
