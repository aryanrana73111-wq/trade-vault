import React, { useState, useEffect } from 'react';
import { ActionProtocol } from '@/data/psychologyProtocols';
import { Button } from '@/components/ui/Button';
import { 
  X, 
  ShieldAlert, 
  Clock, 
  CheckSquare, 
  Square, 
  AlertTriangle, 
  FileText, 
  Play, 
  Pause, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  protocol: ActionProtocol | null;
  onClose: () => void;
}

export const PsychologyProtocolModal: React.FC<Props> = ({ protocol, onClose }) => {
  const [timerSeconds, setTimerSeconds] = useState(600); // 10 minutes default
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!protocol) return;
    // Set timer based on protocol
    if (protocol.id === 'proto-revenge') {
      setTimerSeconds(1800); // 30 mins
    } else if (protocol.id === 'proto-overconfidence') {
      setTimerSeconds(3600); // 60 mins
    } else {
      setTimerSeconds(600); // 10 mins
    }
    setIsTimerRunning(false);
    setCheckedItems({});
  }, [protocol]);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  if (!protocol) return null;

  const toggleCheck = (index: number) => {
    setCheckedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-rose-50/50 dark:bg-rose-950/20 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Emergency Behavioral Protocol
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-medium">{protocol.category}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {protocol.name}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Stand-Down Timer Widget */}
          <div className="p-5 bg-slate-900 text-white rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
            <div className="space-y-1 text-center sm:text-left">
              <div className="text-xs text-slate-400 uppercase font-bold flex items-center justify-center sm:justify-start gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" /> Mandatory Stand-Down Timer
              </div>
              <div className="text-xs text-slate-300">
                Step away from the screen. Let emotional arousal subside completely.
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-3xl font-mono font-bold tracking-wider text-blue-400">
                {formatTimer(timerSeconds)}
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={cn(
                    "text-xs font-semibold gap-1",
                    isTimerRunning ? "bg-amber-600 hover:bg-amber-500 text-white" : "bg-blue-600 hover:bg-blue-500 text-white"
                  )}
                >
                  {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {isTimerRunning ? 'Pause' : 'Start'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimerSeconds(600);
                  }}
                  className="text-xs text-slate-300 border-slate-700 hover:bg-slate-800 p-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Trigger Condition */}
          <div className="p-4 bg-rose-50/60 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/50 space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Trigger Condition
            </span>
            <p className="text-xs sm:text-sm text-rose-950 dark:text-rose-100 font-medium leading-relaxed">
              {protocol.trigger}
            </p>
          </div>

          {/* Recognition Signs */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Immediate Symptom Recognition
            </h4>
            <div className="space-y-1.5">
              {protocol.recognition.map((rec, i) => (
                <div key={i} className="text-xs text-slate-700 dark:text-slate-300 p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 flex items-start gap-2">
                  <span className="text-rose-600 font-bold">•</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Checklist */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Mandatory Action Checklist
            </h4>
            <div className="space-y-2">
              {protocol.actionChecklist.map((item, i) => (
                <div 
                  key={i}
                  onClick={() => toggleCheck(i)}
                  className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <button className="mt-0.5 text-blue-600 dark:text-blue-400 shrink-0">
                    {checkedItems[i] ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-400" />}
                  </button>
                  <span className={cn(
                    "text-xs sm:text-sm leading-relaxed",
                    checkedItems[i] ? "text-slate-400 line-through" : "text-slate-800 dark:text-slate-200"
                  )}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Decision Rule & Risk Rule */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Immutable Decision Rule</span>
              <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-medium">
                {protocol.decisionRule}
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Mandatory Risk Rule</span>
              <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-medium">
                {protocol.riskRule}
              </p>
            </div>
          </div>

          {/* Post-Trade Review */}
          <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-xl space-y-1.5">
            <span className="text-xs font-bold uppercase text-blue-900 dark:text-blue-300">
              Post-Intervention Review Instructions
            </span>
            <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
              {protocol.postReviewInstructions.map((inst, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span>✓</span>
                  <span>{inst}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Professional Behavioral Safeguard • TradeVault Academy
          </div>
          <Button size="sm" onClick={onClose}>
            Acknowledge & Close
          </Button>
        </div>
      </div>
    </div>
  );
};
