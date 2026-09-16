import React, { useState } from 'react';
import { Layers, RotateCcw, ChevronLeft, ChevronRight, CheckCircle2, Sparkles, Shuffle } from 'lucide-react';
import { ACADEMY_FLASHCARDS } from '@/data/academy/flashcards';

export const NormalFlashcards: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tradevault_normal_flashcards_mastered');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const cards = ACADEMY_FLASHCARDS;
  const currentCard = cards[currentIndex] || cards[0];
  const isMastered = masteredIds.includes(currentCard?.id);

  const toggleMastered = () => {
    if (!currentCard) return;
    setMasteredIds(prev => {
      const updated = prev.includes(currentCard.id)
        ? prev.filter(id => id !== currentCard.id)
        : [...prev, currentCard.id];
      try {
        localStorage.setItem('tradevault_normal_flashcards_mastered', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev - 1 + cards.length) % cards.length);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const randIdx = Math.floor(Math.random() * cards.length);
    setCurrentIndex(randIdx);
  };

  return (
    <div id="normal-flashcards" className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Trading Flashcards
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tap the card to reveal the answer. Reinforce definitions, formulas, and principles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">
            Card {currentIndex + 1} of {cards.length}
          </span>
          <button
            onClick={handleShuffle}
            title="Shuffle"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Flashcard Container */}
      <div className="relative perspective-1000 min-h-[320px] flex">
        <div
          id="flashcard-interactive-surface"
          onClick={() => setIsFlipped(prev => !prev)}
          className={`w-full min-h-[320px] p-6 sm:p-10 rounded-3xl cursor-pointer border-2 transition-all duration-300 shadow-md flex flex-col justify-between select-none ${
            isFlipped
              ? 'bg-blue-600 text-white border-blue-500 shadow-blue-500/20'
              : 'bg-white dark:bg-slate-850 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 hover:border-blue-400'
          }`}
        >
          {/* Top meta */}
          <div className="flex items-center justify-between">
            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
              isFlipped 
                ? 'bg-blue-700 text-blue-100' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}>
              Level {currentCard.level} • {currentCard.domain}
            </span>

            <span className={`text-[11px] font-bold uppercase tracking-wider ${
              isFlipped ? 'text-blue-200' : 'text-slate-400'
            }`}>
              {isFlipped ? 'Answer / Explanation' : 'Question (Click to flip)'}
            </span>
          </div>

          {/* Card Body */}
          <div className="my-auto py-6 text-center">
            <h4 className={`text-base sm:text-xl font-black leading-relaxed ${
              isFlipped ? 'text-white' : 'text-slate-900 dark:text-white'
            }`}>
              {isFlipped ? currentCard.back : currentCard.front}
            </h4>

            {isFlipped && currentCard.formula && (
              <div className="mt-4 inline-block px-4 py-2 rounded-xl bg-blue-700/60 border border-blue-400/40 font-mono text-xs text-blue-100 font-semibold">
                {currentCard.formula}
              </div>
            )}

            {isFlipped && currentCard.mnemonic && (
              <p className="mt-3 text-xs text-blue-200 italic">
                Tip: {currentCard.mnemonic}
              </p>
            )}
          </div>

          {/* Bottom Card Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100/20 dark:border-slate-800">
            <div className="text-[11px] opacity-75">
              Click anywhere on card to flip
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleMastered();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isMastered
                  ? (isFlipped ? 'bg-white text-blue-700' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300')
                  : (isFlipped ? 'bg-blue-700 text-white hover:bg-blue-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200')
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isMastered ? 'Mastered' : 'Mark Mastered'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handlePrev}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        {/* Progress Dots */}
        <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
          Mastered: <span className="text-emerald-600 dark:text-emerald-400">{masteredIds.length}</span> / {cards.length}
        </div>

        <button
          onClick={handleNext}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
