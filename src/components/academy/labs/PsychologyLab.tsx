import React, { useState } from 'react';
import { 
  Brain, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  RotateCcw, 
  ArrowRight,
  ShieldCheck,
  Compass,
  Award
} from 'lucide-react';

interface ScenarioChoice {
  id: string;
  text: string;
  isProfessional: boolean;
  bias: string;
  consequence: string;
  riskImplication: string;
  alternative: string;
}

interface Scenario {
  id: string;
  title: string;
  situation: string;
  context: string;
  choices: ScenarioChoice[];
}

const SCENARIOS: Scenario[] = [
  {
    id: 'losing_streak',
    title: 'Scenario 1: You lost three trades in a row.',
    situation: 'You executed three consecutive valid playbook setups today. All three hit their stop-loss for -1R each (-3R total). You now spot a new setup forming that looks promising.',
    context: 'Capital loss: -3R | Emotional state: Elevated cortisol, urge to recover losses quickly.',
    choices: [
      {
        id: 'c1',
        text: 'Double position size on the new setup to win back today’s entire loss on a single trade.',
        isProfessional: false,
        bias: 'Revenge Trading & Gambler’s Fallacy (Martingale Bias)',
        consequence: 'Doubling size after losses dramatically accelerates drawdowns. If this fourth trade fails, your daily loss spikes from -3R to -5R, severely destabilizing your psychology.',
        riskImplication: 'Exponential risk of ruin. Martingale sizing is the primary mathematical driver of catastrophic account blowups in retail trading.',
        alternative: 'Maintain standard 1R risk invariance. If your daily loss limit (e.g. -3R) has been hit, close your terminal, conduct an evening post-trade review, and protect your emotional capital.'
      },
      {
        id: 'c2',
        text: 'Refuse to take the trade out of fear of experiencing another loss, even though it strictly meets your playbook rules.',
        isProfessional: false,
        bias: 'Loss Aversion & Outcome Bias (Recent Loss Trauma)',
        consequence: 'You skip a high-expectancy trade. If the trade wins without you, regret and frustration spike, often triggering an emotional FOMO chase later.',
        riskImplication: 'Damages strategy expectancy. Profitable systems rely on executing the full distribution of trades; skipping valid setups removes the winning outliers required to offset losses.',
        alternative: 'Trust the law of large numbers. Take the trade at standard risk with zero hesitation, or lower size to 0.5R if psychological capital needs gentle rehabilitation.'
      },
      {
        id: 'c3',
        text: 'Check if you have reached your predefined Daily Max Loss limit. If not, execute at standard 1R risk; if reached, close the platform for the day.',
        isProfessional: true,
        bias: 'Process Adherence & Systematic Risk Discipline (No Bias)',
        consequence: 'Removes emotion from execution. You respect predetermined statistical boundaries rather than reacting to short-term variance.',
        riskImplication: 'Zero risk of emotional ruin. Daily stop-loss rules preserve capital and prevent runaway tilt episodes.',
        alternative: 'This is the institutional gold standard. Trading is an execution game of probabilities, not an ego defense game.'
      },
      {
        id: 'c4',
        text: 'Immediately change your indicator settings and stop-loss parameters because "the market has broken my strategy".',
        isProfessional: false,
        bias: 'Sample Size Neglect & Hyperactive Over-Optimization',
        consequence: 'You introduce chaotic, untested rule changes during live trading, degrading your edge and guaranteeing inconsistent future results.',
        riskImplication: 'Strategy death spiral. Constant tinkering prevents any strategy from ever achieving statistical convergence.',
        alternative: 'Never alter trading rules during live market hours. System adjustments belong strictly in weekend backtesting and statistical reviews across 100+ trades.'
      }
    ]
  },
  {
    id: 'missed_move',
    title: 'Scenario 2: You missed a large move.',
    situation: 'You waited for a pullback to enter a high-conviction breakout stock. The stock never pulled back and unexpectedly exploded +12% without you in 20 minutes.',
    context: 'Opportunity loss: $0 actual dollar loss, but strong psychological feelings of being "left behind".',
    choices: [
      {
        id: 'm1',
        text: 'Market Buy immediately at the highs with full size so you don’t miss out on further upside.',
        isProfessional: false,
        bias: 'FOMO (Fear Of Missing Out) & Chasing Parabolic Momentum',
        consequence: 'You enter at the exact zone where early buyers and institutional algorithms take profit, resulting in immediate adverse excursion.',
        riskImplication: 'Terrible Reward-to-Risk ratio (R:R). Your stop loss is now miles away from technical invalidation, forcing either massive risk or an arbitrary tight stop.',
        alternative: 'Accept that missed trades cost $0.00. Write down: "There will always be another setup tomorrow." Wait for a fresh multi-hour consolidation base or look elsewhere.'
      },
      {
        id: 'm2',
        text: 'Aggressively open a short position because "it went up too fast and has to crash back down".',
        isProfessional: false,
        bias: 'Anchor Bias & Counter-Trend Fallacy (Fighting the Trend)',
        consequence: 'Strong trend days can stay irrational and expand far longer than your solvency permits. Shorting runaway momentum leads to massive blowouts.',
        riskImplication: 'Unlimited upside risk when shorting strong momentum without structural reversal confirmation.',
        alternative: 'Never short purely because price is "too high". Institutional buying trends require confirmed structural lower highs and break of support before shorting.'
      },
      {
        id: 'm3',
        text: 'Acknowledge the strong move, log the observation in your journal, and wait patiently for a valid consolidation or fresh setup.',
        isProfessional: true,
        bias: 'Abundance Mindset & Professional Emotional Equanimity',
        consequence: 'You protect capital and keep your mental clarity intact, ready to capitalize on the next genuine playbook setup.',
        riskImplication: 'Zero unforced capital decay.',
        alternative: 'Institutional hedge funds treat missed moves as normal daily friction. You do not need to catch every wave to compound wealth.'
      },
      {
        id: 'm4',
        text: 'Jump into a random volatile cryptocurrency or meme stock to "make up" for the profits you should have made.',
        isProfessional: false,
        bias: 'Displaced Frustration & Action Addiction (Overtrading)',
        consequence: 'Trading outside your circle of competence with elevated emotional agitation almost always produces immediate losses.',
        riskImplication: 'Complete breakdown of trading plan integrity.',
        alternative: 'Step away from the screen for 15 minutes. Drink water, take a walk, and reset your baseline dopamine levels.'
      }
    ]
  },
  {
    id: 'winning_streak',
    title: 'Scenario 3: You increased risk after a winning streak.',
    situation: 'You just closed 6 consecutive winning trades (+12R total profit over two weeks). You feel unbeatable and feel your read on the market is 100% accurate.',
    context: 'Capital state: Account peak equity | Emotional state: Euphoria, illusion of control, invincible mindset.',
    choices: [
      {
        id: 'w1',
        text: 'Triple your risk per trade from 1% to 3% or 5% to "press your advantage" while hot.',
        isProfessional: false,
        bias: 'Hot Hand Fallacy & Illusion of Control',
        consequence: 'A single 3-trade losing streak at 3% or 5% risk will wipe out the entire profit gained over 6 winning trades at 1% risk.',
        riskImplication: 'Asymmetric capital destruction. Asymmetric risk sizing destroys the compounding benefits of your edge.',
        alternative: 'Maintain strict risk invariance (1%). Only scale dollar risk proportionally as your total account balance grows naturally, not on arbitrary hot streaks.'
      },
      {
        id: 'w2',
        text: 'Start taking lower-quality, discretionary setups because "even your marginal trades are working".',
        isProfessional: false,
        bias: 'Overconfidence Effect & Rule Drift (Sloppiness)',
        consequence: 'Market regime will inevitably shift, and your newly acquired loose habits will produce catastrophic losses.',
        riskImplication: 'Degrades core statistical edge.',
        alternative: 'Winning streaks require heightened discipline. Re-read your written A-tier criteria and enforce even stricter quality filtering.'
      },
      {
        id: 'w3',
        text: 'Keep execution sizing and setup criteria strictly constant, recognizing that short-term win clusters are normal stochastic variance.',
        isProfessional: true,
        bias: 'Probabilistic Thinking & Long-Term Objectivity',
        consequence: 'You build durable, scalable compounding habits that survive all market regimes.',
        riskImplication: 'Flawless preservation of mathematical expected value.',
        alternative: 'Institutional risk managers audit traders who celebrate winning streaks, enforcing sizing caps to prevent euphoria-driven risk spikes.'
      }
    ]
  }
];

