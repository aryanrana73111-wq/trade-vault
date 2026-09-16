import React from 'react';
import { 
  BookOpen, 
  Brain, 
  Binary, 
  HelpCircle, 
  History, 
  CheckCircle2, 
  ChevronRight 
} from 'lucide-react';
import { AcademyDomain } from '@/types/academy';

export type SearchResultType = 'lesson' | 'concept' | 'formula' | 'glossary' | 'case-study' | 'quiz';

export interface SearchResultItem {
  id: string;
  type: SearchResultType;
  title: string;
  domain: AcademyDomain;
  level?: number;
  subtitle?: string;
  description: string;
  matchedText?: string;
  rawItem: any;
}

interface SearchResultProps {
  item: SearchResultItem;
  onSelect: (item: SearchResultItem) => void;
  className?: string;
}

const TYPE_CONFIG: Record<SearchResultType, { label: string; icon: React.FC<{ className?: string }>; color: string }> = {
  lesson: {
    label: 'Lesson',
    icon: BookOpen,
    color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-900'
  },
  concept: {
    label: 'Concept',
    icon: Brain,
    color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900'
  },
  formula: {
    label: 'Formula',
    icon: Binary,
    color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900'
  },
  glossary: {
    label: 'Glossary',
    icon: HelpCircle,
    color: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border-teal-200 dark:border-teal-900'
  },
  'case-study': {
    label: 'Case Study',
    icon: History,
    color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-900'
  },
  quiz: {
    label: 'Quiz',
    icon: CheckCircle2,
    color: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-900'
  }
};

export const SearchResult: React.FC<SearchResultProps> = ({
  item,
  onSelect,
  className = ''
}) => {
  const typeCfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.lesson;
  const Icon = typeCfg.icon;

  return (
    <div
      onClick={() => onSelect(item)}
      className={`group p-3.5 sm:p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-blue-400 dark:hover:border-blue-500/60 shadow-xs hover:shadow-sm transition-all cursor-pointer flex items-center justify-between gap-3 ${className}`}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className={`p-2 rounded-lg border flex-shrink-0 mt-0.5 ${typeCfg.color}`}>
          <Icon className="w-4 h-4" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${typeCfg.color}`}>
              {typeCfg.label}
            </span>

            {item.level !== undefined && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                L{item.level}
              </span>
            )}

            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
              {item.domain}
            </span>
          </div>

          <h5 className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
            {item.title}
          </h5>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
            {item.description}
          </p>
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
    </div>
  );
};
