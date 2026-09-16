import os

path = './src/types/newsIntelligence.ts'
with open(path, 'r') as f:
    code = f.read()

newTypes = """
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
"""

if 'MarketNewsArticle' not in code:
    with open(path, 'w') as f:
        f.write(code + newTypes)
    print("Types updated.")
else:
    print("Types already exist.")
