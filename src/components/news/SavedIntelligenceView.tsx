import React, { useState } from 'react';
import { 
  Bookmark, 
  Trash2, 
  ExternalLink, 
  Calendar, 
  FileText, 
  Search, 
  Download, 
  ArrowRight,
  Sparkles,
  Plus
} from 'lucide-react';
import { getAllMarketNews } from '@/data/marketNewsData';
import { NEWS_EVENTS } from '@/data/newsIntelligenceData';
import { NewsUserSettings, MarketNewsArticle } from '@/types/newsIntelligence';

interface SavedIntelligenceViewProps {
  settings: NewsUserSettings;
  onUpdateSettings: (updates: Partial<NewsUserSettings>) => void;
  onOpenArticleModal: (article: MarketNewsArticle) => void;
  onSelectEvent: (eventId: string) => void;
}

export const SavedIntelligenceView: React.FC<SavedIntelligenceViewProps> = ({
  settings,
  onUpdateSettings,
  onOpenArticleModal,
  onSelectEvent
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'ARTICLES' | 'NOTES'>('ARTICLES');
  const [searchQuery, setSearchQuery] = useState('');
  const [newNoteKey, setNewNoteKey] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  const bookmarkedIds = settings.bookmarkedArticleIds || [];
  const allArticles = getAllMarketNews();
  const savedArticles = allArticles.filter(art => bookmarkedIds.includes(art.id));

  const handleRemoveArticle = (id: string) => {
    onUpdateSettings({
      bookmarkedArticleIds: bookmarkedIds.filter(item => item !== id)
    });
  };

  const handleSaveNote = () => {
    if (!newNoteKey.trim() || !newNoteContent.trim()) return;
    const updatedNotes = {
      ...(settings.userNotes || {}),
      [newNoteKey.trim()]: newNoteContent.trim()
    };
    onUpdateSettings({ userNotes: updatedNotes });
    setNewNoteKey('');
    setNewNoteContent('');
    setIsAddingNote(false);
  };

  const handleDeleteNote = (key: string) => {
    const updatedNotes = { ...(settings.userNotes || {}) };
    delete updatedNotes[key];
    onUpdateSettings({ userNotes: updatedNotes });
  };

  const handleExportSaved = () => {
    const data = {
      savedArticles: savedArticles.map(a => ({ title: a.headline, source: a.source, url: a.sourceUrl })),
      userNotes: settings.userNotes || {},
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TradeVault_Intelligence_Export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="saved-intelligence-view" className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-neutral-900 text-white border border-neutral-800 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Bookmark className="w-3.5 h-3.5" />
            Personal Archive & Research
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            My Saved Intelligence
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed">
            Review bookmarked market news briefings, archived economic reports, and your macroeconomic trading notes.
          </p>
        </div>
      </div>

      {/* Sub-tabs & Action bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('ARTICLES')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeSubTab === 'ARTICLES'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Saved Articles ({savedArticles.length})
          </button>
          <button
            onClick={() => setActiveSubTab('NOTES')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeSubTab === 'NOTES'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Research Notes ({Object.keys(settings.userNotes || {}).length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportSaved}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export Archive
          </button>
          {activeSubTab === 'NOTES' && (
            <button
              onClick={() => setIsAddingNote(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Note
            </button>
          )}
        </div>
      </div>

      {/* SUB-TAB 1: SAVED ARTICLES */}
      {activeSubTab === 'ARTICLES' && (
        <div className="space-y-4">
          {savedArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedArticles.map(article => (
                <div
                  key={article.id}
                  className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 uppercase">
                          {article.category}
                        </span>
                        <span className="text-xs text-neutral-500">{article.source}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveArticle(article.id)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Remove bookmark"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="font-bold text-base text-neutral-900 dark:text-white leading-snug">
                      {article.headline}
                    </h3>

                    <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                      {article.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {article.markets.slice(0, 3).map((m, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded text-[11px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                          {m}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => onOpenArticleModal(article)}
                      className="font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      Read Briefing →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-neutral-900 border border-dashed border-neutral-300 dark:border-neutral-700 space-y-2">
              <Bookmark className="w-8 h-8 text-neutral-400 mx-auto" />
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                No saved articles in your archive
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Click the Bookmark icon on any news card to save it to this private intelligence archive.
              </p>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: RESEARCH NOTES */}
      {activeSubTab === 'NOTES' && (
        <div className="space-y-4">
          {isAddingNote && (
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-primary-500 shadow-sm space-y-3">
              <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                Create Macro Intelligence Note
              </h4>
              <input
                type="text"
                placeholder="Topic / Event Key (e.g. FOMC Dot Plot, Gold Seasonal Bias)..."
                value={newNoteKey}
                onChange={(e) => setNewNoteKey(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
              />
              <textarea
                placeholder="Enter trading observations, correlation notes, or risk parameters..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-xl text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setIsAddingNote(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-600 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNote}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary-600 text-white hover:bg-primary-700"
                >
                  Save Note
                </button>
              </div>
            </div>
          )}

          {Object.entries(settings.userNotes || {}).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(settings.userNotes || {}).map(([key, noteText]) => (
                <div
                  key={key}
                  className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-primary-600 dark:text-primary-400">
                        {key}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteNote(key)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed">
                    {noteText}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-neutral-900 border border-dashed border-neutral-300 dark:border-neutral-700 space-y-2">
              <FileText className="w-8 h-8 text-neutral-400 mx-auto" />
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                No personal research notes recorded yet
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Add structured macro observations or trading thesis notes here to maintain institutional discipline.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
