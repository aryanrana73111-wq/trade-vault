import React, { useState } from 'react';
import { Layers, RotateCw, CheckCircle2, XCircle, ArrowLeft, ArrowRight, Sparkles, Filter } from 'lucide-react';
import { ACADEMY_FLASHCARDS } from '@/data/academy/flashcards';
import { Flashcard } from '@/types/academy';
import { ScrollableTabs } from './ScrollableTabs';

export const FlashcardsTab: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<Record<string, boolean>>({});
  const [selectedDomain, setSelectedDomain] = useState<string>('All');

  const filteredCards = ACADEMY_FLASHCARDS.filter(c => 
    selectedDomain === 'All' || c.domain === selectedDomain
  );

  const currentCard = filteredCards[currentIndex] || ACADEMY_FLASHCARDS[0];
  const isMastered = !!knownCards[currentCard?.id];
  const totalMastered = Object.values(knownCards).filter(Boolean).length;
  const progressPct = filteredCards.length > 0 
    ? Math.round((totalMastered / filteredCards.length) * 100) 
    : 0;

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(filteredCards.length - 1);
    }
  };

  const markKnown = (known: boolean) => {
    setKnownCards(prev => ({ ...prev, [currentCard.id]: known }));
    handleNext();
  };

  const domains = ['All', 'Market Knowledge', 'Execution', 'Risk Management', 'Technical Analysis', 'Quantitative Analysis', 'Trading Psychology', 'Portfolio Management', 'Professional Practice'];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-900">
          <Layers className="w-3.5 h-3.5" />
          <span>Spaced Repetition Flashcards</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
          Active Recall Memory Deck
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Click or tap the card to flip and verify institutional axioms, mental models, and formulas.
        </p>
      </div>

      {/* Domain Filters & Progress */}
      <div className="space-y-3 pt-2">
        <ScrollableTabs
          tabs={domains.map(d => ({ id: d, label: d }))}
          activeTab={selectedDomain}
          onTabChange={(d) => {
            setSelectedDomain(d);
            setCurrentIndex(0);
            setIsFlipped(false);
          }}
          ariaLabel="Flashcard domains"
        />

        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
          <span>
            Domain: <strong className="text-slate-900 dark:text-slate-100">{selectedDomain}</strong>
          </span>
          <span>
            Card {currentIndex + 1} of {filteredCards.length} ({totalMastered} Mastered)
          </span>
        </div>
      </div>

      {/* The Flashcard */}
      {currentCard && (
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="relative min-h-[300px] w-full bg-white dark:bg-slate-850 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-md hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between select-none"
        >
          {/* Card Top Metadata */}
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
              {currentCard.domain} • Level {currentCard.level}
            </span>

            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Tap to flip</span>
            </div>
          </div>

          {/* Main Card Content */}
          <div className="py-6 text-center">
            {!isFlipped ? (
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Concept Prompt
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 leading-snug">
                  {currentCard.front}
                </h3>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-150">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Institutional Answer
                </span>
                <p className="text-base font-semibold text-slate-800 dark:text-slate-200 leading-relaxed max-w-md mx-auto">
                  {currentCard.back}
                </p>

                {currentCard.formula && (
                  <div className="p-2.5 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900 font-mono text-xs text-blue-700 dark:text-blue-300 inline-block">
                    {currentCard.formula}
                  </div>
                )}

                {currentCard.mnemonic && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 italic">
                    Mnemonic: "{currentCard.mnemonic}"
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Bottom Card Footer */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span>{isFlipped ? 'Answer Revealed' : 'Recall In Mind First'}</span>
            {isMastered && (
              <span className="flex items-center gap-1 text-emerald-600 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                Mastered
              </span>
            )}
          </div>
        </div>
      )}

      {/* Action Controls */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handlePrevious}
          className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors shadow-xs"
          title="Previous Card"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => markKnown(false)}
            className="px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 transition-colors flex items-center gap-1.5"
          >
            <XCircle className="w-4 h-4" />
            <span>Still Learning</span>
          </button>

          <button
            onClick={() => markKnown(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Got It (Mastered)</span>
          </button>
        </div>

        <button
          onClick={handleNext}
          className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors shadow-xs"
          title="Next Card"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
