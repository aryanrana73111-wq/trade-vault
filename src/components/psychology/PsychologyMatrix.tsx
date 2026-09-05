import React from 'react';
import { Card } from '@/components/ui/Input';
import { EmotionStats, getSampleSizeReliability } from '@/lib/psychology';
import { formatCurrency, cn } from '@/lib/utils';
import { AlertCircle, HelpCircle, ShieldCheck } from 'lucide-react';

interface PsychologyMatrixProps {
  emotionStats: EmotionStats[];
}

export const PsychologyMatrix: React.FC<PsychologyMatrixProps> = ({ emotionStats }) => {
  return (
    <Card className="p-4 sm:p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Emotion → Behavior → Historical Performance
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Historical outcomes grouped by your recorded emotions at execution. Sample-size reliability tiers prevent premature conclusions.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
              <th className="py-3 px-3 sm:px-4">Emotion</th>
              <th className="py-3 px-3 sm:px-4 text-center">Trades</th>
              <th className="py-3 px-3 sm:px-4 text-center">Win Rate</th>
              <th className="py-3 px-3 sm:px-4 text-center">Avg R</th>
              <th className="py-3 px-3 sm:px-4 text-right">Net P&L</th>
              <th className="py-3 px-3 sm:px-4 text-center">Rule Adherence</th>
              <th className="py-3 px-3 sm:px-4 text-right">Sample Reliability</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {emotionStats.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 dark:text-slate-500">
                  No emotional data logged in historical trades yet. Record emotions on new or existing trades to populate this matrix.
                </td>
              </tr>
            ) : (
              emotionStats.map(stat => {
                const reliability = getSampleSizeReliability(stat.count);

                return (
                  <tr key={stat.emotion} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-3 sm:px-4 font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        stat.avgR > 0.2 ? "bg-emerald-500" :
                        stat.avgR < -0.1 ? "bg-red-500" : "bg-blue-500"
                      )} />
                      {stat.emotion}
                    </td>

                    <td className="py-3.5 px-3 sm:px-4 text-center font-medium text-slate-700 dark:text-slate-300">
                      {stat.count} {stat.count === 1 ? 'trade' : 'trades'}
                    </td>

                    <td className="py-3.5 px-3 sm:px-4 text-center">
                      {stat.count < 3 ? (
                        <span className="text-slate-400 italic">Insufficient Data</span>
                      ) : (
                        <span className={cn("font-bold", stat.winRate >= 50 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>
                          {stat.winRate}%
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 sm:px-4 text-center font-semibold">
                      {stat.count < 3 ? (
                        <span className="text-slate-400 italic">-</span>
                      ) : (
                        <span className={cn(stat.avgR > 0 ? "text-emerald-600 dark:text-emerald-400" : (stat.avgR < 0 ? "text-red-600 dark:text-red-400" : "text-slate-500"))}>
                          {stat.avgR > 0 ? '+' : ''}{stat.avgR}R
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 sm:px-4 text-right font-bold">
                      {stat.count < 3 ? (
                        <span className="text-slate-400 italic">-</span>
                      ) : (
                        <span className={cn(stat.netPnl > 0 ? "text-emerald-600 dark:text-emerald-400" : (stat.netPnl < 0 ? "text-red-600 dark:text-red-400" : "text-slate-500"))}>
                          {stat.netPnl > 0 ? '+' : ''}{formatCurrency(stat.netPnl)}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 sm:px-4 text-center">
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded font-semibold text-[11px]",
                        stat.avgRuleAdherence >= 90 ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300" :
                        stat.avgRuleAdherence < 70 ? "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300" :
                        "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                      )}>
                        {stat.avgRuleAdherence}%
                      </span>
                    </td>

                    <td className="py-3.5 px-3 sm:px-4 text-right">
                      <span className={cn(
                        "inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold",
                        reliability === 'Insufficient Data' ? "bg-slate-100 dark:bg-slate-800 text-slate-500" :
                        reliability === 'Early Evidence' ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900" :
                        reliability === 'Preliminary Observation' ? "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900" :
                        "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900"
                      )}>
                        {reliability}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 dark:text-slate-500">
        <span>Sample tiers: &lt;5: Insufficient Data • 5–14: Early Evidence • 15–29: Preliminary Observation • 30+: More Reliable Historical Observation</span>
        <span>All findings represent historical observations, not mathematical guarantees.</span>
      </div>
    </Card>
  );
};
