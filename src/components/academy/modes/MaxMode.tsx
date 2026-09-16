import React, { useState, useRef } from 'react';
import { 
  Sparkles, Layers, FileText, Search, BarChart3, Compass, 
  ArrowRight, PlayCircle, BookOpen, Activity, Library, NotebookText 
} from 'lucide-react';
import { useAcademy } from '@/contexts/AcademyContext';

// We will implement sub-components for each tab
import { MaxConceptLibrary } from './max/MaxConceptLibrary';
import { MaxRoadmap } from './max/MaxRoadmap';
import { MaxPractice } from './max/MaxPractice';
import { MaxProgress } from './max/MaxProgress';
import { MaxExplore } from './max/MaxExplore';
import { MaxVisualLabs } from './max/MaxVisualLabs';
import { MaxCaseStudies } from './max/MaxCaseStudies';
import { MaxResourceLibrary } from './max/MaxResourceLibrary';
import { MaxNotes } from './max/MaxNotes';
import { MaxSearch } from './max/MaxSearch';

interface MaxModeProps {
  onOpenLessonModal: (lesson: any) => void;
}

export type MaxSubTab = 
  | 'overview' 
  | 'curriculum' 
  | 'roadmap' 
  | 'visual-labs' 
  | 'practice' 
  | 'case-studies' 
  | 'resources' 
  | 'mastery' 
  | 'notes' 
  | 'search';

export const MaxMode: React.FC<MaxModeProps> = ({ onOpenLessonModal }) => {
  const { progress } = useAcademy();
  const [activeTab, setActiveTab] = useState<MaxSubTab>('overview');

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const hasDraggedRef = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    hasDraggedRef.current = false;
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    if (Math.abs(walk) > 10) {
      hasDraggedRef.current = true;
    }
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Compass },
    { id: 'curriculum', label: 'Curriculum', icon: Layers },
    { id: 'roadmap', label: 'Roadmap', icon: ArrowRight },
    { id: 'visual-labs', label: 'Visual Labs', icon: PlayCircle },
    { id: 'practice', label: 'Practice', icon: Activity },
    { id: 'case-studies', label: 'Case Studies', icon: BookOpen },
    { id: 'resources', label: 'Resource Library', icon: Library },
    { id: 'mastery', label: 'Mastery', icon: BarChart3 },
    { id: 'notes', label: 'Notes', icon: NotebookText },
    { id: 'search', label: 'Search', icon: Search },
  ];

  return (
    <div id="max-mode-view" className="space-y-6">
      {/* MAX DASHBOARD HEADER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6 text-white relative overflow-hidden">
        {/* Decorative background flare */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-900 shadow-xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  TradeVault Academy — MAX
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-amber-400">
                  Visual Trading Academy
                </p>
              </div>
            </div>
            <p className="text-slate-400 text-sm max-w-xl">
              Professional trading education, interactive textbook, chart laboratory, practice platform, and research library.
            </p>
          </div>
        </div>

        {/* Hero Stats */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 border-t border-slate-800/60">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Concepts</span>
            <div className="text-lg font-black text-white">135+</div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Mastered</span>
            <div className="text-lg font-black text-amber-400">{progress.masteredConcepts.length}</div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Visual Labs</span>
            <div className="text-lg font-black text-white">15</div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Case Studies</span>
            <div className="text-lg font-black text-white">10+</div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Accuracy</span>
            <div className="text-lg font-black text-emerald-400">
              {progress.overallMastery}%
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">MAX Progress</span>
            <div className="text-lg font-black text-white">
              {Math.round((progress.masteredConcepts.length / 135) * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* MAX TOP NAVIGATION */}
      <div 
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={`flex items-center gap-1.5 p-1.5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar shadow-xs ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (!hasDraggedRef.current) setActiveTab(tab.id as MaxSubTab);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-slate-900 dark:bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      <div className="min-h-[500px]">
        {activeTab === 'overview' && <MaxExplore onNavigateTab={setActiveTab} />}
        {activeTab === 'curriculum' && <MaxConceptLibrary onOpenConcept={onOpenLessonModal} />}
        {activeTab === 'roadmap' && <MaxRoadmap onOpenConcept={onOpenLessonModal} />}
        {activeTab === 'visual-labs' && <MaxVisualLabs />}
        {activeTab === 'practice' && <MaxPractice />}
        {activeTab === 'case-studies' && <MaxCaseStudies onOpenConcept={onOpenLessonModal} />}
        {activeTab === 'resources' && <MaxResourceLibrary />}
        {activeTab === 'mastery' && <MaxProgress />}
        {activeTab === 'notes' && <MaxNotes />}
        {activeTab === 'search' && <MaxSearch onOpenConcept={onOpenLessonModal} />}
      </div>
    </div>
  );
};
