import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Brain, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  X,
  Layers
} from 'lucide-react';
import { useAcademy } from '@/contexts/AcademyContext';
import { LessonCard, ConceptCard } from './components';
import { ScrollableTabs } from './ScrollableTabs';
import { ACADEMY_LESSONS, ACADEMY_CONCEPTS } from '@/data/academy/curriculum';
import { Lesson, AcademyConcept, AcademyDomain, AcademyDifficulty } from '@/types/academy';

interface KnowledgeLibraryTabProps {
  onOpenLesson: (lesson: Lesson) => void;
  onOpenConcept: (concept: AcademyConcept) => void;
}

export const KnowledgeLibraryTab: React.FC<KnowledgeLibraryTabProps> = ({
  onOpenLesson,
  onOpenConcept
}) => {
  const { progress, toggleBookmark } = useAcademy();
  const [viewMode, setViewMode] = useState<'lessons' | 'concepts'>('lessons');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');

  const domainsList: AcademyDomain[] = [
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

  const filteredLessons = useMemo(() => {
    return ACADEMY_LESSONS.filter(l => {
      if (selectedDomain !== 'All' && l.domain !== selectedDomain) return false;
      if (selectedLevel !== 'All' && l.level !== parseInt(selectedLevel, 10)) return false;
      if (selectedDifficulty !== 'All' && l.difficulty !== selectedDifficulty) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = l.title.toLowerCase().includes(q);
        const matchDesc = (l.whatIsIt || l.whyItMatters || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }
      return true;
    });
  }, [searchQuery, selectedDomain, selectedLevel, selectedDifficulty]);

  const filteredConcepts = useMemo(() => {
    return ACADEMY_CONCEPTS.filter(c => {
      if (selectedDomain !== 'All' && c.domain !== selectedDomain) return false;
      if (selectedLevel !== 'All' && c.level !== parseInt(selectedLevel, 10)) return false;
      if (selectedDifficulty !== 'All' && c.difficulty !== selectedDifficulty) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = c.name.toLowerCase().includes(q);
        const matchDef = (c.shortDefinition || c.professionalDefinition || '').toLowerCase().includes(q);
        if (!matchName && !matchDef) return false;
      }
      return true;
    });
  }, [searchQuery, selectedDomain, selectedLevel, selectedDifficulty]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedDomain('All');
    setSelectedLevel('All');
    setSelectedDifficulty('All');
  };

  const hasActiveFilters = searchQuery !== '' || selectedDomain !== 'All' || selectedLevel !== 'All' || selectedDifficulty !== 'All';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <BookOpen className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Repository
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            Institutional Knowledge Library
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Search and filter the complete institutional curriculum comprising structured multi-part lessons and decomposed core mathematical and mechanical concepts.
          </p>
        </div>

        {/* View mode toggle (Lessons vs Concepts) */}
        <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80">
          <button
            onClick={() => setViewMode('lessons')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'lessons'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Lessons ({ACADEMY_LESSONS.length})</span>
          </button>

          <button
            onClick={() => setViewMode('concepts')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'concepts'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Concepts ({ACADEMY_CONCEPTS.length})</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        {/* Domain Filter Pills via ScrollableTabs */}
        <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
          <ScrollableTabs
            tabs={[
              { id: 'All', label: 'All Domains' },
              ...domainsList.map(d => ({ id: d, label: d }))
            ]}
            activeTab={selectedDomain}
            onTabChange={(id) => setSelectedDomain(id)}
            ariaLabel="Knowledge library domains"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by keyword, title, formula, or concept..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Select dropdowns */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {/* Domain */}
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <option value="All">All Domains</option>
              {domainsList.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* Level */}
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <option value="All">All Levels</option>
              {Array.from({ length: 11 }, (_, i) => (
                <option key={i} value={i}>Level {i}</option>
              ))}
            </select>

            {/* Difficulty */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <option value="All">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Institutional">Institutional</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-2.5 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex-shrink-0"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      {viewMode === 'lessons' ? (
        filteredLessons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLessons.map(lesson => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                isCompleted={progress.completedLessons.includes(lesson.id)}
                isBookmarked={progress.bookmarkedLessons.includes(lesson.id)}
                hasNote={!!progress.personalNotes[lesson.id]}
                bestQuizScore={progress.quizAttempts[lesson.id]?.bestScore}
                onOpenLesson={onOpenLesson}
                onToggleBookmark={(e) => toggleBookmark('lesson', lesson.id)}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No lessons match your active filters
            </p>
            <p className="text-xs text-slate-400">
              Try clearing filters or changing domain and level selections.
            </p>
            <button
              onClick={resetFilters}
              className="mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Reset all filters
            </button>
          </div>
        )
      ) : (
        filteredConcepts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredConcepts.map(concept => (
              <ConceptCard
                key={concept.id}
                concept={concept}
                isBookmarked={progress.bookmarkedConcepts.includes(concept.id)}
                onOpenConcept={onOpenConcept}
                onToggleBookmark={(e) => toggleBookmark('concept', concept.id)}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <Brain className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No concepts match your active filters
            </p>
            <p className="text-xs text-slate-400">
              Try clearing filters or changing domain selections.
            </p>
            <button
              onClick={resetFilters}
              className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Reset all filters
            </button>
          </div>
        )
      )}
    </div>
  );
};
