/**
 * TradeVault MT5 Broker & Server Directory
 * Broker-agnostic directory of MetaTrader 5 brokers and standard servers,
 * supporting broker detection, search, and manual custom server entry.
 */

export interface MT5BrokerEntry {
  id: string;
  name: string;
  company: string;
  website: string;
  category: 'prop' | 'broker';
  supportedCurrencies: string[];
  supportedLeverages: number[];
  instantDemoAvailable: boolean;
  liveAccountUrl: string;
  servers: {
    name: string;
    type: 'live' | 'demo';
    description?: string;
  }[];
}

export const MT5_POPULAR_BROKERS: MT5BrokerEntry[] = [
  {
    id: 'sharkfunded',
    name: 'Shark Funded',
    company: 'Shark Funded Global Capital FZCO',
    website: 'https://sharkfunded.com',
    category: 'prop',
    supportedCurrencies: ['USD', 'EUR', 'GBP'],
    supportedLeverages: [30, 50, 100],
    instantDemoAvailable: true,
    liveAccountUrl: 'https://sharkfunded.com/challenges',
    servers: [
      { name: 'SharkFunded-Live', type: 'live', description: 'Funded & Evaluation MT5 Live' },
      { name: 'SharkFunded-Live 2', type: 'live', description: 'Funded Trader Live 2' },
      { name: 'SharkFunded-Demo', type: 'demo', description: 'Practice / Free Trial Demo' }
    ]
  },
  {
    id: 'icmarkets',
    name: 'IC Markets',
    company: 'International Capital Markets Pty Ltd',
    website: 'https://www.icmarkets.com',
    category: 'broker',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'AUD'],
    supportedLeverages: [30, 100, 200, 500],
    instantDemoAvailable: true,
    liveAccountUrl: 'https://www.icmarkets.com/open-trading-account',
    servers: [
      { name: 'ICMarketsSC-Live01', type: 'live', description: 'Raw Spread / Standard Live' },
      { name: 'ICMarketsSC-Live02', type: 'live', description: 'Live Server 02' },
      { name: 'ICMarketsSC-Live03', type: 'live', description: 'Live Server 03' },
      { name: 'ICMarketsSC-Demo', type: 'demo', description: 'Demo Server' },
      { name: 'ICMarkets-Demo', type: 'demo', description: 'Global Demo' }
    ]
  },
  {
    id: 'ftmo',
    name: 'FTMO',
    company: 'FTMO Evaluation Global s.r.o.',
    website: 'https://ftmo.com',
    category: 'prop',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CZK'],
    supportedLeverages: [30, 100],
    instantDemoAvailable: true,
    liveAccountUrl: 'https://ftmo.com/en/#get-evaluation',
    servers: [
      { name: 'FTMO-Server', type: 'live', description: 'Funded & Verification Server' },
      { name: 'FTMO-Server2', type: 'live', description: 'FTMO Live 2' },
      { name: 'FTMO-Demo', type: 'demo', description: 'FTMO Challenge / Free Trial Demo' }
    ]
  },
  {
    id: 'exness',
    name: 'Exness',
    company: 'Exness Global Limited',
    website: 'https://www.exness.com',
    category: 'broker',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'JPY'],
    supportedLeverages: [100, 200, 500, 1000],
    instantDemoAvailable: true,
    liveAccountUrl: 'https://www.exness.com/register',
    servers: [
      { name: 'Exness-MT5Real', type: 'live', description: 'Standard / Pro Real' },
      { name: 'Exness-MT5Real2', type: 'live', description: 'Real Server 2' },
      { name: 'Exness-MT5Real3', type: 'live', description: 'Real Server 3' },
      { name: 'Exness-MT5Trial', type: 'demo', description: 'Demo / Trial Server' }
    ]
  },
  {
    id: 'pepperstone',
    name: 'Pepperstone',
    company: 'Pepperstone Group Limited',
    website: 'https://pepperstone.com',
    category: 'broker',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'AUD'],
    supportedLeverages: [30, 100, 200, 400],
    instantDemoAvailable: true,
    liveAccountUrl: 'https://pepperstone.com/open-trading-account',
    servers: [
      { name: 'Pepperstone-Live01', type: 'live', description: 'Razor / Standard Live' },
      { name: 'Pepperstone-Live02', type: 'live', description: 'Live Server 02' },
      { name: 'Pepperstone-Demo', type: 'demo', description: 'Demo Server' }
    ]
  },
  {
    id: 'fundingpips',
    name: 'Funding Pips',
    company: 'Funding Pips FZCO',
    website: 'https://fundingpips.com',
    category: 'prop',
    supportedCurrencies: ['USD', 'EUR', 'GBP'],
    supportedLeverages: [50, 100],
    instantDemoAvailable: true,
    liveAccountUrl: 'https://fundingpips.com',
    servers: [
      { name: 'FundingPips-Server', type: 'live', description: 'Funded & Evaluation MT5' },
      { name: 'FundingPips-Demo', type: 'demo', description: 'Practice Demo' }
    ]
  },
  {
    id: 'eightcap',
    name: 'Eightcap',
    company: 'Eightcap Pty Ltd',
    website: 'https://www.eightcap.com',
    category: 'broker',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'AUD'],
    supportedLeverages: [30, 100, 500],
    instantDemoAvailable: true,
    liveAccountUrl: 'https://www.eightcap.com',
    servers: [
      { name: 'Eightcap-Real', type: 'live', description: 'Standard / Raw Real' },
      { name: 'Eightcap-Real2', type: 'live', description: 'Real Server 2' },
      { name: 'Eightcap-Demo', type: 'demo', description: 'Demo Server' }
    ]
  },
  {
    id: 'vantage',
    name: 'Vantage Markets',
    company: 'Vantage International Group',
    website: 'https://www.vantagemarkets.com',
    category: 'broker',
    supportedCurrencies: ['USD', 'EUR', 'GBP'],
    supportedLeverages: [100, 500],
    instantDemoAvailable: true,
    liveAccountUrl: 'https://www.vantagemarkets.com',
    servers: [
      { name: 'VantageInternational-Live', type: 'live', description: 'Live Trading Server' },
      { name: 'VantageInternational-Live 2', type: 'live', description: 'Live Server 2' },
      { name: 'VantageInternational-Demo', type: 'demo', description: 'Practice Demo' }
    ]
  },
  {
    id: 'xm',
    name: 'XM Group',
    company: 'XM Global Limited',
    website: 'https://www.xm.com',
    category: 'broker',
    supportedCurrencies: ['USD', 'EUR', 'GBP'],
    supportedLeverages: [100, 200, 500],
    instantDemoAvailable: true,
    liveAccountUrl: 'https://www.xm.com',
    servers: [
      { name: 'XMGlobal-MT5', type: 'live', description: 'Live Server' },
      { name: 'XMGlobal-MT5 2', type: 'live', description: 'Live Server 2' },
      { name: 'XMGlobal-Demo', type: 'demo', description: 'Demo Server' }
    ]
  },
  {
    id: 'deriv',
    name: 'Deriv',
    company: 'Deriv Investments Limited',
    website: 'https://deriv.com',
    category: 'broker',
    supportedCurrencies: ['USD', 'EUR'],
    supportedLeverages: [100, 500, 1000],
    instantDemoAvailable: true,
    liveAccountUrl: 'https://deriv.com',
    servers: [
      { name: 'Deriv-Server', type: 'live', description: 'Synthetics & Financials Live' },
      { name: 'Deriv-Server-02', type: 'live', description: 'Live Server 02' },
      { name: 'Deriv-Demo', type: 'demo', description: 'Demo Server' }
    ]
  },
  {
    id: 'blackbull',
    name: 'BlackBull Markets',
    company: 'BlackBull Financial Limited',
    website: 'https://blackbull.com',
    category: 'broker',
    supportedCurrencies: ['USD', 'EUR', 'GBP'],
    supportedLeverages: [100, 500],
    instantDemoAvailable: true,
    liveAccountUrl: 'https://blackbull.com',
    servers: [
      { name: 'BlackBullMarkets-Live', type: 'live', description: 'Prime / Standard Live' },
      { name: 'BlackBullMarkets-Demo', type: 'demo', description: 'Demo Server' }
    ]
  }
];

