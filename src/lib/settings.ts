export interface UserSettings {
  profile: {
    name: string;
    email: string;
    experience: string;
    style: string;
    markets: string;
    timezone: string;
    dateFormat: string;
    currency: string;
  };
  accounts: TradingAccount[];
  activeAccountId: string;
  risk: {
    defaultRisk: number;
    maxDailyRisk: number;
    maxWeeklyRisk: number;
    maxTradesPerDay: number;
  };
  psychology: {
    enabled: boolean;
    preTrade: boolean;
    postTrade: boolean;
    ruleAdherence: boolean;
    fomoDetection: boolean;
    revengeDetection: boolean;
    overtradingDetection: boolean;
    riskEscalationDetection: boolean;
    alerts: boolean;
    alertSensitivity: 'Low' | 'Medium' | 'High';
  };
  entryPreferences: {
    market: string;
    direction: string;
    session: string;
    timeframe: string;
    risk: string;
    strategy: string;
  };
  analytics: {
    metrics: string[];
    defaultPeriod: string;
    defaultChart: string;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    accent: string;
    density: 'comfortable' | 'compact';
  };
  dashboard: {
    widgets: string[];
  };
  notifications: {
    riskLimit: boolean;
    dailyLoss: boolean;
    consecutiveLoss: boolean;
    overtrading: boolean;
    psychologyPattern: boolean;
    ruleAdherence: boolean;
    dailyReminder: boolean;
    weeklyReview: boolean;
    incompleteTrade: boolean;
  };
  schedule: Record<string, { enabled: boolean; start: string; end: string }>;
  strategyDefaults: {
    strategy: string;
    checklist: string;
    session: string;
    markets: string;
    timeframes: string;
    risk: string;
  };
  labs: {
    advancedPsychology: boolean;
    behavioralAlerts: boolean;
    smartRiskWarnings: boolean;
    aiTradeReview: boolean;
  };
}

export interface TradingAccount {
  id: string;
  name: string;
  startingBalance: number;
  currentBalance: number;
  currency: string;
  broker: string;
  type: 'Live' | 'Demo' | 'Funded' | 'Backtesting';
  leverage: string;
  defaultRisk: number;
  maxDailyRisk: number;
  maxTradesPerDay: number;
}

const DEFAULT_SETTINGS: UserSettings = {
  profile: {
    name: 'Trader',
    email: 'trader@example.com',
    experience: 'Intermediate',
    style: 'Intraday',
    markets: 'Forex, Crypto',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: 'YYYY-MM-DD',
    currency: 'USD',
  },
  accounts: [
    {
      id: 'default',
      name: 'Personal Account',
      startingBalance: 10000,
      currentBalance: 10000,
      currency: 'USD',
      broker: 'Generic',
      type: 'Live',
      leverage: '1:100',
      defaultRisk: 1,
      maxDailyRisk: 2,
      maxTradesPerDay: 5,
    }
  ],
  activeAccountId: 'default',
  risk: {
    defaultRisk: 1,
    maxDailyRisk: 2,
    maxWeeklyRisk: 5,
    maxTradesPerDay: 5,
  },
  psychology: {
    enabled: true,
    preTrade: true,
    postTrade: true,
    ruleAdherence: true,
    fomoDetection: true,
    revengeDetection: true,
    overtradingDetection: true,
    riskEscalationDetection: true,
    alerts: true,
    alertSensitivity: 'Medium',
  },
  entryPreferences: {
    market: '',
    direction: 'BUY',
    session: '',
    timeframe: '',
    risk: '1',
    strategy: '',
  },
  analytics: {
    metrics: ['Net P&L', 'Win Rate', 'Profit Factor', 'Expectancy', 'Average R', 'Maximum Drawdown', 'Average Win', 'Average Loss', 'Risk/Reward', 'Total Trades'],
    defaultPeriod: '30 Days',
    defaultChart: 'Equity Curve',
  },
  appearance: {
    theme: 'system',
    accent: 'blue',
    density: 'comfortable',
  },
  dashboard: {
    widgets: ['Total P&L', 'Win Rate', 'Total Trades', 'Profit Factor', 'Expectancy', 'Average R', 'Maximum Drawdown', 'Equity Curve', 'Recent Trades', 'High Impact News', 'Trading Calendar', 'Psychology Score', 'Risk Overview'],
  },
  notifications: {
    riskLimit: true,
    dailyLoss: true,
    consecutiveLoss: true,
    overtrading: true,
    psychologyPattern: true,
    ruleAdherence: true,
    dailyReminder: false,
    weeklyReview: false,
    incompleteTrade: true,
  },
  schedule: {
    Monday: { enabled: true, start: '09:00', end: '17:00' },
    Tuesday: { enabled: true, start: '09:00', end: '17:00' },
    Wednesday: { enabled: true, start: '09:00', end: '17:00' },
    Thursday: { enabled: true, start: '09:00', end: '17:00' },
    Friday: { enabled: true, start: '09:00', end: '15:00' },
    Saturday: { enabled: false, start: '09:00', end: '17:00' },
    Sunday: { enabled: false, start: '09:00', end: '17:00' },
  },
  strategyDefaults: {
    strategy: '',
    checklist: '',
    session: '',
    markets: '',
    timeframes: '',
    risk: '',
  },
  labs: {
    advancedPsychology: false,
    behavioralAlerts: true,
    smartRiskWarnings: true,
    aiTradeReview: false,
  },
};

export function getSettings(): UserSettings {
  const saved = localStorage.getItem('tradevault_settings');
  if (saved) {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {
      console.error('Failed to parse settings', e);
    }
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: UserSettings) {
  localStorage.setItem('tradevault_settings', JSON.stringify(settings));
  // Dispatch event asynchronously so listeners do not update state synchronously during any active component render phase
  queueMicrotask(() => {
    window.dispatchEvent(new Event('tradevault_settings_updated'));
  });
}

export function getActiveAccount(settings = getSettings()) {
  return settings.accounts.find(a => a.id === settings.activeAccountId) || settings.accounts[0];
}
