import React, { useState } from 'react';
import { Calculator, CheckCircle2, AlertTriangle, RotateCcw, ArrowRight, Lightbulb } from 'lucide-react';

interface CalculationProblem {
  id: string;
  title: string;
  category: 'Risk Amount' | 'R:R' | 'Position Size' | 'Profit/Loss' | 'Percentage Change';
  scenario: string;
  question: string;
  options: { label: string; value: string; isCorrect: boolean }[];
  explanation: string;
  formula: string;
}

const BEGINNER_CALCULATION_PROBLEMS: CalculationProblem[] = [
  {
    id: 'calc-risk-1',
    title: '1% Planned Risk Amount',
    category: 'Risk Amount',
    scenario: 'Account Balance = ₹1,00,000. Your trading plan limits risk to 1% of equity per trade.',
    question: 'What is the maximum planned loss you can risk on this trade?',
    options: [
      { label: '₹10,000', value: '10000', isCorrect: false },
      { label: '₹1,000', value: '1000', isCorrect: true },
      { label: '₹500', value: '500', isCorrect: false },
      { label: '₹2,500', value: '2500', isCorrect: false },
    ],
    explanation: 'Risk Amount = Account Equity × (Risk % ÷ 100) = ₹1,00,000 × 0.01 = ₹1,000.',
    formula: 'Risk Amount = Equity × (Risk % / 100)'
  },
  {
    id: 'calc-rr-1',
    title: 'Risk-to-Reward Ratio',
    category: 'R:R',
    scenario: 'You buy a stock at $100. Stop-loss is set at $98 (risk = $2/share). Target is $106 (gain = $6/share).',
    question: 'What is the planned Risk-to-Reward (R:R) ratio of this trade setup?',
    options: [
      { label: '1 : 1', value: '1:1', isCorrect: false },
      { label: '1 : 2', value: '1:2', isCorrect: false },
      { label: '1 : 3', value: '1:3', isCorrect: true },
      { label: '1 : 4', value: '1:4', isCorrect: false },
    ],
    explanation: 'Risk = $100 - $98 = $2. Reward = $106 - $100 = $6. Ratio = $2 : $6 = 1 : 3.',
    formula: 'R:R = Risk per share : Reward per share'
  },
  {
    id: 'calc-pos-size-1',
    title: 'Basic Position Sizing',
    category: 'Position Size',
    scenario: 'Account Dollar Risk budget = $500. Entry price is $50. Stop-loss is at $45 (stop distance = $5).',
    question: 'How many shares should you buy so you do not exceed your $500 risk budget if stopped out?',
    options: [
      { label: '50 shares', value: '50', isCorrect: false },
      { label: '100 shares', value: '100', isCorrect: true },
      { label: '250 shares', value: '250', isCorrect: false },
      { label: '500 shares', value: '500', isCorrect: false },
    ],
    explanation: 'Position Size = Dollar Risk ÷ Stop Distance = $500 ÷ ($50 - $45) = $500 ÷ $5 = 100 shares.',
    formula: 'Position Size = Risk Budget / |Entry - Stop|'
  },
  {
    id: 'calc-pnl-1',
    title: 'Profit / Loss Calculation',
    category: 'Profit/Loss',
    scenario: 'You purchased 200 shares at ₹250 each. You sell all 200 shares at ₹275 each.',
    question: 'What is the gross profit on this trade?',
    options: [
      { label: '₹2,500', value: '2500', isCorrect: false },
      { label: '₹5,000', value: '5000', isCorrect: true },
      { label: '₹7,500', value: '7500', isCorrect: false },
      { label: '₹50,000', value: '50000', isCorrect: false },
    ],
    explanation: 'Profit = Shares × (Exit Price - Entry Price) = 200 × (₹275 - ₹250) = 200 × ₹25 = ₹5,000.',
    formula: 'P&L = Quantity × (Exit Price - Entry Price)'
  },
  {
    id: 'calc-pct-change-1',
    title: 'Percentage Change',
    category: 'Percentage Change',
    scenario: 'A stock drops from $80 down to $60.',
    question: 'What is the percentage change of the stock price?',
    options: [
      { label: '-20%', value: '-20', isCorrect: false },
      { label: '-25%', value: '-25', isCorrect: true },
      { label: '-33%', value: '-33', isCorrect: false },
      { label: '-15%', value: '-15', isCorrect: false },
    ],
    explanation: 'Percentage Change = ((New Price - Old Price) ÷ Old Price) × 100 = (($60 - $80) ÷ $80) × 100 = (-20 ÷ 80) × 100 = -25%.',
    formula: '% Change = ((New Price - Old Price) / Old Price) × 100'
  }
];

export const NormalCalculationPractice: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [checkedProblems, setCheckedProblems] = useState<Record<string, boolean>>({});

  const categories = ['All', 'Risk Amount', 'R:R', 'Position Size', 'Profit/Loss', 'Percentage Change'];

  const filtered = selectedCategory === 'All'
    ? BEGINNER_CALCULATION_PROBLEMS
    : BEGINNER_CALCULATION_PROBLEMS.filter(p => p.category === selectedCategory);

  const handleSelectOption = (problemId: string, optionIdx: number) => {
    setUserAnswers(prev => ({ ...prev, [problemId]: optionIdx }));
    setCheckedProblems(prev => ({ ...prev, [problemId]: true }));
  };

  const handleReset = (problemId: string) => {
    setUserAnswers(prev => {
      const next = { ...prev };
      delete next[problemId];
      return next;
    });
    setCheckedProblems(prev => {
      const next = { ...prev };
      delete next[problemId];
      return next;
    });
  };

  return (
    <div id="normal-calculation-practice" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Calculator className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Beginner Calculation Practice
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Master the core math of risk management, position sizing, and profit calculation.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Problems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((problem, pIdx) => {
          const isChecked = checkedProblems[problem.id];
          const selectedIdx = userAnswers[problem.id];
          const isCorrect = selectedIdx !== undefined && problem.options[selectedIdx]?.isCorrect;

          return (
            <div
              key={problem.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                    {problem.category}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {problem.formula}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {problem.title}
                </h4>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {problem.scenario}
                </div>

                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {problem.question}
                </p>

                {/* Options */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {problem.options.map((opt, optIdx) => {
                    const isSelected = selectedIdx === optIdx;
                    let optStyle = 'border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-200 hover:bg-slate-100';

                    if (isChecked) {
                      if (opt.isCorrect) {
                        optStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-bold';
                      } else if (isSelected && !opt.isCorrect) {
                        optStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 font-bold';
                      } else {
                        optStyle = 'border-slate-200 dark:border-slate-800 opacity-50';
                      }
                    } else if (isSelected) {
                      optStyle = 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-900 font-bold';
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={isChecked}
                        onClick={() => handleSelectOption(problem.id, optIdx)}
                        className={`p-2.5 rounded-xl border text-xs text-center transition-all ${optStyle}`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Feedback and Explanation */}
              {isChecked && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      {isCorrect ? (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          ✅ Correct!
                        </span>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          ❌ Incorrect
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleReset(problem.id)}
                      className="text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Try again</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl">
                    <strong>Step-by-step: </strong>
                    {problem.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
