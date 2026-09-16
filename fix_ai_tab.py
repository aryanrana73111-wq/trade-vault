import os
import re

path = 'src/components/aiLabs/AITradingAnalystTab.tsx'
with open(path, 'r') as f:
    content = f.read()

old_alternative = """                    {/* Alternative explanation */}
                    {obs.possibleAlternatives && obs.possibleAlternatives.length > 0 && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                        <strong className="font-semibold text-slate-600 dark:text-slate-300 not-italic">Alternative Explanation: </strong>
                        {obs.possibleAlternatives[0]}
                      </div>
                    )}"""

new_alternative = """                    {/* Detailed Analysis */}
                    <div className="space-y-2 mt-2">
                      {obs.possibleAlternatives && obs.possibleAlternatives.length > 0 && (
                        <div className="text-[11px] text-slate-600 dark:text-slate-400">
                          <strong className="font-semibold text-slate-700 dark:text-slate-300">POSSIBLE EXPLANATION: </strong>
                          {obs.possibleAlternatives[0]}
                        </div>
                      )}
                      {obs.counterEvidence && (
                        <div className="text-[11px] text-slate-600 dark:text-slate-400">
                          <strong className="font-semibold text-slate-700 dark:text-slate-300">COUNTER-EVIDENCE: </strong>
                          {obs.counterEvidence}
                        </div>
                      )}
                      {obs.limitation && (
                        <div className="text-[11px] text-slate-600 dark:text-slate-400">
                          <strong className="font-semibold text-slate-700 dark:text-slate-300">LIMITATION: </strong>
                          {obs.limitation}
                        </div>
                      )}
                      {obs.nextTest && (
                        <div className="text-[11px] text-slate-600 dark:text-slate-400">
                          <strong className="font-semibold text-slate-700 dark:text-slate-300">NEXT TEST: </strong>
                          {obs.nextTest}
                        </div>
                      )}
                    </div>"""

content = content.replace(old_alternative, new_alternative)

with open(path, 'w') as f:
    f.write(content)

print("AI Tab fixed")
