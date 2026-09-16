import React, { useState, useMemo } from 'react';
import { NewsEvent, MarketNewsArticle, CalendarEventAlert } from '@/types/newsIntelligence';
import { getEventIntelligenceDetail } from '@/data/eventIntelligenceData';
import { getMarketNews } from '@/data/marketNewsData';
import { EventDetailHeader } from './detail/EventDetailHeader';
import { CoreDataSurpriseCard } from './detail/CoreDataSurpriseCard';
import { IndicatorExplanationSection } from './detail/IndicatorExplanationSection';
import { ExplainLikeATraderSection } from './detail/ExplainLikeATraderSection';
import { HistoricalTimeSeriesChart } from './detail/HistoricalTimeSeriesChart';
import { ReleaseHistoryTable } from './detail/ReleaseHistoryTable';
import { MarketReactionPanel } from './detail/MarketReactionPanel';
import { WhatHappenedLastTimeCard } from './detail/WhatHappenedLastTimeCard';
import { RelatedNewsAndEvents } from './detail/RelatedNewsAndEvents';
import { CountryAndCentralBankContext } from './detail/CountryAndCentralBankContext';
import { PersonalTradeVaultHistoryCard } from './detail/PersonalTradeVaultHistoryCard';
import { PersonalEventStudyModal } from './detail/PersonalEventStudyModal';
import { PrivateEventNotesCard } from './detail/PrivateEventNotesCard';
import { ConfigureAlertModal } from './calendar/ConfigureAlertModal';
import { RevisionDetailsPopover } from './calendar/RevisionDetailsPopover';
import { 
  GraduationCap, 
  FlaskConical, 
  LayoutDashboard, 
  ShieldCheck, 
  ExternalLink,
  SlidersHorizontal,
  Bookmark
} from 'lucide-react';

export interface EconomicEventIntelligenceDetailProps {
  event: NewsEvent;
  onClose: () => void;
  timezone: string;
  userNote?: string;
  onSaveNote: (eventId: string, note: string) => void;
  isWatchlisted?: boolean;
  onToggleWatchlist?: (eventId: string) => void;
  onOpenAcademy?: () => void;
  onOpenAILabs?: () => void;
  onSelectArticle?: (article: MarketNewsArticle) => void;
  onSelectRelatedEvent?: (eventId: string) => void;
}

