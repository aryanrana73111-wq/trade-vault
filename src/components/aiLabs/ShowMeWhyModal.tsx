import React from 'react';
import { 
  X, 
  HelpCircle, 
  CheckCircle, 
  AlertTriangle, 
  Layers, 
  Database, 
  FileSearch,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { ShowMeWhyDetails } from '@/types/aiLabs';
import { Button } from '@/components/ui/Button';

interface ShowMeWhyModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  details: ShowMeWhyDetails;
  onViewEvidence?: () => void;
}

export const ShowMeWhyModal: React.FC<ShowMeWhyModalProps> = ({
  isOpen,
  onClose,
  title,
  details,
  onViewEvidence
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-wider uppercase text-blue-600 dark:text-blue-400">
                  Statistical Transparency
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {details.tradesAnalyzed} trades analyzed
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">{title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-sm max-h-[70vh] overflow-y-auto">
          {/* 1. What was detected */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <FileSearch className="w-3.5 h-3.5 text-blue-500" /> 1. What Was Detected
            </h4>
            <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
              {details.detected}
            </p>
          </div>

          {/* 2. Which fields were used */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-indigo-500" /> 2. Exact Fields Utilized
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {details.fieldsUsed.map(field => (
                <span 
                  key={field}
                  className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-mono font-medium border border-indigo-200 dark:border-indigo-800"
                >
                  trade.{field}
                </span>
              ))}
            </div>
          </div>

          {/* 3 & 4. Supporting and Contradicting Evidence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 rounded-xl p-3.5 space-y-1">
              <h5 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Supporting Evidence
              </h5>
              <p className="text-xs text-emerald-900/90 dark:text-emerald-300/90 leading-relaxed">
                {details.supportingEvidence}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-1">
              <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Contradicting / Neutral Evidence
              </h5>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {details.contradictingEvidence || 'No major conflicting trades recorded within the chosen subset.'}
              </p>
            </div>
          </div>

          {/* 5. Possible Confounding Factors */}
          {details.confoundingFactors && details.confoundingFactors.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-500" /> 5. Possible Confounding Factors
              </h4>
              <ul className="space-y-1 bg-amber-50/40 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200/60 dark:border-amber-900/30">
                {details.confoundingFactors.map((factor, idx) => (
                  <li key={idx} className="text-xs text-amber-900 dark:text-amber-200/90 flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 6. What additional data would improve confidence */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 6. Recommended Data To Improve Confidence
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              {details.dataToImprove}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            AI observations are strictly retrospective historical calculations.
          </span>
          <div className="flex items-center gap-2">
            {onViewEvidence && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onViewEvidence();
                }}
                className="flex items-center gap-1.5 text-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Inspect Exact Trades
              </Button>
            )}
            <Button size="sm" onClick={onClose} className="text-xs">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