/**
 * Intelligently detect broker name, company, and connection type (live vs demo)
 * directly from any MT5 broker server name string.
 * Supports known catalog as well as arbitrary custom broker servers.
 */
export function detectBrokerFromServer(server: string): { 
  broker: string; 
  company?: string; 
  connectionType: 'live' | 'demo';
  accountTypeLabel: string;
} {
  if (!server || !server.trim()) {
    return {
      broker: 'MetaTrader 5 Broker',
      connectionType: 'live',
      accountTypeLabel: 'Live Trading Account'
    };
  }

  const s = server.trim();
  const lower = s.toLowerCase();

  // Determine demo vs live from server name tokens
  const isDemo = lower.includes('demo') || lower.includes('trial') || lower.includes('practice') || lower.includes('test');
  const connectionType: 'live' | 'demo' = isDemo ? 'demo' : 'live';

  // Check against known brokers
  for (const broker of MT5_POPULAR_BROKERS) {
    if (lower.startsWith(broker.id) || lower.includes(broker.name.toLowerCase().replace(/\s+/g, ''))) {
      return {
        broker: broker.name,
        company: broker.company,
        connectionType,
        accountTypeLabel: isDemo ? 'Demo Account' : (broker.category === 'prop' ? 'Funded / Evaluation Account' : 'Live Trading Account')
      };
    }
    for (const srv of broker.servers) {
      if (srv.name.toLowerCase() === lower || lower.includes(srv.name.toLowerCase())) {
        return {
          broker: broker.name,
          company: broker.company,
          connectionType: srv.type,
          accountTypeLabel: srv.type === 'demo' ? 'Demo Account' : (broker.category === 'prop' ? 'Funded Account' : 'Live Trading Account')
        };
      }
    }
  }

  // Fallback for custom or unlisted broker servers:
  // Extract name before '-' or '_' or digit
  // e.g. "AlphaCapital-Live01" -> "Alpha Capital"
  const prefix = s.split(/[-_0-9]/)[0].trim();
  let cleanedBroker = prefix;
  if (prefix) {
    // Insert spaces between CamelCase words
    cleanedBroker = prefix.replace(/([a-z])([A-Z])/g, '$1 $2').trim();
  }

  return {
    broker: cleanedBroker || 'MT5 Broker',
    connectionType,
    accountTypeLabel: isDemo ? 'Demo Account' : 'Live Trading Account'
  };
}

/**
 * Search the directory of MT5 brokers and servers
 */
export function searchMT5Brokers(query: string): MT5BrokerEntry[] {
  if (!query || !query.trim()) {
    return MT5_POPULAR_BROKERS;
  }
  const q = query.toLowerCase().trim();
  return MT5_POPULAR_BROKERS.filter(b => 
    b.name.toLowerCase().includes(q) ||
    b.company.toLowerCase().includes(q) ||
    b.servers.some(s => s.name.toLowerCase().includes(q))
  );
}
