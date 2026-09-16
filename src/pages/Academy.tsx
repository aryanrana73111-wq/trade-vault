import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAcademy } from '@/contexts/AcademyContext';

// Navigation & Tab Views
import { AcademyNavigation, AcademyTabId } from '@/components/academy/AcademyNavigation';
import { AcademyModeSelector, AcademyMode } from '@/components/academy/AcademyModeSelector';
import { NormalMode } from '@/components/academy/modes/NormalMode';
import { MaxMode } from '@/components/academy/modes/MaxMode';
import { NormalLessonModal } from '@/components/academy/NormalLessonModal';
import { MaxLessonModal } from '@/components/academy/modes/max/MaxLessonModal';
import { MaxConceptItem } from '@/types/academyTier';
import { UltraMode } from '@/components/academy/modes/UltraMode';
import { AcademyHome } from '@/components/academy/AcademyHome';
import { MyLearningTab } from '@/components/academy/MyLearningTab';
import { LearningPathTab } from '@/components/academy/LearningPathTab';
import { SkillTreeTab } from '@/components/academy/SkillTreeTab';
import { KnowledgeLibraryTab } from '@/components/academy/KnowledgeLibraryTab';
import { InteractiveLabsTab } from '@/components/academy/InteractiveLabsTab';
import { CaseStudiesTab } from '@/components/academy/CaseStudiesTab';
import { QuizzesTab } from '@/components/academy/QuizzesTab';
import { FlashcardsTab } from '@/components/academy/FlashcardsTab';
import { FormulaSheetTab } from '@/components/academy/FormulaSheetTab';
import { GlossaryTab } from '@/components/academy/GlossaryTab';
import { NotesBookmarksTab } from '@/components/academy/NotesBookmarksTab';
import { MistakeBankTab } from '@/components/academy/MistakeBankTab';
import { ProgressDashboardTab } from '@/components/academy/ProgressDashboardTab';
import { AcademyMaxDashboard } from '@/components/academy/AcademyMaxDashboard';

// Modals & Views
import { LessonViewModal } from '@/components/academy/LessonViewModal';
import { FindMyLevelModal } from '@/components/academy/FindMyLevelModal';
import { ConceptViewModal } from '@/components/academy/ConceptViewModal';
import { UniversalSearchModal } from '@/components/academy/UniversalSearchModal';
import { AITutorModal } from '@/components/academy/AITutorModal';
import { AITutorView } from '@/components/academy/AITutorView';

// Types & Data
import { Lesson, AcademyConcept } from '@/types/academy';
import { ACADEMY_LESSONS, ACADEMY_CONCEPTS } from '@/data/academy/curriculum';
import { SearchResultItem } from '@/components/academy/components/SearchResult';

