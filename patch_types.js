const fs = require('fs');
const path = './src/types/newsIntelligence.ts';
let code = fs.readFileSync(path, 'utf8');

const newTypes = `

export interface MarketNewsArticle {
  id: string;
  headline: string;
  summary: string;
  source: string;
  sourceUrl: string;
  publishedAt: string; // ISO format
  updatedAt?: string;
  imageUrl?: string;
  category: string;
  markets: string[];
  impact: NewsImpact;
  country?: string;
  personEntity?: string;
  event?: string;
  previous?: string | number;
  forecast?: string | number;
  actual?: string | number;
  relatedStories?: string[];

  // Educational / Trader Context
  whatHappened?: string;
  whyItMatters?: string;
  marketsToWatch?: string[];
  traderImpact?: {
    markets: { asset: string; sensitivity: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN' }[];
    explanation: string;
  };
  bullBearContext?: {
    bullish: string;
    bearish: string;
    neutral: string;
  };
}
`;

if (!code.includes('MarketNewsArticle')) {
  code += newTypes;
  fs.writeFileSync(path, code);
  console.log("Types updated.");
} else {
  console.log("Types already exist.");
}
