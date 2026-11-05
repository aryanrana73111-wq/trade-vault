import React from 'react';
import { Arena } from '@/types';
import { Scale } from 'lucide-react';
import { CompetitionRulesView } from './CompetitionRulesView';
import { AppPortalModal } from '@/components/common/AppPortalModal';

interface CompetitionRulesModalProps {
  arena: Arena;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export function CompetitionRulesModal({ arena, isOpen, onClose, onRefresh }: CompetitionRulesModalProps) {
  return (
    <AppPortalModal
      isOpen={isOpen}
      onClose={onClose}
      title="Competition Rules & Fair Play Engine"
      subtitle={`Automated enforcement parameters governing ${arena.name}`}
      icon={
        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0">
          <Scale className="w-5 h-5" />
        </div>
      }
      maxWidth="max-w-4xl"
    >
      <CompetitionRulesView arena={arena} onRefresh={onRefresh} />
    </AppPortalModal>
  );
}
