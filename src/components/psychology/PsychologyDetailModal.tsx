import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trade, Emotion, Strategy } from '@/types';
import { Card, Input, Label, Textarea, Badge } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { formatCurrency, cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  calculateTradePsychologyCompletion,
  analyzeTradeObservations,
  buildTradePsychologyTimeline
} from '@/lib/psychology';
import { getSettings } from '@/lib/settings';
import {
  X,
  Brain,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Sparkles,
  BookOpen,
  Edit3,
  Save,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Zap,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

interface PsychologyDetailModalProps {
  trade: Trade | null;
  previousTrade?: Trade;
  strategies: Strategy[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateTrade: (id: string, updates: Partial<Trade>) => Promise<void>;
  onDeleteTrade?: (id: string) => Promise<void>;
}

const ALL_EMOTIONS: Emotion[] = [
  'Confident', 'Unconfident'
];

export const PsychologyDetailModal: React.FC<PsychologyDetailModalProps> = ({
  trade,
  previousTrade,
  strategies,
  isOpen,
  onClose,
  onUpdateTrade,
  onDeleteTrade
}) => {
  const navigate = useNavigate();
  const settings = getSettings();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Editable psychology state
  const [emotions, setEmotions] = useState<Emotion[]>([]);
  const [confidence, setConfidence] = useState<number | undefined>(undefined);
  const [setupQuality, setSetupQuality] = useState<'A+' | 'B' | 'C' | ''>('');
  const [entryReason, setEntryReason] = useState('');
  
  const [duringEmotions, setDuringEmotions] = useState<Emotion[]>([]);
  const [duringEmotionalState, setDuringEmotionalState] = useState('');
  const [ruleAdherence, setRuleAdherence] = useState<number>(100);
  const [riskChanged, setRiskChanged] = useState<boolean>(false);
  const [riskChangeNotes, setRiskChangeNotes] = useState('');
  const [isReentry, setIsReentry] = useState<boolean>(false);
  const [reentryReason, setReentryReason] = useState('');
  const [positionManagement, setPositionManagement] = useState('');

  const [exitEmotion, setExitEmotion] = useState<Emotion | ''>('');
  const [notes, setNotes] = useState('');
  const [mistake, setMistake] = useState('');
  const [learning, setLearning] = useState('');
  const [whatToRepeat, setWhatToRepeat] = useState('');
  const [whatToAvoid, setWhatToAvoid] = useState('');

  useEffect(() => {
    if (trade) {
      setEmotions(trade.emotions || []);
      setConfidence(trade.confidence);
      setSetupQuality(trade.setupQuality || '');
      setEntryReason(trade.entryReason || '');

      setDuringEmotions(trade.duringEmotions || []);
      setDuringEmotionalState(trade.duringEmotionalState || '');
      setRuleAdherence(trade.ruleAdherence !== undefined ? trade.ruleAdherence : 100);
      setRiskChanged(Boolean(trade.riskChanged));
      setRiskChangeNotes(trade.riskChangeNotes || '');
      setIsReentry(Boolean(trade.isReentry));
      setReentryReason(trade.reentryReason || '');
      setPositionManagement(trade.positionManagement || '');

      setExitEmotion(trade.exitEmotion || '');
      setNotes(trade.notes || '');
      setMistake(trade.mistake || '');
      setLearning(trade.learning || '');
      setWhatToRepeat(trade.whatToRepeat || '');
      setWhatToAvoid(trade.whatToAvoid || '');
      setIsEditing(false);
    }
  }, [trade]);

  if (!isOpen || !trade) return null;

  const completion = calculateTradePsychologyCompletion(trade);
  const observations = analyzeTradeObservations(trade, previousTrade, settings.risk.defaultRisk);
  const timelineStages = buildTradePsychologyTimeline(trade);

  const strategyObj = strategies.find(s => s.id === trade.strategy);
  const strategyName = strategyObj ? strategyObj.name : trade.strategy || 'Unspecified';

  const toggleEmotion = (e: Emotion, list: Emotion[], setList: (l: Emotion[]) => void) => {
    if (list.includes(e)) {
      setList(list.filter(x => x !== e));
    } else {
      setList([...list, e]);
    }
  };

  const handleSavePsychology = async () => {
    setIsSaving(true);
    try {
      const updates: Partial<Trade> = {
        emotions,
        confidence: confidence !== undefined ? Number(confidence) : undefined,
        setupQuality: setupQuality || undefined,
        entryReason: entryReason.trim() || undefined,
        duringEmotions,
        duringEmotionalState: duringEmotionalState.trim() || undefined,
        ruleAdherence: Number(ruleAdherence),
        riskChanged,
        riskChangeNotes: riskChanged ? riskChangeNotes.trim() : undefined,
        isReentry,
        reentryReason: isReentry ? reentryReason.trim() : undefined,
        positionManagement: positionManagement.trim() || undefined,
        exitEmotion: (exitEmotion as Emotion) || undefined,
        notes: notes.trim(),
        mistake: mistake.trim(),
        learning: learning.trim(),
        whatToRepeat: whatToRepeat.trim() || undefined,
        whatToAvoid: whatToAvoid.trim() || undefined,
      };

      await onUpdateTrade(trade.id, updates);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update psychology data:', err);
      alert('Could not update psychology records.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConvertToRule = () => {
    if (!trade.learning?.trim()) return;
    navigate('/learning-rules?tab=rules', {
      state: {
        prefilledRule: {
          text: trade.learning.trim(),
          category: 'Psychology'
        }
      }
    });
    onClose();
  };

  const handleViewJournalEntry = () => {
    navigate('/journal');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl h-[92vh] max-h-[900px] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {trade.market} {trade.direction} Psychology Record
                </h2>
                <Badge variant={trade.direction === 'BUY' ? 'success' : 'danger'} className="text-xs">
                  {trade.direction}
                </Badge>
                {completion.status === 'Complete' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Complete (100%)
                  </span>
                ) : completion.status === 'Partially Completed' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                    <Clock className="w-3.5 h-3.5" /> Partial ({completion.score}%)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                    <AlertCircle className="w-3.5 h-3.5" /> Unrecorded (0%)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Executed on {format(new Date(trade.date), 'MMMM dd, yyyy')} {trade.time ? `at ${trade.time}` : ''} • Single source of truth trade record
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="gap-1.5 text-xs font-medium border-slate-300 dark:border-slate-700"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Psychology
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleSavePsychology}
                disabled={isSaving}
                className="gap-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-3.5 h-3.5" /> {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Toast on save */}
          {saveSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Psychology data updated and attached directly to the existing trade record.
            </div>
          )}

          {/* 1. TRADE SUMMARY */}
          <Card className="p-4 sm:p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-500" /> Trade Summary & Parameters
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewJournalEntry}
                className="h-7 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 gap-1 px-2"
              >
                View Journal Entry <ExternalLink className="w-3 h-3" />
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 text-xs">
              <div>
                <div className="text-slate-400 dark:text-slate-500">Market</div>
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{trade.market}</div>
              </div>
              <div>
                <div className="text-slate-400 dark:text-slate-500">Direction</div>
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{trade.direction}</div>
              </div>
              <div>
                <div className="text-slate-400 dark:text-slate-500">Entry Price</div>
                <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">{trade.entry}</div>
              </div>
              <div>
                <div className="text-slate-400 dark:text-slate-500">Stop Loss</div>
                <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">{trade.stopLoss || '-'}</div>
              </div>
              <div>
                <div className="text-slate-400 dark:text-slate-500">Take Profit</div>
                <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">{trade.takeProfit || '-'}</div>
              </div>
              <div>
                <div className="text-slate-400 dark:text-slate-500">Risk Amount</div>
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{trade.risk ? formatCurrency(trade.risk) : '-'}</div>
              </div>
              <div>
                <div className="text-slate-400 dark:text-slate-500">Result</div>
                <div className={cn("font-bold text-sm", 
                  trade.result === 'WIN' ? "text-green-600 dark:text-green-400" :
                  trade.result === 'LOSS' ? "text-red-600 dark:text-red-400" :
                  "text-slate-700 dark:text-slate-300"
                )}>
                  {trade.result || 'PENDING'}
                </div>
              </div>
              <div>
                <div className="text-slate-400 dark:text-slate-500">Realized P&L</div>
                <div className={cn("font-bold text-sm", 
                  (trade.pnl || 0) > 0 ? "text-green-600 dark:text-green-400" :
                  (trade.pnl || 0) < 0 ? "text-red-600 dark:text-red-400" :
                  "text-slate-500"
                )}>
                  {trade.pnl !== undefined ? `${trade.pnl > 0 ? '+' : ''}${formatCurrency(trade.pnl)}` : '-'}
                </div>
              </div>
              <div>
                <div className="text-slate-400 dark:text-slate-500">R:R / R-Multiple</div>
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {trade.rMultiple !== undefined ? `${trade.rMultiple > 0 ? '+' : ''}${trade.rMultiple}R` : trade.rrRatio ? `1:${trade.rrRatio}` : '-'}
                </div>
              </div>
              <div>
                <div className="text-slate-400 dark:text-slate-500">Strategy</div>
                <div className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">{strategyName}</div>
              </div>
              <div>
                <div className="text-slate-400 dark:text-slate-500">Session</div>
                <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">{trade.session || '-'}</div>
              </div>
              <div>
                <div className="text-slate-400 dark:text-slate-500">Timeframe</div>
                <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">{trade.timeframe || '-'}</div>
              </div>
            </div>
          </Card>

          {/* 2. RECORDED BEHAVIORAL OBSERVATIONS ("What Happened?") */}
          <Card className="p-4 sm:p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-500" /> Recorded Behavioral Observations
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Objective historical findings derived strictly from your entered numbers, timings, checklist confirmations, and emotional logs:
            </p>
            <div className="space-y-2">
              {observations.map(obs => (
                <div
                  key={obs.id}
                  className={cn(
                    "p-3 rounded-xl border text-xs flex items-start gap-2.5",
                    obs.type === 'positive' ? "bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200" :
                    obs.type === 'advisory' ? "bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200" :
                    "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                  )}
                >
                  {obs.type === 'positive' && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />}
                  {obs.type === 'advisory' && <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />}
                  {obs.type === 'neutral' && <Brain className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />}
                  <span>{obs.message}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* 3. PSYCHOLOGY TIMELINE */}
          {timelineStages.length > 0 && (
            <Card className="p-4 sm:p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-500" /> Psychology & Execution Timeline
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                {timelineStages.map((stage, idx) => (
                  <div key={stage.stage} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                        <span>{idx + 1}. {stage.stage}</span>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        {stage.items.map((it, i) => (
                          <div key={i}>
                            <span className="text-slate-400 dark:text-slate-500 block text-[10px]">{it.label}</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{it.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 4. BEFORE TRADE / DURING TRADE / AFTER TRADE WORKFLOW */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* BEFORE TRADE */}
            <Card className="p-4 sm:p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Before Trade</h4>
              </div>

              {/* Initial Emotions */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Initial Emotions</Label>
                {isEditing ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {ALL_EMOTIONS.map(e => {
                      const selected = emotions.includes(e);
                      return (
                        <button
                          key={e}
                          type="button"
                          onClick={() => toggleEmotion(e, emotions, setEmotions)}
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-xs font-medium transition-all border",
                            selected
                              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200"
                          )}
                        >
                          {e}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {emotions.length > 0 ? (
                      emotions.map(e => (
                        <span key={e} className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                          {e}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No emotions recorded before entry</span>
                    )}
                  </div>
                )}
              </div>

              {/* Confidence */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Confidence Rating {confidence !== undefined ? `(${confidence}/10)` : ''}
                </Label>
                {isEditing ? (
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={confidence || 7}
                    onChange={e => setConfidence(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                ) : (
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {confidence !== undefined ? `${confidence} of 10` : <span className="text-slate-400 italic">Not set</span>}
                  </div>
                )}
              </div>

              {/* Setup Quality */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Setup Quality Grade</Label>
                {isEditing ? (
                  <div className="flex gap-2">
                    {(['A+', 'B', 'C'] as const).map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setSetupQuality(g)}
                        className={cn(
                          "px-3 py-1 text-xs rounded-lg font-bold border transition-colors",
                          setupQuality === g 
                            ? "bg-purple-600 text-white border-purple-600" 
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                        )}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {setupQuality ? (
                      <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold">
                        {setupQuality}
                      </span>
                    ) : <span className="text-slate-400 italic">Unspecified</span>}
                  </div>
                )}
              </div>

              {/* Reason for Entry */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Reason for Entry</Label>
                {isEditing ? (
                  <Textarea
                    value={entryReason}
                    onChange={e => setEntryReason(e.target.value)}
                    placeholder="Why did you enter? Key triggers, confirmation confluence..."
                    className="text-xs h-20"
                  />
                ) : (
                  <div className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 min-h-[50px]">
                    {entryReason || trade.notes || <span className="text-slate-400 italic">No entry rationale documented</span>}
                  </div>
                )}
              </div>
            </Card>

            {/* DURING TRADE */}
            <Card className="p-4 sm:p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">During Trade</h4>
              </div>

              {/* Rule Adherence */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <Label className="font-semibold text-slate-700 dark:text-slate-300">Rule Adherence</Label>
                  <span className={cn("font-bold", ruleAdherence >= 90 ? "text-emerald-600" : (ruleAdherence < 70 ? "text-red-600" : "text-amber-600"))}>
                    {ruleAdherence}%
                  </span>
                </div>
                {isEditing ? (
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={ruleAdherence}
                    onChange={e => setRuleAdherence(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                ) : (
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all", ruleAdherence >= 90 ? "bg-emerald-500" : ruleAdherence < 70 ? "bg-red-500" : "bg-amber-500")}
                      style={{ width: `${ruleAdherence}%` }}
                    />
                  </div>
                )}
              </div>

              {/* During Emotional State */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">In-Trade Emotional State</Label>
                {isEditing ? (
                  <Input
                    value={duringEmotionalState}
                    onChange={e => setDuringEmotionalState(e.target.value)}
                    placeholder="e.g. Tempted to exit early, patient, fearful of drawdown..."
                    className="text-xs h-8"
                  />
                ) : (
                  <div className="text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                    {duringEmotionalState || <span className="text-slate-400 italic">No in-trade notes recorded</span>}
                  </div>
                )}
              </div>

              {/* Position Management */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Position Management</Label>
                {isEditing ? (
                  <Input
                    value={positionManagement}
                    onChange={e => setPositionManagement(e.target.value)}
                    placeholder="e.g. Moved SL to Breakeven, Scaled out 50%, Held to TP"
                    className="text-xs h-8"
                  />
                ) : (
                  <div className="text-xs text-slate-800 dark:text-slate-200">
                    {positionManagement || <span className="text-slate-400 italic">Standard held position</span>}
                  </div>
                )}
              </div>

              {/* Risk Changed */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Did Risk Change In-Trade?</span>
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={riskChanged}
                      onChange={e => setRiskChanged(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  ) : (
                    <span className={cn("text-xs font-bold", riskChanged ? "text-red-600" : "text-slate-400")}>
                      {riskChanged ? 'Yes (Modified)' : 'No'}
                    </span>
                  )}
                </div>
                {(riskChanged || isEditing) && (
                  <Input
                    disabled={!riskChanged && isEditing}
                    value={riskChangeNotes}
                    onChange={e => setRiskChangeNotes(e.target.value)}
                    placeholder="Why was risk modified? Added to loser, moved SL wider..."
                    className="text-xs h-8"
                  />
                )}
              </div>

              {/* Re-entry */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Is this a Re-entry?</span>
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={isReentry}
                      onChange={e => setIsReentry(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  ) : (
                    <span className={cn("text-xs font-bold", isReentry ? "text-amber-600" : "text-slate-400")}>
                      {isReentry ? 'Yes (Re-entry)' : 'No'}
                    </span>
                  )}
                </div>
                {(isReentry || isEditing) && (
                  <Input
                    disabled={!isReentry && isEditing}
                    value={reentryReason}
                    onChange={e => setReentryReason(e.target.value)}
                    placeholder="Re-entry justification / trigger..."
                    className="text-xs h-8"
                  />
                )}
              </div>
            </Card>

            {/* AFTER TRADE */}
            <Card className="p-4 sm:p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">After Trade & Reflection</h4>
              </div>

              {/* Post-Trade Emotion */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Emotion After Closing</Label>
                {isEditing ? (
                  <select
                    value={exitEmotion}
                    onChange={e => setExitEmotion(e.target.value as Emotion)}
                    className="w-full h-8 px-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="">-- Select Post-Trade Emotion --</option>
                    {ALL_EMOTIONS.map(e => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                ) : (
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {exitEmotion ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {exitEmotion}
                      </span>
                    ) : <span className="text-slate-400 italic">Not recorded</span>}
                  </div>
                )}
              </div>

              {/* Mistake */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-red-600 dark:text-red-400">Mistake Made (if any)</Label>
                {isEditing ? (
                  <Textarea
                    value={mistake}
                    onChange={e => setMistake(e.target.value)}
                    placeholder="Entered too early, moved SL, overtraded, took profit prematurely..."
                    className="text-xs h-16"
                  />
                ) : (
                  <div className="text-xs text-red-700 dark:text-red-300 bg-red-50/50 dark:bg-red-950/30 p-2.5 rounded-lg border border-red-100 dark:border-red-900/60">
                    {mistake || <span className="text-slate-400 italic">No mistake noted</span>}
                  </div>
                )}
              </div>

              {/* Learning & Rule Conversion */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-green-600 dark:text-green-400">Learning From This Trade</Label>
                  {trade.learning && !isEditing && (
                    <button
                      type="button"
                      onClick={handleConvertToRule}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center gap-1"
                    >
                      <BookOpen className="w-3 h-3" /> Convert to Rule
                    </button>
                  )}
                </div>
                {isEditing ? (
                  <Textarea
                    value={learning}
                    onChange={e => setLearning(e.target.value)}
                    placeholder="What will you do differently next time? Core takeaway..."
                    className="text-xs h-16"
                  />
                ) : (
                  <div className="text-xs text-green-800 dark:text-green-200 bg-green-50/50 dark:bg-green-950/30 p-2.5 rounded-lg border border-green-100 dark:border-green-900/60">
                    {learning || <span className="text-slate-400 italic">No learning recorded yet</span>}
                  </div>
                )}
              </div>

              {/* What to repeat & what to avoid */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">What to Repeat</Label>
                  {isEditing ? (
                    <Input
                      value={whatToRepeat}
                      onChange={e => setWhatToRepeat(e.target.value)}
                      placeholder="e.g. Waiting for retest"
                      className="text-xs h-8"
                    />
                  ) : (
                    <div className="text-xs text-slate-700 dark:text-slate-300">
                      {whatToRepeat || <span className="text-slate-400 italic">-</span>}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">What to Avoid</Label>
                  {isEditing ? (
                    <Input
                      value={whatToAvoid}
                      onChange={e => setWhatToAvoid(e.target.value)}
                      placeholder="e.g. Entering before close"
                      className="text-xs h-8"
                    />
                  ) : (
                    <div className="text-xs text-slate-700 dark:text-slate-300">
                      {whatToAvoid || <span className="text-slate-400 italic">-</span>}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* 5. SCREENSHOT VIEW */}
          {(trade.screenshot || trade.screenshots?.before || trade.screenshots?.after) && (
            <Card className="p-4 sm:p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                Execution Chart Screenshot
              </h3>
              <div className="max-w-4xl rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-black/5 dark:bg-black/40">
                <img
                  src={trade.screenshot || trade.screenshots?.after || trade.screenshots?.before}
                  alt="Trade Chart Execution"
                  className="w-full object-contain max-h-[450px]"
                />
              </div>
            </Card>
          )}

        </div>

        {/* Modal Bottom Bar */}
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-500 dark:text-slate-400">
              Completion: <strong className="text-slate-800 dark:text-slate-200">{completion.completedCount} of {completion.totalCount} behavioral fields</strong> ({completion.score}%)
            </span>
            {trade.learning && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleConvertToRule}
                className="h-8 text-xs font-semibold text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/40 gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" /> Convert Learning to Rule
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(false)}
                className="h-8 text-xs"
              >
                Cancel
              </Button>
            )}
            {isEditing ? (
              <Button
                variant="primary"
                size="sm"
                onClick={handleSavePsychology}
                disabled={isSaving}
                className="h-8 text-xs font-medium bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-3.5 h-3.5" /> {isSaving ? 'Saving...' : 'Save Psychology Data'}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="h-8 text-xs"
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
