import React from 'react';
import { NewsEvent, MarketNewsArticle } from '@/types/newsIntelligence';
import { EconomicEventIntelligenceDetail } from './EconomicEventIntelligenceDetail';
import { useNavigate } from 'react-router-dom';

export interface EventDetailModalProps {
  event: NewsEvent | null;
  onClose: () => void;
  timezone: string;
  userNote?: string;
  onSaveNote?: (eventId: string, note: string) => void;
  onOpenReactionLab?: (eventId: string) => void;
  onOpenScenarioLab?: (eventId: string) => void;
  onOpenAcademy?: (articleId?: string) => void;
  isWatchlisted?: boolean;
  onToggleWatchlist?: (eventId: string) => void;
  onSelectArticle?: (article: MarketNewsArticle) => void;
  onSelectRelatedEvent?: (eventId: string) => void;
}

export function EventDetailModal({
  event,
  onClose,
  timezone,
  userNote = '',
  onSaveNote,
  onOpenReactionLab,
  onOpenScenarioLab,
  onOpenAcademy,
  isWatchlisted = false,
  onToggleWatchlist,
  onSelectArticle,
  onSelectRelatedEvent
}: EventDetailModalProps) {
  const navigate = useNavigate();

  if (!event) return null;

  return (
    <EconomicEventIntelligenceDetail
      event={event}
      onClose={onClose}
      timezone={timezone}
      userNote={userNote}
      onSaveNote={(id, note) => {
        if (onSaveNote) onSaveNote(id, note);
      }}
      isWatchlisted={isWatchlisted}
      onToggleWatchlist={onToggleWatchlist}
      onOpenAcademy={() => {
        if (onOpenAcademy) onOpenAcademy();
        else navigate('/news?tab=academy');
      }}
      onOpenAILabs={() => {
        if (onOpenScenarioLab) onOpenScenarioLab(event.id);
        else navigate('/ai-labs');
      }}
      onSelectArticle={onSelectArticle}
      onSelectRelatedEvent={onSelectRelatedEvent}
    />
  );
}
