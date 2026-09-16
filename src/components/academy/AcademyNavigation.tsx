import React, { useState } from 'react';
import { 
  Home,
  UserCheck,
  Compass,
  GitFork,
  BookOpen,
  FlaskConical,
  Building2,
  CheckCircle2,
  Layers,
  Calculator,
  BookA,
  Bookmark,
  AlertOctagon,
  BarChart3,
  Search,
  Bot,
  Flame,
  Award,
  ChevronDown,
  Terminal
} from 'lucide-react';
import { useAcademy } from '@/contexts/AcademyContext';
import { ScrollableTabs, TabItem } from './ScrollableTabs';

export type AcademyTabId = 
  | 'home'
  | 'max'
  | 'tutor'
  | 'my-learning'
  | 'path'
  | 'skills'
  | 'library'
  | 'labs'
  | 'casestudies'
  | 'quizzes'
  | 'flashcards'
  | 'formulas'
  | 'glossary'
  | 'notes-bookmarks'
  | 'mistakes'
  | 'progress';

interface AcademyNavigationProps {
  activeTab: AcademyTabId;
  onTabChange: (tabId: AcademyTabId) => void;
  onOpenSearch: () => void;
  onOpenAITutor: () => void;
  onOpenDiagnostic: () => void;
  className?: string;
}

export const AcademyNavigation: React.FC<AcademyNavigationProps> = ({
  activeTab,
  onTabChange,
  onOpenSearch,
  onOpenAITutor,
  onOpenDiagnostic,
  className = ''
}) => {
  const { progress } = useAcademy();
  const unreviewedMistakes = progress.mistakeBank.filter(m => !m.reviewed).length;
  const [navCategory, setNavCategory] = useState<'all' | 'curriculum' | 'applied' | 'tools'>('all');

  const navItems: { 
    id: AcademyTabId; 
    label: string; 
    category: 'curriculum' | 'applied' | 'tools';
    icon: React.FC<{ className?: string }>; 
    count?: number 
  }[] = [
    { id: 'home', label: 'Academy Home', category: 'curriculum', icon: Home },
    { id: 'max', label: 'Market Terminal & Intel', category: 'applied', icon: Terminal },
    { id: 'tutor', label: 'AI Tutor', category: 'tools', icon: Bot },
    { id: 'my-learning', label: 'My Learning', category: 'curriculum', icon: UserCheck },
    { id: 'path', label: 'Learning Path', category: 'curriculum', icon: Compass },
    { id: 'skills', label: 'Skill Tree', category: 'curriculum', icon: GitFork },
    { id: 'library', label: 'Knowledge Library', category: 'curriculum', icon: BookOpen },
    { id: 'labs', label: 'Interactive Labs', category: 'applied', icon: FlaskConical },
    { id: 'casestudies', label: 'Case Studies', category: 'applied', icon: Building2 },
    { id: 'quizzes', label: 'Quizzes', category: 'applied', icon: CheckCircle2 },
    { id: 'flashcards', label: 'Flashcards', category: 'applied', icon: Layers },
    { id: 'formulas', label: 'Formula Sheet', category: 'tools', icon: Calculator },
    { id: 'glossary', label: 'Trading Glossary', category: 'tools', icon: BookA },
    { id: 'notes-bookmarks', label: 'Notes & Bookmarks', category: 'tools', icon: Bookmark },
    { id: 'mistakes', label: 'Mistake Bank', category: 'tools', icon: AlertOctagon, count: unreviewedMistakes },
    { id: 'progress', label: 'Skill Passport', category: 'tools', icon: BarChart3 },
  ];

  const filteredItems = navCategory === 'all' 
    ? navItems 
    : navItems.filter(item => item.category === navCategory);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Top action row: Search, AI Tutor, Placement Test, Level badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-850 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {/* Left: Universal Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-all border border-slate-200/60 dark:border-slate-700/60 flex-1 sm:flex-initial min-w-[200px] min-h-[44px] focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          aria-label="Search TradeVault Academy lessons, formulas, and concepts"
        >
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="flex-1 text-left truncate">Search Academy (Lessons, Formulas, Terms)...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-700 text-slate-400">
            ⌘K
          </kbd>
        </button>

        {/* Right action group */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* AI Tutor Entry Point */}
          <button
            onClick={onOpenAITutor}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all min-h-[44px] focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            <Bot className="w-4 h-4" />
            <span>AI Tutor</span>
          </button>

          {/* Diagnostic Placement Test Button */}
          <button
            onClick={onOpenDiagnostic}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 min-h-[44px] focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <Compass className="w-4 h-4 text-blue-500" />
            <span>{progress.placementTestCompleted ? 'Reassess Level' : 'Find My Level'}</span>
          </button>

          {/* Current Level Pill */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 text-xs font-black min-h-[44px]">
            <Award className="w-4 h-4" />
            <span>Level {progress.currentLevel}</span>
          </div>
        </div>
      </div>

      {/* Mobile-Friendly Quick Tab Selector (shown only on small screens for rapid switching) */}
      <div className="block sm:hidden">
        <label htmlFor="mobile-tab-selector" className="sr-only">Select Academy Section</label>
        <div className="relative">
          <select
            id="mobile-tab-selector"
            value={activeTab}
            onChange={(e) => onTabChange(e.target.value as AcademyTabId)}
            className="w-full appearance-none px-4 py-3 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs font-black text-slate-900 dark:text-slate-100 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <optgroup label="Curriculum">
              <option value="home">Academy Home</option>
              <option value="my-learning">My Learning</option>
              <option value="path">Learning Path</option>
              <option value="skills">Skill Tree</option>
              <option value="library">Knowledge Library</option>
            </optgroup>
            <optgroup label="Applied & Practice">
              <option value="max">Market Terminal & Intel</option>
              <option value="labs">Interactive Labs</option>
              <option value="casestudies">Case Studies</option>
              <option value="quizzes">Quizzes</option>
              <option value="flashcards">Flashcards</option>
            </optgroup>
            <optgroup label="Reference & Tools">
              <option value="formulas">Formula Sheet</option>
              <option value="glossary">Trading Glossary</option>
              <option value="notes-bookmarks">Notes & Bookmarks</option>
              <option value="mistakes">Mistake Bank ({unreviewedMistakes})</option>
              <option value="progress">Progress Dashboard</option>
              <option value="tutor">AI Tutor</option>
            </optgroup>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Desktop/Tablet Category Filter & Tab Strip */}
      <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {/* Category Pills Filter */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs overflow-x-auto no-scrollbar scroll-smooth py-0.5 select-none">
          <span className="text-[10px] uppercase font-bold text-slate-400 mr-1 tracking-wider shrink-0">
            View:
          </span>
          <button
            onClick={() => setNavCategory('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              navCategory === 'all' 
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            All (15)
          </button>
          <button
            onClick={() => setNavCategory('curriculum')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              navCategory === 'curriculum' 
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            Curriculum
          </button>
          <button
            onClick={() => setNavCategory('applied')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              navCategory === 'applied' 
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            Labs & Practice
          </button>
          <button
            onClick={() => setNavCategory('tools')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              navCategory === 'tools' 
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            Reference & Tools
          </button>
        </div>

        {/* Scrollable Tabs row with previous/next controls and auto-scrolling active tab */}
        <ScrollableTabs<AcademyTabId>
          tabs={filteredItems.map(item => ({
            id: item.id,
            label: item.label,
            icon: item.icon,
            count: item.count
          }))}
          activeTab={activeTab}
          onTabChange={onTabChange}
          ariaLabel="Academy Sections"
        />
      </div>
    </div>
  );
};
