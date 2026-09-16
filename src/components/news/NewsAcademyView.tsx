import React, { useState, useMemo } from 'react';
import { 
  NewsAcademyArticle, 
  ExplanationMode 
} from '@/types/newsIntelligence';
import { NEWS_ACADEMY_ARTICLES } from '@/data/newsAcademyData';
import { 
  BookOpen, 
  Search, 
  CheckCircle2, 
  Bookmark, 
  Clock, 
  Sparkles, 
  HelpCircle, 
  Award, 
  ChevronRight, 
  RotateCcw, 
  Layers, 
  ShieldCheck, 
  Check, 
  X,
  Edit3
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Input';

interface NewsAcademyViewProps {
  bookmarkedArticleIds: string[];
  learnedArticleIds: string[];
  onToggleBookmark: (articleId: string) => void;
  onToggleLearned: (articleId: string) => void;
  userNotes: Record<string, string>;
  onSaveNote: (id: string, text: string) => void;
  initialSelectedArticleId?: string | null;
}

export function NewsAcademyView({
  bookmarkedArticleIds,
  learnedArticleIds,
  onToggleBookmark,
  onToggleLearned,
  userNotes,
  onSaveNote,
  initialSelectedArticleId
}: NewsAcademyViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [selectedArticle, setSelectedArticle] = useState<NewsAcademyArticle | null>(() => {
    if (initialSelectedArticleId) {
      return NEWS_ACADEMY_ARTICLES.find(a => a.id === initialSelectedArticleId) || null;
    }
    return null;
  });
  const [mode, setMode] = useState<ExplanationMode>('trader');
  const [activeTab, setActiveTab] = useState<'content' | 'quiz' | 'mistakes' | 'transmission' | 'notes'>('content');

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Note state
  const [noteText, setNoteText] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  // Sync note text when selecting article
  const handleSelectArticle = (art: NewsAcademyArticle) => {
    setSelectedArticle(art);
    setActiveTab('content');
    setQuizAnswers({});
    setQuizSubmitted(false);
    setNoteText(userNotes[art.id] || '');
  };

  const handleSaveArticleNote = () => {
    if (selectedArticle) {
      onSaveNote(selectedArticle.id, noteText);
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2000);
    }
  };

  const categories = useMemo(() => {
    const set = new Set(NEWS_ACADEMY_ARTICLES.map(a => a.category));
    return ['ALL', ...Array.from(set)];
  }, []);

  const filteredArticles = useMemo(() => {
    return NEWS_ACADEMY_ARTICLES.filter(art => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const match = 
          art.title.toLowerCase().includes(q) ||
          art.code.toLowerCase().includes(q) ||
          art.category.toLowerCase().includes(q) ||
          art.simpleDefinition.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (selectedCategory !== 'ALL' && art.category !== selectedCategory) return false;
      if (selectedDifficulty !== 'ALL' && art.difficulty !== selectedDifficulty) return false;
      return true;
    });
  }, [searchTerm, selectedCategory, selectedDifficulty]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-3xl border border-blue-800/40 shadow-md">
        <div className="max-w-2xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/30">
              <BookOpen className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Comprehensive 30-Point Curriculum</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            TradeVault Macro & News Intelligence Academy
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Move beyond superficial release calendars. Master the true economic architecture, publishing authorities, market transmission channels, scenario mechanics, and common retail trading mistakes.
          </p>
        </div>
      </div>

      {/* Main Layout: If article selected, show Reader. Otherwise, catalog grid */}
      {selectedArticle ? (
        /* ARTICLE READER */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Reader Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedArticle(null)}
                    className="text-xs py-1 px-2.5 h-auto mr-2"
                  >
                    ← Back to Catalog
                  </Button>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    {selectedArticle.category}
                  </span>
                  <span className="text-xs text-slate-500">• {selectedArticle.difficulty}</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {selectedArticle.estimatedReadTime}
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {selectedArticle.title}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Published authority: {selectedArticle.whoPublishesIt} • Frequency: {selectedArticle.releaseFrequency}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleBookmark(selectedArticle.id)}
                  className={`text-xs gap-1.5 ${
                    bookmarkedArticleIds.includes(selectedArticle.id) 
                      ? 'border-amber-400 text-amber-600 bg-amber-50 dark:bg-amber-950/40' 
                      : ''
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${bookmarkedArticleIds.includes(selectedArticle.id) ? 'fill-amber-500' : ''}`} />
                  {bookmarkedArticleIds.includes(selectedArticle.id) ? 'Bookmarked' : 'Bookmark'}
                </Button>

                <Button
                  size="sm"
                  onClick={() => onToggleLearned(selectedArticle.id)}
                  className={`text-xs gap-1.5 ${
                    learnedArticleIds.includes(selectedArticle.id)
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-700'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {learnedArticleIds.includes(selectedArticle.id) ? 'Completed' : 'Mark as Learned'}
                </Button>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-medium">Reader Perspective:</span>
              <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setMode('beginner')}
                  className={`px-3 py-1 rounded-md transition-colors ${mode === 'beginner' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
                >
                  Beginner Guide
                </button>
                <button
                  type="button"
                  onClick={() => setMode('trader')}
                  className={`px-3 py-1 rounded-md transition-colors ${mode === 'trader' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
                >
                  Active Trader
                </button>
                <button
                  type="button"
                  onClick={() => setMode('professional')}
                  className={`px-3 py-1 rounded-md transition-colors ${mode === 'professional' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
                >
                  Institutional / Pro
                </button>
              </div>
            </div>
          </div>

          {/* Reader Tabs */}
          <div className="flex items-center gap-2 px-6 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold overflow-x-auto bg-white dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setActiveTab('content')}
              className={`py-3 border-b-2 whitespace-nowrap transition-colors ${activeTab === 'content' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
            >
              Curriculum Core
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('transmission')}
              className={`py-3 border-b-2 whitespace-nowrap transition-colors ${activeTab === 'transmission' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
            >
              Transmission & Real Case
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('mistakes')}
              className={`py-3 border-b-2 whitespace-nowrap transition-colors ${activeTab === 'mistakes' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
            >
              Common Pitfalls & Risks
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('quiz')}
              className={`py-3 border-b-2 whitespace-nowrap transition-colors ${activeTab === 'quiz' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
            >
              Test Me (Quiz)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('notes')}
              className={`py-3 border-b-2 whitespace-nowrap transition-colors ${activeTab === 'notes' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
            >
              My Notes
            </button>
          </div>

          {/* Reader Content Body */}
          <div className="p-6 sm:p-8 space-y-8 text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-4xl">
            {/* TAB 1: CURRICULUM CORE */}
            {activeTab === 'content' && (
              <div className="space-y-8">
                {/* Mode-Specific Executive Summary */}
                <div className="p-5 bg-blue-50/60 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-900/60 space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-bold text-xs uppercase tracking-wider text-blue-900 dark:text-blue-300">
                      {mode.toUpperCase()} PERSPECTIVE SUMMARY
                    </span>
                  </div>
                  <p className="text-sm text-slate-800 dark:text-slate-200">
                    {mode === 'beginner' 
                      ? selectedArticle.beginnerContent 
                      : mode === 'trader' 
                        ? selectedArticle.traderContent 
                        : selectedArticle.professionalContent}
                  </p>
                </div>

                {/* Section 1 & 2: Simple & Full Definition */}
                <div className="space-y-3">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">1. What It Is & Why It Exists</h3>
                  <p>{selectedArticle.fullDefinition}</p>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs">
                    <strong className="text-slate-900 dark:text-white block mb-1">Economic Purpose:</strong>
                    {selectedArticle.whyItExists}
                  </div>
                </div>

                {/* Section 3: Calculation & Publishing */}
                <div className="space-y-3">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">2. Calculation Methodology</h3>
                  <p>{selectedArticle.howCalculated}</p>
                </div>

                {/* Section 4: Affected Markets */}
                <div className="space-y-3">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">3. What Markets It Can Affect</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedArticle.affectedMarkets.map((m, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900 dark:text-white">{m.asset}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                            {m.sensitivity}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{m.rationale}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 5: Higher vs Lower */}
                <div className="space-y-3">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">4. What Higher vs Lower Usually Means</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-900/50">
                      <span className="font-bold text-emerald-800 dark:text-emerald-300 text-xs block mb-1">Higher Values:</span>
                      <p className="text-xs text-slate-700 dark:text-slate-300">{selectedArticle.whatHigherLowerMeans.higher}</p>
                    </div>
                    <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-200 dark:border-rose-900/50">
                      <span className="font-bold text-rose-800 dark:text-rose-300 text-xs block mb-1">Lower Values:</span>
                      <p className="text-xs text-slate-700 dark:text-slate-300">{selectedArticle.whatHigherLowerMeans.lower}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 italic">{selectedArticle.whatHigherLowerMeans.context}</p>
                </div>

                {/* Section 6: When Relationship Breaks */}
                <div className="space-y-3">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">5. When Traditional Relationships Break Down</h3>
                  <div className="space-y-2">
                    {selectedArticle.whenRelationshipBreaks.map((b, i) => (
                      <div key={i} className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200">
                        {b}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TRANSMISSION & REAL CASE */}
            {activeTab === 'transmission' && (
              <div className="space-y-8">
                {/* Transmission Flow */}
                <div className="space-y-4">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Intermarket Transmission Channel</h3>
                  <p className="text-xs text-slate-500">{selectedArticle.transmissionFlow.description}</p>
                  
                  <div className="space-y-3 pl-4 border-l-2 border-blue-500">
                    {selectedArticle.transmissionFlow.steps.map((step, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white dark:ring-slate-900" />
                        <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Real World Example */}
                <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{selectedArticle.realWorldExample.title}</h4>
                    <span className="text-xs text-slate-400">{selectedArticle.realWorldExample.date}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    <strong>Context:</strong> {selectedArticle.realWorldExample.eventContext}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    <strong>Outcome:</strong> {selectedArticle.realWorldExample.outcome}
                  </p>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/50 text-xs text-blue-900 dark:text-blue-300 font-medium">
                    Key Lesson: {selectedArticle.realWorldExample.lesson}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: COMMON PITFALLS & RISKS */}
            {activeTab === 'mistakes' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white mb-3">Beginner Mistakes to Avoid</h3>
                  <div className="space-y-2">
                    {selectedArticle.beginnerMistakes.map((m, i) => (
                      <div key={i} className="p-3 bg-rose-50/60 dark:bg-rose-950/20 rounded-xl border border-rose-200 dark:border-rose-900/40 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2">
                        <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white mb-3">Professional Risk Considerations</h3>
                  <div className="space-y-2">
                    {selectedArticle.riskConsiderations.map((r, i) => (
                      <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: TEST ME (QUIZ) */}
            {activeTab === 'quiz' && (
              <div className="space-y-6">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Knowledge Mastery Verification</h3>
                    <p className="text-xs text-slate-500">Answer all questions to test your comprehension of this economic catalyst.</p>
                  </div>
                  {quizSubmitted && (
                    <span className="font-bold text-xs text-blue-600 dark:text-blue-400">
                      Score: {Object.entries(quizAnswers).filter(([qIdx, aIdx]) => selectedArticle.quiz[Number(qIdx)]?.correctIndex === aIdx).length} / {selectedArticle.quiz.length}
                    </span>
                  )}
                </div>

                <div className="space-y-6">
                  {selectedArticle.quiz.map((q, qIndex) => (
                    <div key={qIndex} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {qIndex + 1}. {q.question}
                      </h4>

                      <div className="space-y-2">
                        {q.options.map((opt, optIndex) => {
                          const isSelected = quizAnswers[qIndex] === optIndex;
                          const isCorrect = q.correctIndex === optIndex;
                          let btnStyle = 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800';

                          if (quizSubmitted) {
                            if (isCorrect) btnStyle = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-900 dark:text-emerald-200';
                            else if (isSelected && !isCorrect) btnStyle = 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 text-rose-900 dark:text-rose-200';
                          } else if (isSelected) {
                            btnStyle = 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-blue-200';
                          }

                          return (
                            <button
                              key={optIndex}
                              type="button"
                              onClick={() => !quizSubmitted && setQuizAnswers(prev => ({ ...prev, [qIndex]: optIndex }))}
                              className={`w-full p-3 rounded-xl border text-xs text-left transition-colors flex items-center justify-between ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {quizSubmitted && isCorrect && <Check className="w-4 h-4 text-emerald-600" />}
                              {quizSubmitted && isSelected && !isCorrect && <X className="w-4 h-4 text-rose-600" />}
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          <strong className="text-slate-800 dark:text-slate-200">Explanation:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-2">
                  {quizSubmitted ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setQuizAnswers({});
                        setQuizSubmitted(false);
                      }}
                      className="gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Retake Quiz
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => setQuizSubmitted(true)}
                      disabled={Object.keys(quizAnswers).length < selectedArticle.quiz.length}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Submit Answers
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: MY NOTES */}
            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Personal Study Notes & Strategy Takeaways
                  </label>
                  <textarea
                    rows={8}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Write down how you plan to incorporate this economic catalyst into your risk plans or trade execution..."
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Saved locally and synchronized with your TradeVault profile.
                  </span>
                  <Button
                    size="sm"
                    onClick={handleSaveArticleNote}
                    className="gap-1.5"
                  >
                    {noteSaved ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Saved!
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-3.5 h-3.5" /> Save Note
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* CATALOG VIEW */
        <div className="space-y-5">
          {/* Filter Bar */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search curriculum by title, concept, or indicator..."
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Difficulty:</span>
              <div className="flex gap-1">
                {['ALL', 'Beginner', 'Intermediate', 'Advanced'].map(diff => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      selectedDifficulty === diff 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid of Articles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArticles.map(art => {
              const isBookmarked = bookmarkedArticleIds.includes(art.id);
              const isLearned = learnedArticleIds.includes(art.id);

              return (
                <div
                  key={art.id}
                  onClick={() => handleSelectArticle(art)}
                  className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300">
                        {art.category}
                      </span>
                      <div className="flex items-center gap-1">
                        {isLearned && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> LEARNED
                          </span>
                        )}
                        {isBookmarked && (
                          <Bookmark className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {art.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <span>{art.difficulty}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {art.estimatedReadTime}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {art.simpleDefinition}
                    </p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
                    <span>Study 30-Part Lesson</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