export function EconomicEventIntelligenceDetail({
  event,
  onClose,
  timezone,
  userNote = '',
  onSaveNote,
  isWatchlisted = false,
  onToggleWatchlist,
  onOpenAcademy,
  onOpenAILabs,
  onSelectArticle,
  onSelectRelatedEvent
}: EconomicEventIntelligenceDetailProps) {
  // Modal states
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isRevisionPopoverOpen, setIsRevisionPopoverOpen] = useState(false);
  const [isStudyModalOpen, setIsStudyModalOpen] = useState(false);
  const [isAlertSet, setIsAlertSet] = useState(false);
  const [isInCommandCenter, setIsInCommandCenter] = useState(false);

  // Compute rich event detail data
  const intelligence = useMemo(() => {
    return getEventIntelligenceDetail(event);
  }, [event]);

  // Load related news articles
  const relatedArticles = useMemo(() => {
    try {
      const allNews = getMarketNews();
      return allNews.filter(n => {
        if (n.relatedEventId === event.id) return true;
        if (n.category && event.category && n.category.toLowerCase() === event.category.toLowerCase()) return true;
        if (n.markets && n.markets.includes(event.currency)) return true;
        return false;
      });
    } catch {
      return [];
    }
  }, [event]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex flex-col items-center p-0 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-7xl bg-white dark:bg-slate-950 border-0 sm:border border-slate-200 dark:border-slate-800 sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col min-h-screen sm:min-h-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. STICKY / COMPREHENSIVE HEADER */}
        <EventDetailHeader
          event={event}
          timezone={timezone}
          onBackToCalendar={onClose}
          isWatchlisted={isWatchlisted}
          onToggleWatchlist={() => onToggleWatchlist && onToggleWatchlist(event.id)}
          onOpenAlertModal={() => setIsAlertModalOpen(true)}
          isAlertSet={isAlertSet}
          onAddToCommandCenter={() => setIsInCommandCenter(!isInCommandCenter)}
          isInCommandCenter={isInCommandCenter}
        />

        {/* 2. BODY CONTENT - RESPONSIVE 2-COLUMN ON DESKTOP/TABLET, SINGLE COLUMN ON MOBILE */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-8 bg-slate-50/50 dark:bg-slate-950">
          {/* LEFT / MAIN COLUMN (8 cols on desktop) */}
          <div className="lg:col-span-8 space-y-6">
            {/* CORE DATA & SURPRISE */}
            <section id="core-data-section">
              <CoreDataSurpriseCard
                event={event}
                surpriseNumeric={intelligence.surpriseNumeric}
                surpriseLabel={intelligence.surpriseLabel}
                onOpenRevisionPopover={() => setIsRevisionPopoverOpen(true)}
              />
            </section>

            {/* WHAT IS THIS INDICATOR & WHY TRADERS CARE */}
            <section id="explanation-section">
              <IndicatorExplanationSection
                event={event}
                onOpenAcademy={onOpenAcademy}
              />
            </section>

            {/* EXPLAIN LIKE A TRADER */}
            <section id="trader-synthesis-section">
              <ExplainLikeATraderSection
                data={intelligence.explainLikeATrader}
              />
            </section>

            {/* HISTORICAL TIME-SERIES CHART (ACTUAL VS FORECAST ACCURACY) */}
            <section id="historical-chart-section">
              <HistoricalTimeSeriesChart
                data={intelligence.timeSeriesData}
                unit={event.unit}
                eventName={event.name}
              />
            </section>

            {/* RELEASE HISTORY TABLE */}
            <section id="release-history-section">
              <ReleaseHistoryTable
                releases={intelligence.releaseHistory}
                unit={event.unit}
                onOpenRevisionPopover={() => setIsRevisionPopoverOpen(true)}
              />
            </section>

            {/* EVENT-WINDOW MARKET REACTION & NORMALIZED PERCENTAGE MOVE */}
            <section id="market-reaction-section">
              <MarketReactionPanel
                windows={intelligence.marketReactionWindows}
                eventName={event.name}
              />
            </section>

            {/* WHAT HAPPENED LAST TIME? */}
            <section id="last-time-section">
              <WhatHappenedLastTimeCard
                entry={intelligence.lastTimeEntry}
                unit={event.unit}
                eventName={event.name}
              />
            </section>
          </div>

          {/* RIGHT / CONTEXTUAL INTELLIGENCE PANEL (4 cols on desktop) */}
          <div className="lg:col-span-4 space-y-6">
            {/* PERSONAL TRADEVAULT HISTORY */}
            <section id="personal-history-section">
              <PersonalTradeVaultHistoryCard
                event={event}
                onOpenEventStudy={() => setIsStudyModalOpen(true)}
              />
            </section>

            {/* PRIVATE NOTES */}
            <section id="private-notes-section">
              <PrivateEventNotesCard
                eventId={event.id}
                initialNote={userNote}
                onSaveNote={onSaveNote}
              />
            </section>

            {/* COUNTRY CONTEXT & CENTRAL BANK */}
            <section id="country-context-section">
              <CountryAndCentralBankContext
                country={intelligence.countryProfile}
                centralBank={intelligence.centralBank}
                currency={event.currency}
              />
            </section>

            {/* TRADEVAULT ECOSYSTEM ACCELERATORS */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                TradeVault Accelerators
              </h3>

              <div className="space-y-2">
                {onOpenAcademy && (
                  <button
                    type="button"
                    onClick={onOpenAcademy}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 text-left transition-all flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <div>
                        <strong className="text-slate-900 dark:text-white block font-bold">
                          Academy Masterclass
                        </strong>
                        <span className="text-[11px] text-slate-500">
                          Deep-dive playbook for {event.name}
                        </span>
                      </div>
                    </div>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">→</span>
                  </button>
                )}

                {onOpenAILabs && (
                  <button
                    type="button"
                    onClick={onOpenAILabs}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 hover:bg-purple-50/50 dark:hover:bg-purple-950/30 text-left transition-all flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <FlaskConical className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <div>
                        <strong className="text-slate-900 dark:text-white block font-bold">
                          AI & Quant Labs
                        </strong>
                        <span className="text-[11px] text-slate-500">
                          Hypothesis simulation & backtest
                        </span>
                      </div>
                    </div>
                    <span className="text-purple-600 dark:text-purple-400 font-bold">→</span>
                  </button>
                )}
              </div>
            </div>

            {/* DATA TRANSPARENCY & COMPLIANCE FOOTER */}
            <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5 leading-relaxed">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                <span>TradeVault Data Transparency Guarantee</span>
              </div>
              <p>
                Metrics published in this intelligence terminal are directly sourced from official sovereign institutions ({event.source || 'BLS, Fed, ECB, ONS'}). TradeVault does not forecast speculative directional moves or advise trading actions prior to high-volatility catalysts.
              </p>
            </div>
          </div>

          {/* FULL WIDTH SPAN: RELATED NEWS AND EVENTS SEQUENCE */}
          <div className="lg:col-span-12">
            <RelatedNewsAndEvents
              articles={relatedArticles}
              relatedEvents={intelligence.relatedEvents}
              onSelectArticle={(art) => onSelectArticle && onSelectArticle(art)}
              onSelectRelatedEvent={(id) => onSelectRelatedEvent && onSelectRelatedEvent(id)}
            />
          </div>
        </div>
      </div>

      {/* POPUP: CONFIGURE ALERT MODAL */}
      {isAlertModalOpen && (
        <ConfigureAlertModal
          event={event}
          onSaveAlert={(alert: CalendarEventAlert) => {
            setIsAlertSet(true);
            setIsAlertModalOpen(false);
          }}
          onRemoveAlert={() => {
            setIsAlertSet(false);
            setIsAlertModalOpen(false);
          }}
          onClose={() => setIsAlertModalOpen(false)}
        />
      )}

      {/* POPUP: REVISION DETAILS POPOVER */}
      {isRevisionPopoverOpen && (
        <RevisionDetailsPopover
          event={event}
          onClose={() => setIsRevisionPopoverOpen(false)}
        />
      )}

      {/* POPUP: PERSONAL EVENT STUDY MODAL */}
      {isStudyModalOpen && (
        <PersonalEventStudyModal
          isOpen={isStudyModalOpen}
          onClose={() => setIsStudyModalOpen(false)}
          event={event}
        />
      )}
    </div>
  );
}
