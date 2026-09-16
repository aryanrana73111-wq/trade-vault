import os

path = 'src/types.ts'
with open(path, 'r') as f:
    content = f.read()

arena_types = """
// ---------------------------------------------------------
// ARENA TYPES
// ---------------------------------------------------------

export type CompetitionMode = 'P&L' | 'ROI' | 'Avg R' | 'Consistency' | 'Risk Discipline' | 'Execution' | 'Composite';

export interface ArenaSharingPermissions {
  profile: boolean;
  performance: boolean;
  tradeDetails: boolean;
  research: boolean;
  psychology: boolean;
}

export interface ArenaMember {
  userId: string;
  joinedAt: number;
  status: 'pending' | 'accepted' | 'declined' | 'removed' | 'left';
  role: 'owner' | 'member';
  displayName?: string;
  photoURL?: string;
  sharingPermissions: ArenaSharingPermissions;
  // Summary stats updated dynamically or via batch
  stats?: {
    netPnl: number;
    roi: number;
    winRate: number;
    avgR: number;
    profitFactor: number | 'MAX';
    maxDrawdown: number;
    tradeCount: number;
    score: number;
  };
}

export interface Arena {
  id: string;
  name: string;
  code: string; // Unique invite code
  ownerId: string;
  createdAt: number;
  updatedAt: number;
  startDate: number;
  endDate: number;
  durationDays: number;
  status: 'upcoming' | 'active' | 'completed' | 'closed';
  competitionMode: CompetitionMode;
  startingMode: 'Live Journal' | 'Snapshot' | 'Normalized R';
  members: Record<string, ArenaMember>;
  settings: {
    fairPlayEnabled: boolean;
    compositeWeights?: {
      rPerformance: number;
      riskDiscipline: number;
      ruleAdherence: number;
      consistency: number;
      execution: number;
      journalCompletion: number;
    };
  };
}

export interface SharedTradeProjection {
  id: string;
  arenaId: string;
  originalTradeId: string;
  userId: string;
  createdAt: number;
  updatedAt: number;
  
  // Conditionally populated based on sharing permissions
  date?: number;
  time?: string;
  market?: string;
  direction?: string;
  result?: string;
  pnl?: number;
  rMultiple?: number;
  entry?: number;
  exit?: number;
  stopLoss?: number;
  takeProfit?: number;
  positionSize?: number;
  
  strategy?: string;
  session?: string;
  timeframe?: string;
  setup?: string;
  
  emotions?: string[];
  mistakes?: string[];
  ruleAdherence?: string;
  fomoLevel?: number;
}
"""

if "export interface Arena " not in content:
    with open(path, 'a') as f:
        f.write(arena_types)
