import React, { useState } from 'react';
import { BookA, Search, Tag, ArrowRight } from 'lucide-react';

interface NormalGlossaryTerm {
  term: string;
  simpleDefinition: string;
  example: string;
  relatedConcept: string;
  category: string;
}

const NORMAL_GLOSSARY_TERMS: NormalGlossaryTerm[] = [
  {
    term: 'Liquidity',
    simpleDefinition: 'How easily and quickly an asset can be bought or sold without significantly changing its market price.',
    example: 'Large-cap stocks like Apple have high liquidity (orders fill instantly), whereas penny stocks often have low liquidity (hard to exit without moving the price).',
    relatedConcept: 'Bid-Ask Spread & Slippage',
    category: 'Market Basics'
  },
  {
    term: 'Bid-Ask Spread',
    simpleDefinition: 'The price gap between the highest price a buyer is willing to pay (Bid) and the lowest price a seller is willing to accept (Ask).',
    example: 'If EUR/USD bid is 1.0850 and ask is 1.0852, the spread is 2 pips (0.0002).',
    relatedConcept: 'Execution Costs',
    category: 'Market Basics'
  },
  {
    term: 'Stop Loss',
    simpleDefinition: 'A predefined exit order that automatically sells your position if the price moves against you to limit your loss to an acceptable amount.',
    example: 'You buy at $100 and set a stop loss at $95. If the stock falls to $95, your trade closes, capping your loss at $5 per share.',
    relatedConcept: 'Risk Management',
    category: 'Risk Management'
  },
  {
    term: 'Leverage',
    simpleDefinition: 'Using borrowed capital from your broker to control a larger trade position than your cash balance would normally allow.',
    example: 'With 10:1 leverage, $1,000 in your account allows you to control a $10,000 position. Both profits and losses are multiplied 10x.',
    relatedConcept: 'Margin & Liquidation',
    category: 'Trading Basics'
  },
  {
    term: 'Margin Call',
    simpleDefinition: 'A demand from your broker to deposit more funds or close positions because your account equity has dropped below the required minimum.',
    example: 'If your leveraged trades lose enough value, your broker automatically closes your positions to prevent a negative account balance.',
    relatedConcept: 'Leverage',
    category: 'Risk Management'
  },
  {
    term: 'Support and Resistance',
    simpleDefinition: 'Support is a price floor where buyers typically step in; Resistance is a price ceiling where sellers typically push price back down.',
    example: 'If a stock bounces higher every time it touches $50, $50 acts as strong price support.',
    relatedConcept: 'Technical Analysis',
    category: 'Technical Analysis'
  },
  {
    term: 'Slippage',
    simpleDefinition: 'The difference between the expected price of a trade and the actual execution price when the order reaches the exchange.',
    example: 'During a high-impact news release, you click buy at $100.00 but your market order fills at $100.35 due to fast price movement.',
    relatedConcept: 'Order Execution',
    category: 'Execution'
  },
  {
    term: 'Position Sizing',
    simpleDefinition: 'The mathematical determination of how many shares or contracts to purchase based on your risk tolerance and stop loss distance.',
    example: 'Instead of always buying 100 shares, you calculate share count so that your maximum risk is always capped at 1% of your account.',
    relatedConcept: 'Capital Preservation',
    category: 'Risk Management'
  },
  {
    term: 'Volatility',
    simpleDefinition: 'A statistical measure of how rapidly and dramatically an asset’s price moves up and down over a given time period.',
    example: 'Cryptocurrencies generally exhibit high volatility (large swings), while short-term government bonds exhibit low volatility.',
    relatedConcept: 'Risk & True Range',
    category: 'Market Basics'
  },
  {
    term: 'Drawdown',
    simpleDefinition: 'The percentage decline from your trading account’s highest peak balance down to its lowest subsequent trough before reaching a new high.',
    example: 'If your account reaches $10,000 and drops to $8,000, you have experienced a 20% drawdown.',
    relatedConcept: 'Account Recovery',
    category: 'Performance'
  },
  {
    term: 'FOMO (Fear Of Missing Out)',
    simpleDefinition: 'The emotional impulse to impulsively enter a trade after price has already made a large move, fearing you will miss easy profits.',
    example: 'Chasing a stock that already surged 30% in one morning without a technical entry setup or stop loss.',
    relatedConcept: 'Trading Psychology',
    category: 'Psychology'
  },
  {
    term: 'Revenge Trading',
    simpleDefinition: 'Immediately entering an unplanned, emotional trade right after a painful loss in an attempt to quickly recover the lost money.',
    example: 'Doubling position size right after getting stopped out, which almost always results in deeper capital destruction.',
    relatedConcept: 'Emotional Discipline',
    category: 'Psychology'
  }
];

interface NormalGlossaryProps {
  onSelectConcept?: (conceptName: string) => void;
}

export const NormalGlossary: React.FC<NormalGlossaryProps> = ({ onSelectConcept }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Market Basics', 'Trading Basics', 'Risk Management', 'Technical Analysis', 'Execution', 'Psychology', 'Performance'];

  const filteredTerms = NORMAL_GLOSSARY_TERMS.filter(item => {
    const matchesSearch = item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.simpleDefinition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.relatedConcept.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div id="normal-glossary" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <BookA className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Trading Glossary
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Plain-English definitions and concrete real-world examples for every essential market term.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search terms or definitions..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-1.5">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === cat
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Glossary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTerms.map((item) => (
          <div
            key={item.term}
            className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {item.term}
                </h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {item.category}
                </span>
              </div>

              {/* Simple Definition */}
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {item.simpleDefinition}
              </p>
            </div>

            {/* Example & Related Concept */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300">
                <strong className="text-slate-900 dark:text-white">Example: </strong>
                {item.example}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Related: <strong className="text-slate-700 dark:text-slate-300">{item.relatedConcept}</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
