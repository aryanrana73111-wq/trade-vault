import React, { useState } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronRight, 
  ArrowRight,
  Shield,
  Award,
  Sparkles,
  Bookmark
} from 'lucide-react';
import { ACADEMY_LEVELS } from '@/data/academy/levels';
import { ACADEMY_LESSONS } from '@/data/academy/curriculum';
import { useAcademy } from '@/contexts/AcademyContext';
import { AcademyDomain, Lesson } from '@/types/academy';

interface CurriculumTabProps {
  onSelectLesson: (lesson: Lesson) => void;
}

export const CurriculumTab: React.FC<CurriculumTabProps> = ({ onSelectLesson }) => {
  const { progress } = useAcademy();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [expandedLevels, setExpandedLevels] = useState<Record<number, boolean>>({
    0: true,
    1: true,
    2: true,
    3: true
  });

  const toggleLevel = (level: number) => {
    setExpandedLevels(prev => ({ ...prev, [level]: !prev[level] }));
  };

  const domains: Array<string> = [
    'All',
    'Market Knowledge',
    'Technical Analysis',
    'Risk Management',
    'Execution',
    'Trading Psychology',
    'Quantitative Analysis',
    'Portfolio Management',
    'Professional Practice'
  ];

  // Filter lessons
  const filteredLessons = ACADEMY_LESSONS.filter(l => {
    const matchesSearch = searchQuery === '' || 
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDomain = selectedDomain === 'All' || l.domain === selectedDomain;
    return matchesSearch && matchesDomain;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search lessons, concepts, risk models..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Domain Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 sm:pb-0 scrollbar-none">
          {domains.map(d => (
            <button
              key={d}
              onClick={() => setSelectedDomain(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedDomain === d
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Levels & Lessons Breakdown */}
      <div className="space-y-4">
        {ACADEMY_LEVELS.map(lvl => {
          const levelLessons = filteredLessons.filter(l => l.level === lvl.level);
          if (levelLessons.length === 0 && (searchQuery !== '' || selectedDomain !== 'All')) {
            return null; // hide empty levels when filtering
          }

          const completedInLevel = levelLessons.filter(l => progress.completedLessons.includes(l.id)).length;
          const levelPct = levelLessons.length > 0 ? Math.round((completedInLevel / levelLessons.length) * 100) : 0;
          const isExpanded = expandedLevels[lvl.level] ?? true;

          return (
            <div 
              key={lvl.level}
              className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden"
            >
              {/* Level Accordion Header */}
              <button
                onClick={() => toggleLevel(lvl.level)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-black text-sm flex items-center justify-center border border-blue-200 dark:border-blue-900">
                    L{lvl.level}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                        {lvl.title}
                      </h3>
                      {levelPct === 100 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          Complete
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {lvl.objective}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {completedInLevel} / {levelLessons.length} Done
                    </span>
                    <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all"
                        style={{ width: `${levelPct}%` }}
                      />
                    </div>
                  </div>

                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Expanded Lesson Cards Grid */}
              {isExpanded && (
                <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-3">
                    {levelLessons.map(lesson => {
                      const isComplete = progress.completedLessons.includes(lesson.id);
                      const isBookmarked = progress.bookmarkedLessons.includes(lesson.id);
                      const quiz = progress.quizAttempts[lesson.id];

                      return (
                        <div
                          key={lesson.id}
                          onClick={() => onSelectLesson(lesson)}
                          className={`group p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isComplete 
                              ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800 hover:border-blue-400' 
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:shadow-md'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {lesson.domain}
                              </span>
                              <div className="flex items-center gap-1.5">
                                {isBookmarked && (
                                  <Bookmark className="w-3.5 h-3.5 text-amber-500 fill-current" />
                                )}
                                {isComplete ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {lesson.estimatedMinutes}m
                                  </span>
                                )}
                              </div>
                            </div>

                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors leading-snug">
                              {lesson.title}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                              {lesson.description}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                            <span className="text-[11px] font-semibold text-slate-400">
                              {quiz ? `Quiz: ${quiz.bestScore}%` : `${lesson.quizQuestions?.length || 0} Questions`}
                            </span>
                            <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                              <span>Open</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
