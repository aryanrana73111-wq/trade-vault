import { 
  Compass, 
  LayoutDashboard, 
  Swords, 
  Newspaper, 
  PlusCircle, 
  Calculator, 
  BookOpen, 
  BarChart2, 
  Target, 
  Brain, 
  GraduationCap, 
  Sparkles, 
  BookOpenCheck, 
  Settings,
  Calendar,
  Activity,
  Flame,
  PieChart,
  LineChart,
  Award,
  FileText,
  Sliders,
  CheckCircle2,
  Clock,
  Layers,
  ShieldCheck,
  ShieldAlert,
  Bot,
  Lightbulb,
  FlaskConical,
  GitCompare,
  Database,
  Bell,
  Bookmark,
  Zap,
  TrendingDown,
  TrendingUp,
  User,
  CreditCard,
  Palette,
  LogIn,
  HelpCircle,
  LucideIcon
} from 'lucide-react';

export interface NavChildItem {
  id: string;
  label: string;
  path: string;
  description?: string;
  badge?: string;
  icon?: LucideIcon;
  keywords?: string[];
  children?: NavChildItem[];
}

export interface NavSection {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  description?: string;
  badge?: string;
  keywords?: string[];
  children?: NavChildItem[];
}

export const NAVIGATION_CONFIG: NavSection[] = [
  {
    id: 'command-center',
    label: 'Command Center',
    path: '/command-center',
    icon: Compass,
    description: 'Executive trading state, attention alerts & workflows',
    keywords: ['command', 'center', 'attention', 'pulse', 'alerts', 'workflow', 'macro', 'timeline'],
    children: [
      { id: 'cc-overview', label: 'Executive Overview & KPIs', path: '/command-center', icon: Activity, keywords: ['kpi', 'metrics', 'summary'] },
      { id: 'cc-attention', label: 'Attention & Risk Items', path: '/command-center#attention', icon: ShieldAlert, keywords: ['attention', 'warning', 'risk', 'drawdown'] },
      { id: 'cc-state', label: 'Current Trading State', path: '/command-center#trading-state', icon: Compass, keywords: ['state', 'rules', 'session', 'limits'] },
      { id: 'cc-macro', label: 'Macro & Market Intelligence', path: '/command-center#macro', icon: Newspaper, keywords: ['macro', 'events', 'catalyst'] },
      { id: 'cc-pinned', label: 'Pinned Watch Items', path: '/command-center#pinned', icon: Bookmark, keywords: ['pinned', 'watchlist'] },
      { id: 'cc-activity', label: 'Recent Activity Timeline', path: '/command-center#activity', icon: Clock, keywords: ['activity', 'timeline', 'log'] },
    ]
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
    description: 'Primary performance overview, equity & risk stats',
    keywords: ['dashboard', 'home', 'performance', 'equity', 'win rate', 'drawdown', 'profit'],
    children: [
      { id: 'dash-overview', label: 'Performance Overview', path: '/', icon: LayoutDashboard, keywords: ['overview', 'pnl', 'win rate'] },
      { id: 'dash-drawdown', label: 'Max Drawdown & Risk', path: '/#risk-overview', icon: TrendingDown, keywords: ['drawdown', 'underwater', 'loss'] },
      { id: 'dash-equity', label: 'Equity Curve & Underwater', path: '/#equity-curve', icon: LineChart, keywords: ['equity', 'chart', 'curve'] },
      { id: 'dash-trades', label: 'Recent Trades', path: '/#recent-trades', icon: BookOpen, keywords: ['recent', 'trades', 'history'] },
      { id: 'dash-calendar', label: 'Trading Calendar', path: '/#trading-calendar', icon: Calendar, keywords: ['calendar', 'monthly', 'days'] },
      { id: 'dash-news', label: 'High Impact News', path: '/#trading-news', icon: Flame, keywords: ['news', 'catalyst', 'events'] },
    ]
  },
  {
    id: 'add-trade',
    label: 'Add Trade',
    path: '/add',
    icon: PlusCircle,
    description: 'Manual and quick trade execution entry',
    keywords: ['add', 'new', 'entry', 'order', 'position', 'buy', 'sell', 'log'],
    children: [
      { id: 'add-new', label: 'New Trade Entry', path: '/add', icon: PlusCircle, keywords: ['log', 'new trade', 'record'] },
      { id: 'add-calc', label: 'Position Sizing Tool', path: '/calculator', icon: Calculator, keywords: ['calculator', 'lots', 'sizing', 'risk'] },
    ]
  },
  {
    id: 'journal',
    label: 'Journal',
    path: '/journal',
    icon: BookOpen,
    description: 'Complete trade database, reviews & tags',
    keywords: ['journal', 'log', 'trades', 'history', 'filters', 'audit', 'completeness'],
    children: [
      { id: 'journal-all', label: 'All Trades Log', path: '/journal', icon: BookOpen, keywords: ['all', 'table', 'entries'] },
      { id: 'journal-complete', label: 'Completed Records', path: '/journal?status=COMPLETE', icon: CheckCircle2, keywords: ['complete', 'verified'] },
      { id: 'journal-missing', label: 'Needs Review & Incomplete', path: '/journal?status=MISSING', icon: ShieldAlert, keywords: ['missing', 'incomplete', 'review'] },
      { id: 'journal-news', label: 'News Catalyst Trades', path: '/journal?macro=NEWS_ONLY', icon: Newspaper, keywords: ['news trades', 'catalyst'] },
    ]
  },
  {
    id: 'arena',
    label: 'Competition Arena',
    path: '/arena',
    icon: Swords,
    badge: '2.0',
    description: 'Private trading competitions, leaderboards & accountability',
    keywords: ['arena', 'competition', 'leaderboard', 'challenge', 'traders', 'tournament'],
    children: [
      { id: 'arena-active', label: 'Live Active Competitions', path: '/arena?status=active', icon: Flame, keywords: ['active', 'live', 'running'] },
      { id: 'arena-upcoming', label: 'Upcoming Arenas', path: '/arena?status=upcoming', icon: Clock, keywords: ['upcoming', 'future'] },
      { id: 'arena-completed', label: 'Completed Arenas', path: '/arena?status=completed', icon: Award, keywords: ['completed', 'past', 'history'] },
      { id: 'arena-all', label: 'All Arena Competitions', path: '/arena?status=all', icon: Swords, keywords: ['all', 'list'] },
    ]
  },
  {
    id: 'news',
    label: 'News Intelligence',
    path: '/news',
    icon: Newspaper,
    description: 'Real-time economic calendar, data releases & market pulse',
    keywords: ['news', 'calendar', 'economic', 'cpi', 'nfp', 'fomc', 'fed', 'interest', 'releases'],
    children: [
      { id: 'news-calendar', label: 'Economic Calendar', path: '/news?tab=calendar', icon: Calendar, badge: 'Core', keywords: ['calendar', 'events', 'forecast', 'impact'] },
      { id: 'news-feed', label: 'Market News Feed', path: '/news?tab=feed', icon: Newspaper, keywords: ['feed', 'breaking', 'stories'] },
      { id: 'news-releases', label: 'Economic Releases', path: '/news?tab=releases', icon: Activity, keywords: ['releases', 'actual', 'consensus'] },
      { id: 'news-data', label: 'Macroeconomic Data', path: '/news?tab=data', icon: Database, keywords: ['macro', 'gdp', 'inflation', 'rates'] },
      { id: 'news-snapshot', label: 'Market Snapshot', path: '/news?tab=snapshot', icon: PieChart, keywords: ['snapshot', 'sentiment', 'assets'] },
      { id: 'news-upcoming', label: 'Upcoming Events Timeline', path: '/news?tab=upcoming', icon: Clock, keywords: ['upcoming', 'schedule'] },
      { id: 'news-watchlist', label: 'Watchlist Intelligence', path: '/news?tab=watchlist', icon: Bookmark, keywords: ['watchlist', 'pairs', 'symbols'] },
      { id: 'news-saved', label: 'Saved Intelligence Stories', path: '/news?tab=saved', icon: Bookmark, keywords: ['saved', 'bookmarks', 'articles'] },
      { id: 'news-alerts', label: 'High-Impact Alerts', path: '/news?tab=alerts', icon: Bell, keywords: ['alerts', 'notifications', 'high impact'] },
      { id: 'news-academy', label: 'News Trading Academy', path: '/news?tab=academy', icon: GraduationCap, keywords: ['academy', 'learn', 'reaction'] },
      { id: 'news-perf', label: 'My News Performance Impact', path: '/news?tab=performance', icon: LineChart, keywords: ['performance', 'impact', 'news trades'] },
    ]
  },
  {
    id: 'calculator',
    label: 'Risk Calculator',
    path: '/calculator',
    icon: Calculator,
    description: 'Position size, pip value & risk management calculator',
    keywords: ['calculator', 'position', 'sizing', 'risk', 'pips', 'lot size', 'leverage'],
    children: [
      { id: 'calc-sizer', label: 'Position Sizing Calculator', path: '/calculator', icon: Calculator, keywords: ['position', 'sizer', 'risk calculation'] },
    ]
  },
  {
    id: 'analytics',
    label: 'Analytics',
    path: '/analytics',
    icon: BarChart2,
    description: 'Institutional metrics, distributions & execution analysis',
    keywords: ['analytics', 'metrics', 'sharpe', 'drawdown', 'profit factor', 'distributions', 'execution'],
    children: [
      { id: 'analytics-overview', label: 'Institutional Overview', path: '/analytics?tab=overview', icon: BarChart2, keywords: ['overview', 'metrics', 'kpis', 'drawdown', 'sharpe'] },
      { id: 'analytics-distributions', label: 'Trade Distributions & Time', path: '/analytics?tab=distributions', icon: LineChart, keywords: ['distributions', 'time', 'holding', 'r-multiple'] },
      { id: 'analytics-markets', label: 'Markets & Strategy Breakdown', path: '/analytics?tab=markets', icon: PieChart, keywords: ['markets', 'symbols', 'strategies', 'breakdown'] },
      { id: 'analytics-execution', label: 'Execution Quality & Timing', path: '/analytics?tab=execution', icon: Target, keywords: ['execution', 'slippage', 'timing', 'quality'] },
    ]
  },
  {
    id: 'strategies',
    label: 'Strategies',
    path: '/strategies',
    icon: Target,
    description: 'Strategy playbook, institutional library & quant models',
    keywords: ['strategy', 'playbook', 'rules', 'setups', 'edge', 'quant', 'backtest'],
    children: [
      { id: 'strat-custom', label: 'My Strategy Playbook', path: '/strategies?tab=custom', icon: Target, keywords: ['custom', 'playbook', 'active'] },
      { id: 'strat-recommended', label: 'Institutional Strategy Library', path: '/strategies?tab=recommended', icon: BookOpen, keywords: ['library', 'recommended', 'institutional'] },
      { id: 'strat-research', label: 'Quantitative Strategy Research', path: '/strategies?tab=research', icon: FlaskConical, keywords: ['quant', 'research', 'models'] },
      { id: 'strat-create', label: 'Create New Strategy', path: '/strategies/create', icon: PlusCircle, keywords: ['create', 'new strategy', 'add'] },
    ]
  },
  {
    id: 'psychology',
    label: 'Psychology',
    path: '/psychology',
    icon: Brain,
    description: 'Behavioral analytics, cognitive biases & discipline tracking',
    keywords: ['psychology', 'discipline', 'fomo', 'biases', 'emotions', 'tilt', 'mindset'],
    children: [
      { id: 'psych-analytics', label: 'Behavioral Analytics & Insights', path: '/psychology?tab=analytics', icon: Activity, keywords: ['analytics', 'insights', 'mindset score'] },
      { id: 'psych-workspace', label: 'Daily Tracking Workspace', path: '/psychology?tab=workspace', icon: BookOpen, keywords: ['workspace', 'daily', 'trades', 'checklist'] },
      { id: 'psych-biases', label: 'Cognitive Biases Library', path: '/psychology?tab=biases', icon: Brain, keywords: ['biases', 'fomo', 'revenge', 'greed'] },
      { id: 'psych-protocols', label: 'Psychological Protocols', path: '/psychology?tab=protocols', icon: ShieldCheck, keywords: ['protocols', 'interventions', 'discipline'] },
    ]
  },
  {
    id: 'academy',
    label: 'Academy',
    path: '/academy',
    icon: GraduationCap,
    description: 'Comprehensive trader education, AI tutor & interactive labs',
    keywords: ['academy', 'learn', 'education', 'course', 'tutor', 'flashcards', 'glossary', 'quiz'],
    children: [
      { id: 'acad-home', label: 'Curriculum & Lessons', path: '/academy?tab=home', icon: GraduationCap, keywords: ['curriculum', 'lessons', 'overview'] },
      { id: 'acad-tutor', label: 'AI Trading Tutor', path: '/academy?tab=tutor', icon: Bot, badge: 'AI', keywords: ['tutor', 'ai', 'mentor', 'assistant'] },
      { id: 'acad-my-learning', label: 'My Learning Plan', path: '/academy?tab=my-learning', icon: BookOpen, keywords: ['plan', 'in progress', 'continue'] },
      { id: 'acad-path', label: 'Guided Learning Paths', path: '/academy?tab=path', icon: Compass, keywords: ['paths', 'track', 'beginner', 'advanced'] },
      { id: 'acad-skills', label: 'Interactive Skill Tree', path: '/academy?tab=skills', icon: Layers, keywords: ['skills', 'tree', 'progression'] },
      { id: 'acad-library', label: 'Knowledge Library', path: '/academy?tab=library', icon: BookOpenCheck, keywords: ['library', 'articles', 'theory'] },
      { id: 'acad-labs', label: 'Interactive Trading Labs', path: '/academy?tab=labs', icon: FlaskConical, keywords: ['labs', 'simulation', 'practice'] },
      { id: 'acad-casestudies', label: 'Real Case Studies', path: '/academy?tab=casestudies', icon: FileText, keywords: ['case studies', 'historical', 'breakdowns'] },
      { id: 'acad-quizzes', label: 'Practice Quizzes', path: '/academy?tab=quizzes', icon: Award, keywords: ['quizzes', 'tests', 'knowledge check'] },
      { id: 'acad-flashcards', label: 'Trading Flashcards', path: '/academy?tab=flashcards', icon: Layers, keywords: ['flashcards', 'terms', 'memorize'] },
      { id: 'acad-formulas', label: 'Formula Cheat Sheet', path: '/academy?tab=formulas', icon: Calculator, keywords: ['formulas', 'math', 'r-multiple', 'win rate'] },
      { id: 'acad-glossary', label: 'Trading Glossary', path: '/academy?tab=glossary', icon: HelpCircle, keywords: ['glossary', 'terms', 'definitions'] },
      { id: 'acad-notes', label: 'Notes & Bookmarks', path: '/academy?tab=notes-bookmarks', icon: Bookmark, keywords: ['notes', 'bookmarks', 'saved'] },
      { id: 'acad-mistakes', label: 'Mistake Bank & Review', path: '/academy?tab=mistakes', icon: ShieldAlert, keywords: ['mistakes', 'errors', 'review'] },
      { id: 'acad-progress', label: 'Progress Analytics', path: '/academy?tab=progress', icon: LineChart, keywords: ['progress', 'stats', 'completion'] },
    ]
  },
  {
    id: 'ai-labs',
    label: 'AI & Labs',
    path: '/ai-labs',
    icon: Sparkles,
    badge: 'Pro',
    description: 'AI intelligence analyst, pattern recognition & quant labs',
    keywords: ['ai', 'labs', 'intelligence', 'analyst', 'patterns', 'quant', 'hypothesis', 'scenarios'],
    children: [
      { id: 'ai-analyst', label: 'Trading Intelligence Analyst', path: '/ai-labs?tab=analyst', icon: Sparkles, badge: 'AI', keywords: ['analyst', 'ai', 'insights', 'diagnostics'] },
      { id: 'ai-patterns', label: 'Pattern Lab', path: '/ai-labs?tab=patterns', icon: GitCompare, keywords: ['patterns', 'clusters', 'setups'] },
      { id: 'ai-quant', label: 'Quantitative Lab', path: '/ai-labs?tab=quant', icon: Calculator, keywords: ['quant', 'statistics', 'distributions'] },
      { id: 'ai-hypothesis', label: 'Hypothesis Lab', path: '/ai-labs?tab=hypothesis', icon: Lightbulb, keywords: ['hypothesis', 'testing', 'thesis'] },
      { id: 'ai-scenarios', label: 'Scenario & Stress Lab', path: '/ai-labs?tab=scenarios', icon: FlaskConical, keywords: ['scenarios', 'stress test', 'simulation'] },
      { id: 'ai-experiments', label: 'Experiment Tracker', path: '/ai-labs?tab=experiments', icon: Clock, keywords: ['experiments', 'ab testing', 'trials'] },
      { id: 'ai-alerts', label: 'AI Alerts & Behavioral Triggers', path: '/ai-labs?tab=alerts', icon: Bell, keywords: ['alerts', 'triggers', 'risk alarms'] },
      { id: 'ai-quality', label: 'Data Quality & Readiness', path: '/ai-labs?tab=quality', icon: Database, keywords: ['quality', 'data', 'completeness'] },
      { id: 'ai-controls', label: 'AI Controls & Privacy', path: '/ai-labs?tab=controls', icon: ShieldCheck, keywords: ['controls', 'privacy', 'telemetry', 'opt-out'] },
    ]
  },
  {
    id: 'learning-rules',
    label: 'Learning & Rules',
    path: '/learning-rules',
    icon: BookOpenCheck,
    description: 'Daily takeaways, golden rules & playbook adherence',
    keywords: ['learning', 'rules', 'lessons', 'guidelines', 'discipline', 'notes'],
    children: [
      { id: 'lr-learning', label: "Today's Learning & Log", path: '/learning-rules?tab=learning', icon: BookOpenCheck, keywords: ['learning', 'notes', 'today', 'takeaways'] },
      { id: 'lr-rules', label: 'My Trading Rules', path: '/learning-rules?tab=rules', icon: ShieldCheck, keywords: ['rules', 'guidelines', 'checklist'] },
    ]
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: Settings,
    description: 'Account, risk limits, appearance & system preferences',
    keywords: ['settings', 'preferences', 'profile', 'account', 'theme', 'dark mode', 'risk', 'notifications'],
    children: [
      { id: 'set-profile', label: 'Profile & Trader Details', path: '/settings?tab=profile', icon: User, keywords: ['profile', 'avatar', 'name', 'bio'] },
      { id: 'set-dashboards', label: 'Dashboards & Journals', path: '/settings?tab=dashboards', icon: BookOpen, keywords: ['dashboards', 'journals', 'create', 'switch'] },
      { id: 'set-accounts', label: 'Trading Accounts', path: '/settings?tab=accounts', icon: CreditCard, keywords: ['accounts', 'broker', 'balance', 'currency'] },
      { id: 'set-risk', label: 'Risk Management Limits', path: '/settings?tab=risk', icon: ShieldAlert, keywords: ['risk', 'daily limit', 'max loss', 'drawdown'] },
      { id: 'set-entry', label: 'Trade Entry Defaults', path: '/settings?tab=entry', icon: LogIn, keywords: ['entry', 'defaults', 'r-multiple'] },
      { id: 'set-strategy', label: 'Strategy Defaults', path: '/settings?tab=strategy', icon: Target, keywords: ['strategy', 'defaults', 'tagging'] },
      { id: 'set-schedule', label: 'Trading Schedule & Sessions', path: '/settings?tab=schedule', icon: Clock, keywords: ['schedule', 'sessions', 'hours', 'london', 'ny'] },
      { id: 'set-analytics', label: 'Analytics Preferences', path: '/settings?tab=analytics', icon: BarChart2, keywords: ['analytics', 'metrics', 'benchmarks'] },
      { id: 'set-psychology', label: 'Psychology Settings', path: '/settings?tab=psychology', icon: Brain, keywords: ['psychology', 'discipline', 'thresholds'] },
      { id: 'set-dashboard', label: 'Dashboard Widgets', path: '/settings?tab=dashboard', icon: LayoutDashboard, keywords: ['dashboard', 'widgets', 'kpis'] },
      { id: 'set-appearance', label: 'Appearance & Theme', path: '/settings?tab=appearance', icon: Palette, keywords: ['theme', 'dark mode', 'light', 'colors'] },
      { id: 'set-notifications', label: 'Alerts & Notifications', path: '/settings?tab=notifications', icon: Bell, keywords: ['notifications', 'sounds', 'popups'] },
      { id: 'set-data', label: 'Data, Backup & Export', path: '/settings?tab=data', icon: Database, keywords: ['data', 'export', 'backup', 'csv', 'json'] },
      { id: 'set-security', label: 'Security & Privacy', path: '/settings?tab=security', icon: ShieldCheck, keywords: ['security', 'password', 'privacy', 'sessions'] },
      { id: 'set-ai', label: 'AI Configuration', path: '/settings?tab=ai', icon: Zap, keywords: ['ai', 'gemini', 'models'] },
      { id: 'set-labs', label: 'Labs & Feature Flags', path: '/settings?tab=labs', icon: FlaskConical, keywords: ['labs', 'experimental', 'beta'] },
    ]
  }
];

// Helper to flatten items for fast search and pin matching
export interface FlatNavItem {
  id: string;
  label: string;
  path: string;
  sectionId: string;
  sectionLabel: string;
  icon: LucideIcon;
  badge?: string;
  description?: string;
  keywords: string[];
}

export function getFlattenedNavItems(): FlatNavItem[] {
  const result: FlatNavItem[] = [];

  for (const section of NAVIGATION_CONFIG) {
    // Add section itself
    result.push({
      id: section.id,
      label: section.label,
      path: section.path,
      sectionId: section.id,
      sectionLabel: section.label,
      icon: section.icon,
      badge: section.badge,
      description: section.description,
      keywords: section.keywords || [section.label.toLowerCase()]
    });

    if (section.children) {
      for (const child of section.children) {
        result.push({
          id: child.id,
          label: child.label,
          path: child.path,
          sectionId: section.id,
          sectionLabel: section.label,
          icon: child.icon || section.icon,
          badge: child.badge,
          description: child.description,
          keywords: [
            ...(child.keywords || []),
            child.label.toLowerCase(),
            section.label.toLowerCase()
          ]
        });
      }
    }
  }

  return result;
}
