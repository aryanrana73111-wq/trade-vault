import React, { useState } from 'react';
import { 
  Bookmark, 
  FileEdit, 
  Trash2, 
  ExternalLink, 
  BookOpen, 
  Brain,
  Search,
  Check
} from 'lucide-react';
import { useAcademy } from '@/contexts/AcademyContext';
import { LessonCard, ConceptCard } from './components';
import { ScrollableTabs } from './ScrollableTabs';
import { HorizontalScrollRow } from './HorizontalScrollRow';
import { ACADEMY_LESSONS, ACADEMY_CONCEPTS } from '@/data/academy/curriculum';
import { Lesson, AcademyConcept } from '@/types/academy';

interface NotesBookmarksTabProps {
  onOpenLesson: (lesson: Lesson) => void;
  onOpenConcept: (concept: AcademyConcept) => void;
}

export const NotesBookmarksTab: React.FC<NotesBookmarksTabProps> = ({
  onOpenLesson,
  onOpenConcept
}) => {
  const { progress, toggleBookmark, saveNote } = useAcademy();
  const [subTab, setSubTab] = useState<'bookmarks' | 'notes'>('bookmarks');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');

  // Bookmarked lessons & concepts
  const bookmarkedLessons = ACADEMY_LESSONS.filter(l => progress.bookmarkedLessons.includes(l.id));
  const bookmarkedConcepts = ACADEMY_CONCEPTS.filter(c => progress.bookmarkedConcepts.includes(c.id));

  // User notes entries
  const notesList = Object.entries(progress.personalNotes || {})
    .filter(([_, note]) => note && note.trim().length > 0)
    .map(([entityId, note]) => {
      const lesson = ACADEMY_LESSONS.find(l => l.id === entityId);
      const concept = ACADEMY_CONCEPTS.find(c => c.id === entityId);
      return {
        entityId,
        note,
        title: lesson?.title || concept?.name || entityId,
        type: lesson ? ('lesson' as const) : ('concept' as const),
        lesson,
        concept,
        domain: lesson?.domain || concept?.domain || 'Academy'
      };
    });

  const handleStartEdit = (entityId: string, currentText: string) => {
    setEditingNoteId(entityId);
    setEditingNoteText(currentText);
  };

  const handleSaveEdit = async (entityId: string) => {
    await saveNote(entityId, editingNoteText);
    setEditingNoteId(null);
  };

  const handleDeleteNote = async (entityId: string) => {
    await saveNote(entityId, '');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Bookmark className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Personal Study Vault
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            Notes & Saved Bookmarks
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Quickly reference curriculum modules, customized notes, and mathematical explanations you have marked for continuous review.
          </p>
        </div>

        {/* Sub-tab switcher */}
        <div className="w-full sm:w-auto">
          <ScrollableTabs
            tabs={[
              {
                id: 'bookmarks',
                label: 'Bookmarks',
                icon: Bookmark,
                badge: `${bookmarkedLessons.length + bookmarkedConcepts.length}`
              },
              {
                id: 'notes',
                label: 'My Notes',
                icon: FileEdit,
                badge: `${notesList.length}`
              }
            ]}
            activeTab={subTab}
            onTabChange={(id) => setSubTab(id as any)}
            ariaLabel="Study vault sections"
          />
        </div>
      </div>

      {/* Bookmarks Tab Content */}
      {subTab === 'bookmarks' && (
        <div className="space-y-6">
          {/* Bookmarked Lessons */}
          <div className="space-y-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span>Saved Lessons ({bookmarkedLessons.length})</span>
            </h3>

            {bookmarkedLessons.length > 0 ? (
              <HorizontalScrollRow
                showControls={true}
                itemSpacing="gap-4"
              >
                {bookmarkedLessons.map(lesson => (
                  <div key={lesson.id} className="min-w-[280px] sm:min-w-[320px] shrink-0 snap-start">
                    <LessonCard
                      lesson={lesson}
                      isCompleted={progress.completedLessons.includes(lesson.id)}
                      isBookmarked={true}
                      hasNote={!!progress.personalNotes[lesson.id]}
                      bestQuizScore={progress.quizAttempts[lesson.id]?.bestScore}
                      onOpenLesson={onOpenLesson}
                      onToggleBookmark={(e) => toggleBookmark('lesson', lesson.id)}
                    />
                  </div>
                ))}
              </HorizontalScrollRow>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  No bookmarked lessons yet.
                </p>
                <p className="text-[11px] text-slate-400">
                  Click the bookmark icon on any lesson card to pin it here.
                </p>
              </div>
            )}
          </div>

          {/* Bookmarked Concepts */}
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-500" />
              <span>Saved Concepts ({bookmarkedConcepts.length})</span>
            </h3>

            {bookmarkedConcepts.length > 0 ? (
              <HorizontalScrollRow
                showControls={true}
                itemSpacing="gap-4"
              >
                {bookmarkedConcepts.map(concept => (
                  <div key={concept.id} className="min-w-[280px] sm:min-w-[320px] shrink-0 snap-start">
                    <ConceptCard
                      concept={concept}
                      isBookmarked={true}
                      onOpenConcept={onOpenConcept}
                      onToggleBookmark={(e) => toggleBookmark('concept', concept.id)}
                    />
                  </div>
                ))}
              </HorizontalScrollRow>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  No bookmarked concepts yet.
                </p>
                <p className="text-[11px] text-slate-400">
                  Bookmark key formulas and definitions in the Knowledge Library.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes Tab Content */}
      {subTab === 'notes' && (
        <div className="space-y-4">
          {notesList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notesList.map(item => (
                <div
                  key={item.entityId}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                        {item.domain}
                      </span>
                      <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 mt-1">
                        {item.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDeleteNote(item.entityId)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {editingNoteId === item.entityId ? (
                    <div className="space-y-2">
                      <textarea
                        value={editingNoteText}
                        onChange={(e) => setEditingNoteText(e.target.value)}
                        rows={3}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingNoteId(null)}
                          className="px-2.5 py-1 text-xs text-slate-500"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(item.entityId)}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => handleStartEdit(item.entityId, item.note)}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap cursor-pointer hover:border-slate-400 transition-colors"
                    >
                      {item.note}
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">Click note text to edit</span>
                    {item.lesson && (
                      <button
                        onClick={() => onOpenLesson(item.lesson!)}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <span>Open Lesson</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <FileEdit className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No saved notes yet.
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                When you open any lesson modal, use the Personal Notes section at the bottom to jot down reflections and trading insights.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
