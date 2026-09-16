import React, { useState } from 'react';
import { Bookmark, FileText, ArrowRight, Trash2, Edit3, Save, Check } from 'lucide-react';
import { useAcademy } from '@/contexts/AcademyContext';
import { ACADEMY_LESSONS } from '@/data/academy/curriculum';
import { Lesson } from '@/types/academy';

interface NormalSavedNotesProps {
  onOpenLesson: (lesson: Lesson) => void;
}

export const NormalSavedNotes: React.FC<NormalSavedNotesProps> = ({ onOpenLesson }) => {
  const { progress, toggleBookmark, saveNote } = useAcademy();
  const [activeSubTab, setActiveSubTab] = useState<'bookmarks' | 'notes'>('bookmarks');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState('');

  // Bookmarked lessons
  const bookmarkedLessonList = ACADEMY_LESSONS.filter(l =>
    progress.bookmarkedLessons.includes(l.id)
  );

  // Notes
  const notesEntries = Object.entries(progress.personalNotes).filter(([_, note]) => note && note.trim().length > 0);

  const handleStartEdit = (id: string, currentText: string) => {
    setEditingNoteId(id);
    setEditedText(currentText);
  };

  const handleSaveEdit = async (id: string) => {
    await saveNote(id, editedText);
    setEditingNoteId(null);
  };

  const handleDelete = async (id: string) => {
    await saveNote(id, '');
  };

  return (
    <div id="normal-saved-notes" className="space-y-6">
      {/* Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-500" />
            <span>My Saved Lessons & Notes</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Quickly access your bookmarked modules and private study notes.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab('bookmarks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'bookmarks'
                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Saved Lessons ({bookmarkedLessonList.length})
          </button>
          <button
            onClick={() => setActiveSubTab('notes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'notes'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            My Notes ({notesEntries.length})
          </button>
        </div>
      </div>

      {/* SUBTAB 1: BOOKMARKED LESSONS */}
      {activeSubTab === 'bookmarks' && (
        <div className="space-y-3">
          {bookmarkedLessonList.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2">
              <Bookmark className="w-8 h-8 text-slate-400 mx-auto opacity-50" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No Bookmarked Lessons
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                While reading any lesson, click the Bookmark icon to pin it here for quick reference anytime.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {bookmarkedLessonList.map((lesson) => (
                <div
                  key={lesson.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300">
                        Level {lesson.level} • {lesson.domain}
                      </span>
                      <button
                        onClick={() => toggleBookmark('lesson', lesson.id)}
                        className="text-amber-500 hover:text-amber-600"
                        title="Remove bookmark"
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>
                    </div>

                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      {lesson.title}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {lesson.whatIsIt || lesson.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {lesson.estimatedMinutes} min
                    </span>
                    <button
                      onClick={() => onOpenLesson(lesson)}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white dark:bg-blue-900/30 dark:hover:bg-blue-600 dark:text-blue-300 dark:hover:text-white text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <span>Study Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: PERSONAL NOTES */}
      {activeSubTab === 'notes' && (
        <div className="space-y-4">
          {notesEntries.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2">
              <FileText className="w-8 h-8 text-slate-400 mx-auto opacity-50" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No Personal Notes Yet
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Open any lesson and switch to the "Personal Notes" tab to record your own insights, rules, and takeaways.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notesEntries.map(([lessonId, noteText]) => {
                const linkedLesson = ACADEMY_LESSONS.find(l => l.id === lessonId);
                const isEditing = editingNoteId === lessonId;

                return (
                  <div
                    key={lessonId}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {linkedLesson ? linkedLesson.title : `Module (${lessonId})`}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        {linkedLesson && (
                          <button
                            onClick={() => onOpenLesson(linkedLesson)}
                            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                          >
                            <span>Open Lesson</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(lessonId)}
                          className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                          title="Delete note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          value={editedText}
                          onChange={(e) => setEditedText(e.target.value)}
                          rows={4}
                          className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSaveEdit(lessonId)}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center gap-1"
                          >
                            <Save className="w-3 h-3" />
                            <span>Save Changes</span>
                          </button>
                          <button
                            onClick={() => setEditingNoteId(null)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => handleStartEdit(lessonId, noteText)}
                        className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-750 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap cursor-pointer hover:border-blue-300"
                      >
                        {noteText}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
