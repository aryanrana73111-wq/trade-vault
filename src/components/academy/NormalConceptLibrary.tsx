import React, { useState } from 'react';
import { Search, Clock, CheckCircle2, BookOpen, Layers, ArrowRight, Filter } from 'lucide-react';
import { ALL_CURRICULUM_CONCEPTS } from '@/data/academy/registry';
import { CurriculumConcept } from '@/types/academy';
import { useAcademy } from '@/contexts/AcademyContext';

interface NormalConceptLibraryProps {
  onLearnConcept: (concept: CurriculumConcept) => void;
}

// 14 Standard Beginner Categories as mandated in Section 4
export const NORMAL_CATEGORIES = [
  'All',
  'Market Basics',
  'Forex',
  'Stocks',
  'Crypto',
  'Commodities',
  'Bonds',
  'Trading Basics',
  'Technical Analysis',
  'Risk Management',
  'Psychology',
  'Strategy',
  'Fundamental Analysis',
  'Quant Basics',
  'Portfolio Basics'
] as const;

// Helper to map CurriculumConcept into one of the 14 beginner categories
export function mapConceptToNormalCategory(concept: CurriculumConcept): string {
  const cat = concept.category?.toUpperCase() || '';
  const title = concept.title?.toLowerCase() || '';
  const desc = concept.description?.toLowerCase() || '';

  if (title.includes('forex') || title.includes('currency') || title.includes('pip') || desc.includes('exchange rate')) {
    return 'Forex';
  }
  if (title.includes('stock') || title.includes('equity') || title.includes('share') || desc.includes('company shares')) {
    return 'Stocks';
  }
  if (title.includes('crypto') || title.includes('bitcoin') || title.includes('blockchain')) {
    return 'Crypto';
  }
  if (title.includes('commodity') || title.includes('gold') || title.includes('oil') || title.includes('futures')) {
    return 'Commodities';
  }
  if (title.includes('bond') || title.includes('yield') || title.includes('interest rate') || title.includes('treasury')) {
    return 'Bonds';
  }
  if (cat.includes('PSYCH') || cat.includes('BEHAVIOR') || title.includes('emotion') || title.includes('discipline')) {
    return 'Psychology';
  }
  if (cat.includes('RISK') || title.includes('risk') || title.includes('stop loss') || title.includes('sizing') || title.includes('drawdown')) {
    return 'Risk Management';
  }
  if (cat.includes('TECHNICAL') || title.includes('candlestick') || title.includes('support') || title.includes('resistance') || title.includes('chart') || title.includes('indicator')) {
    return 'Technical Analysis';
  }
  if (cat.includes('FUNDAMENTAL') || cat.includes('MACRO') || title.includes('earnings') || title.includes('gdp') || title.includes('inflation')) {
    return 'Fundamental Analysis';
  }
  if (cat.includes('QUANT') || cat.includes('SYSTEMATIC') || title.includes('probability') || title.includes('expectancy') || title.includes('statistics')) {
    return 'Quant Basics';
  }
  if (cat.includes('PORTFOLIO') || title.includes('portfolio') || title.includes('diversification') || title.includes('rebalancing')) {
    return 'Portfolio Basics';
  }
  if (concept.level <= 1 || cat.includes('MARKET')) {
    return 'Market Basics';
  }
  if (title.includes('strategy') || title.includes('edge') || title.includes('setup')) {
    return 'Strategy';
  }
  return 'Trading Basics';
}

export const NormalConceptLibrary: React.FC<NormalConceptLibraryProps> = ({ onLearnConcept }) => {
  const { progress } = useAcademy();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');

  const conceptsWithCategories = ALL_CURRICULUM_CONCEPTS.map(c => ({
    concept: c,
    normalCategory: mapConceptToNormalCategory(c)
  }));

  const filtered = conceptsWithCategories.filter(({ concept, normalCategory }) => {
    const matchesSearch = concept.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      concept.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      normalCategory.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || normalCategory === selectedCategory;
    const matchesDiff = selectedDifficulty === 'All' || concept.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDiff;
  });

  return (
    <div id="normal-concept-library" className="space-y-6">
      {/* Search & Filter Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>Simple Concept Library</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Explore trading concepts by category. Clear, jargon-free explanations.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search concepts, terms, topics..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 14 Category Pills */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          {NORMAL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Concept Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(({ concept, normalCategory }) => {
          const isCompleted = progress.completedLessons.includes(concept.id);
          const hasAttempt = progress.quizAttempts[concept.id];
          const status = isCompleted ? 'Completed' : (hasAttempt ? 'In Progress' : 'Not Started');

          return (
            <div
              key={concept.id}
              id={`concept-card-${concept.id}`}
              className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Meta Badges */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                    {normalCategory}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      Level {concept.level}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {concept.difficulty}
                    </span>
                  </div>
                </div>

                {/* Title and description */}
                <div>
                  <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug">
                    {concept.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                    {concept.simpleExplanation || concept.description}
                  </p>
                </div>
              </div>

              {/* Card Footer: Time, Status, Learn Button */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    {concept.estimatedLearningTime || 8} min
                  </span>
                  <span className={`font-semibold ${
                    isCompleted 
                      ? 'text-emerald-600 dark:text-emerald-400' 
                      : (hasAttempt ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400')
                  }`}>
                    {status}
                  </span>
                </div>

                <button
                  id={`learn-btn-${concept.id}`}
                  onClick={() => onLearnConcept(concept)}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white dark:bg-blue-900/30 dark:hover:bg-blue-600 dark:text-blue-300 dark:hover:text-white text-xs font-bold transition-all flex items-center gap-1"
                >
                  <span>Learn</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
          <p className="text-sm font-semibold text-slate-500">
            No concepts match your search filters. Try selecting a different category.
          </p>
        </div>
      )}
    </div>
  );
};