export const PsychologyLab: React.FC = () => {
  const [activeScenarioIndex, setActiveScenarioIndex] = useState<number>(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);

  const scenario = SCENARIOS[activeScenarioIndex];
  const selectedChoice = scenario.choices.find(c => c.id === selectedChoiceId);

  const handleSelectScenario = (index: number) => {
    setActiveScenarioIndex(index);
    setSelectedChoiceId(null);
  };

  return (
    <div className="space-y-8">
      {/* Simulation Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3">
        <Brain className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
        <div className="text-xs text-rose-950 dark:text-rose-200 leading-relaxed">
          <strong className="font-bold uppercase tracking-wider">Behavioral Trading Psychology Lab:</strong> This interactive suite teaches institutional decision-making, cognitive bias awareness, and emotional risk discipline. It is strictly educational and does not provide medical or psychological diagnosis.
        </div>
      </div>

      {/* Scenario Selector Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        {SCENARIOS.map((scen, idx) => (
          <button
            key={scen.id}
            onClick={() => handleSelectScenario(idx)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap border ${
              activeScenarioIndex === idx
                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            {scen.title}
          </button>
        ))}
      </div>

      {/* Active Scenario Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
              Active Dilemma
            </span>
            <span className="text-xs text-slate-400">{scenario.context}</span>
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
            {scenario.title}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {scenario.situation}
          </p>
        </div>

        {/* Choice Selection Grid */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            How do you respond? Select your action:
          </span>

          <div className="grid grid-cols-1 gap-3">
            {scenario.choices.map((choice, i) => {
              const isSelected = selectedChoiceId === choice.id;
              return (
                <button
                  key={choice.id}
                  onClick={() => setSelectedChoiceId(choice.id)}
                  className={`p-4 rounded-2xl text-left border transition-all flex items-start gap-3.5 ${
                    isSelected
                      ? choice.isProfessional
                        ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20'
                        : 'border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 ring-2 ring-amber-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-slate-50/50 dark:bg-slate-900/50'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                    isSelected
                      ? choice.isProfessional ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </div>
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                    {choice.text}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Institutional Feedback Analysis Box */}
        {selectedChoice && (
          <div className={`p-6 rounded-2xl border space-y-4 transition-all ${
            selectedChoice.isProfessional
              ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50'
              : 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedChoice.isProfessional ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                )}
                <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">
                  {selectedChoice.isProfessional ? 'Institutional Response: Correct Mindset' : 'Cognitive Bias Detected: Unprofessional Reaction'}
                </h4>
              </div>
              <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md border ${
                selectedChoice.isProfessional
                  ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
                  : 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-800'
              }`}>
                {selectedChoice.bias}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Immediate Consequence:</span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">{selectedChoice.consequence}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <span className="text-[10px] font-bold uppercase text-rose-500 block">Risk Implication:</span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">{selectedChoice.riskImplication}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <span className="text-[10px] font-bold uppercase text-blue-500 block">Professional Alternative:</span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">{selectedChoice.alternative}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