export const Academy: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab') as AcademyTabId | null;
  const activeTab: AcademyTabId = (rawTab && [
    'home',
    'max',
    'tutor',
    'my-learning',
    'path',
    'skills',
    'library',
    'labs',
    'casestudies',
    'quizzes',
    'flashcards',
    'formulas',
    'glossary',
    'notes-bookmarks',
    'mistakes',
    'progress'
  ].includes(rawTab)) ? rawTab : 'home';

  const { progress } = useAcademy();

  // Three-mode Academy architecture (Phase 1: Normal mode active)
  const [learningMode, setLearningMode] = useState<AcademyMode>('normal');

  // Modals state
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedMaxConcept, setSelectedMaxConcept] = useState<MaxConceptItem | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<AcademyConcept | null>(null);
  const [showPlacementModal, setShowPlacementModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showAITutorModal, setShowAITutorModal] = useState(false);
  const [tutorInitialPrompt, setTutorInitialPrompt] = useState('');

  const handleOpenAITutorWithPrompt = (prompt?: string) => {
    setTutorInitialPrompt(prompt || '');
    setShowAITutorModal(true);
  };

  const handleOpenMaxConcept = (concept: MaxConceptItem) => {
    setSelectedMaxConcept(concept);
  };

  // Global hotkey Cmd+K or Ctrl+K to trigger Universal Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
  };

  const handleOpenConcept = (concept: AcademyConcept) => {
    setSelectedConcept(concept);
  };

  const handleOpenLessonById = (lessonId: string) => {
    const lesson = ACADEMY_LESSONS.find(l => l.id === lessonId);
    if (lesson) setSelectedLesson(lesson);
  };

  const handleSelectSearchResult = (item: SearchResultItem) => {
    if (item.type === 'lesson') {
      const lesson = item.rawItem as Lesson;
      setSelectedLesson(lesson);
    } else if (item.type === 'concept') {
      const concept = item.rawItem as AcademyConcept;
      setSelectedConcept(concept);
    } else if (item.type === 'formula') {
      handleTabChange('formulas');
    } else if (item.type === 'glossary') {
      handleTabChange('glossary');
    } else if (item.type === 'case-study') {
      handleTabChange('casestudies');
    }
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-16">
      {/* Three-Mode Academy Selector (Phase 1: Normal Mode) */}
      <AcademyModeSelector
        currentMode={learningMode}
        onSelectMode={setLearningMode}
      />

      {/* Top-Level Navigation & Command Bar */}
      <AcademyNavigation
        activeTab={activeTab}
        onTabChange={(tabId) => handleTabChange(tabId)}
        onOpenSearch={() => setShowSearchModal(true)}
        onOpenAITutor={() => setShowAITutorModal(true)}
        onOpenDiagnostic={() => setShowPlacementModal(true)}
      />

      {/* Main Section Content */}
      <div className="min-h-[500px]">
        {activeTab === 'home' && (
          learningMode === 'normal' ? (
            <NormalMode onOpenLessonModal={handleOpenLesson} />
          ) : learningMode === 'max' ? (
            <MaxMode onOpenLessonModal={handleOpenMaxConcept} />
          ) : learningMode === 'ultra' ? (
            <UltraMode onOpenLessonModal={handleOpenLesson} />
          ) : (
            <AcademyHome
              onNavigateTab={handleTabChange}
              onOpenLesson={handleOpenLesson}
              onOpenDiagnostic={() => setShowPlacementModal(true)}
              onOpenAITutor={() => setShowAITutorModal(true)}
            />
          )
        )}

        {activeTab === 'max' && (
          <AcademyMaxDashboard
            onOpenLesson={handleOpenLesson}
            onNavigateTab={handleTabChange}
          />
        )}

        {activeTab === 'tutor' && (
          <AITutorView />
        )}

        {activeTab === 'my-learning' && (
          <MyLearningTab
            onOpenLesson={handleOpenLesson}
            onNavigateTab={handleTabChange}
          />
        )}

        {activeTab === 'path' && (
          <LearningPathTab
            onOpenLesson={handleOpenLesson}
            onOpenDiagnostic={() => setShowPlacementModal(true)}
            onNavigateTab={handleTabChange}
          />
        )}

        {activeTab === 'skills' && (
          <SkillTreeTab
            onOpenLesson={handleOpenLesson}
          />
        )}

        {activeTab === 'library' && (
          <KnowledgeLibraryTab
            onOpenLesson={handleOpenLesson}
            onOpenConcept={handleOpenConcept}
          />
        )}

        {activeTab === 'labs' && (
          <InteractiveLabsTab />
        )}

        {activeTab === 'casestudies' && (
          <CaseStudiesTab />
        )}

        {activeTab === 'quizzes' && (
          <QuizzesTab
            onOpenLessonWithQuiz={handleOpenLesson}
          />
        )}

        {activeTab === 'flashcards' && (
          <FlashcardsTab />
        )}

        {activeTab === 'formulas' && (
          <FormulaSheetTab />
        )}

        {activeTab === 'glossary' && (
          <GlossaryTab />
        )}

        {activeTab === 'notes-bookmarks' && (
          <NotesBookmarksTab
            onOpenLesson={handleOpenLesson}
            onOpenConcept={handleOpenConcept}
          />
        )}

        {activeTab === 'mistakes' && (
          <MistakeBankTab onOpenAITutor={handleOpenAITutorWithPrompt} />
        )}

        {activeTab === 'progress' && (
          <ProgressDashboardTab
            onNavigateTab={handleTabChange}
            onOpenLesson={handleOpenLesson}
          />
        )}
      </div>

      {/* Universal Search Modal */}
      <UniversalSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelectResult={handleSelectSearchResult}
      />

      {/* AI Tutor Modal */}
      <AITutorModal
        isOpen={showAITutorModal}
        onClose={() => {
          setShowAITutorModal(false);
          setTutorInitialPrompt('');
        }}
        initialPrompt={tutorInitialPrompt}
      />

      {/* Max Lesson View Modal */}
      {selectedMaxConcept && learningMode === 'max' && (
        <MaxLessonModal
          concept={selectedMaxConcept}
          onClose={() => setSelectedMaxConcept(null)}
        />
      )}

      {/* Lesson View Modal */}
      {selectedLesson && (
        learningMode === 'normal' ? (
          <NormalLessonModal
            lesson={selectedLesson}
            onClose={() => setSelectedLesson(null)}
          />
        ) : (
          <LessonViewModal
            lesson={selectedLesson}
            onClose={() => setSelectedLesson(null)}
          />
        )
      )}

      {/* Concept View Modal */}
      {selectedConcept && (
        <ConceptViewModal
          concept={selectedConcept}
          onClose={() => setSelectedConcept(null)}
          onOpenConnectedLesson={(lesson) => setSelectedLesson(lesson)}
        />
      )}

      {/* Find My Trading Level Diagnostic Modal */}
      {showPlacementModal && (
        <FindMyLevelModal
          onClose={() => setShowPlacementModal(false)}
          onSelectLesson={(lessonId) => handleOpenLessonById(lessonId)}
          onNavigateTab={handleTabChange}
        />
      )}
    </div>
  );
};
