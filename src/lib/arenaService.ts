import { db, auth } from './firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch
} from 'firebase/firestore';
import {
  Arena,
  ArenaMember,
  ParticipantStats,
  SharedTradeProjection,
  Trade,
  CompetitionTrade,
  CompetitionScoringMode,
  CompetitionState,
  PrivacyMode,
  FairPlayMode,
  MiniChallenge,
  AuditLog,
  CompetitionActivity,
  FinalCompetitionReport,
  Market,
  Direction,
  Session,
  Timeframe,
  Result,
  CompetitionRule,
  CompetitionViolation,
  RuleEvaluationLog,
  RuleSeverity,
  RuleEnforcement,
  RuleHistoryEntry
} from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { cleanUndefined } from '@/lib/utils';
import {
  evaluateCompetitionRules,
  generateDefaultCompetitionRules
} from './competitionRuleEngine';

export function generateArenaCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'TV-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function createInitialParticipantStats(): ParticipantStats {
  return {
    netPnl: 0,
    roi: 0,
    totalR: 0,
    avgR: 0,
    winRate: 0,
    profitFactor: 0,
    maxDrawdown: 0,
    tradeCount: 0,
    winCount: 0,
    lossCount: 0,
    breakEvenCount: 0,
    highestSingleTrade: 0,
    worstSingleLoss: 0,
    avgWin: 0,
    avgLoss: 0,
    winStreak: 0,
    maxWinStreak: 0,
    ruleAdherenceAvg: 100,
    journalCompletionRate: 100,
    score: 0,
    qualified: false
  };
}

export interface CreateCompetitionParams {
  ownerId: string;
  name: string;
  description?: string;
  durationDays: number;
  startDate?: number;
  endDate?: number;
  scoringMode: CompetitionScoringMode;
  startingMode?: 'Live Journal' | 'Snapshot' | 'Normalized R';
  privacyMode?: PrivacyMode;
  fairPlayMode?: FairPlayMode;
  timezone?: string;
  startingBalance?: number;
  maxMembers?: number;
  minTrades?: number;
  maxTrades?: number;
  allowedMarkets?: string[];
  allowedStrategies?: string[];
  allowedSessions?: string[];
  allowedDirections?: ('BUY' | 'SELL')[];
  riskLimits?: {
    maxRiskPercentPerTrade?: number;
    maxDrawdownPercent?: number;
  };
  initialPermissions?: any;
  ownerDisplayName?: string;
  ownerPhotoURL?: string;
}

export async function createArena(
  ownerId: string,
  name: string,
  durationDays: number,
  competitionMode: any = 'Avg R',
  startingMode: any = 'Normalized R',
  initialPermissions: any = { profile: true, performance: true, tradeDetails: true, research: true, psychology: true }
): Promise<Arena> {
  return createCompetition({
    ownerId,
    name,
    durationDays,
    scoringMode: competitionMode as CompetitionScoringMode,
    startingMode,
    initialPermissions
  });
}

export async function createCompetition(params: CreateCompetitionParams): Promise<Arena> {
  const arenaRef = doc(collection(db, 'arenas'));
  const now = Date.now();
  const startDate = params.startDate || now;
  const endDate = params.endDate || (startDate + params.durationDays * 24 * 60 * 60 * 1000);

  const initialPermissions = params.initialPermissions || {
    profile: true,
    performance: true,
    tradeDetails: true,
    research: true,
    psychology: true,
    screenshots: true
  };

  const member: ArenaMember = {
    userId: params.ownerId,
    joinedAt: now,
    status: 'accepted',
    role: 'owner',
    displayName: params.ownerDisplayName || 'Competition Host',
    photoURL: params.ownerPhotoURL,
    sharingPermissions: initialPermissions,
    stats: createInitialParticipantStats()
  };

  const isLiveNow = now >= startDate && now < endDate;
  const state: CompetitionState = isLiveNow ? 'LIVE' : (now < startDate ? 'WAITING' : 'ENDED');

  const defaultRules = generateDefaultCompetitionRules(arenaRef.id, params.ownerId);

  const arena: Arena = {
    id: arenaRef.id,
    name: params.name,
    description: params.description || '',
    code: generateArenaCode(),
    ownerId: params.ownerId,
    createdAt: now,
    updatedAt: now,
    startDate,
    endDate,
    durationDays: params.durationDays,
    status: state === 'LIVE' ? 'active' : (state === 'WAITING' ? 'upcoming' : 'completed'),
    state,
    competitionMode: params.scoringMode,
    scoringMode: params.scoringMode,
    startingMode: params.startingMode || 'Normalized R',
    privacyMode: params.privacyMode || 'Standard',
    fairPlayMode: params.fairPlayMode || 'Fair Play',
    timezone: params.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    startingBalance: params.startingBalance || 10000,
    maxMembers: params.maxMembers,
    minTrades: params.minTrades || 3,
    maxTrades: params.maxTrades,
    allowedMarkets: params.allowedMarkets || [],
    allowedStrategies: params.allowedStrategies || [],
    allowedSessions: params.allowedSessions || [],
    allowedDirections: params.allowedDirections || [],
    riskLimits: params.riskLimits,
    rules: defaultRules,
    rulesVersion: 1,
    rulesSnapshot: defaultRules,
    allowRuleChangesDuringCompetition: false,
    violations: [],
    evaluationLogs: [],
    members: {
      [params.ownerId]: {
        ...member,
        complianceStatus: 'ACTIVE',
        isDisqualified: false,
        ruleVersionAccepted: 1,
        ruleAcceptedAt: now
      }
    },
    memberIds: [params.ownerId],
    challenges: [],
    auditTrail: [
      {
        id: uuidv4(),
        timestamp: now,
        userId: params.ownerId,
        userName: params.ownerDisplayName || 'Host',
        action: 'CREATED_COMPETITION',
        details: `Created competition "${params.name}" with scoring mode ${params.scoringMode}`
      }
    ],
    activities: [
      {
        id: uuidv4(),
        timestamp: now,
        userId: params.ownerId,
        userName: params.ownerDisplayName || 'Host',
        type: 'system',
        message: `Competition created and initialized.`
      }
    ],
    settings: {
      fairPlayEnabled: true,
      compositeWeights: {
        rPerformance: 40,
        riskDiscipline: 20,
        ruleAdherence: 15,
        consistency: 10,
        execution: 10,
        journalCompletion: 5
      }
    }
  };

  await setDoc(arenaRef, cleanUndefined(arena));
  return arena;
}

export async function joinArena(userId: string, code: string, permissions: any, userProfile?: any) {
  return joinCompetition(userId, code, permissions, userProfile);
}

export async function joinCompetition(userId: string, code: string, permissions: any, userProfile?: any) {
  const q = query(collection(db, 'arenas'), where('code', '==', code.trim().toUpperCase()));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error('Invalid competition invite code. Please check the code and try again.');
  }

  const arenaDoc = snapshot.docs[0];
  const arena = arenaDoc.data() as Arena;

  if (arena.members[userId] && arena.members[userId].status === 'accepted') {
    throw new Error('You have already joined this competition.');
  }

  if (arena.maxMembers && (arena.memberIds?.length || 0) >= arena.maxMembers) {
    throw new Error(`This competition is full (maximum ${arena.maxMembers} participants).`);
  }

  const member: ArenaMember = {
    userId,
    joinedAt: Date.now(),
    status: 'accepted',
    role: 'member',
    displayName: userProfile?.fullName || userProfile?.name || 'Trader',
    photoURL: userProfile?.avatarUrl,
    sharingPermissions: permissions || {
      profile: true,
      performance: true,
      tradeDetails: true,
      research: true,
      psychology: true,
      screenshots: true
    },
    complianceStatus: 'ACTIVE',
    isDisqualified: false,
    ruleVersionAccepted: arena.rulesVersion || 1,
    ruleAcceptedAt: Date.now(),
    stats: createInitialParticipantStats()
  };

  const updatedMemberIds = Array.from(new Set([...(arena.memberIds || []), userId]));
  const joinActivity: CompetitionActivity = {
    id: uuidv4(),
    timestamp: Date.now(),
    userId,
    userName: member.displayName || 'Trader',
    type: 'system',
    message: `${member.displayName || 'A trader'} joined the competition.`
  };

  const newActivities = [joinActivity, ...(arena.activities || [])].slice(0, 50);

  await updateDoc(arenaDoc.ref, cleanUndefined({
    [`members.${userId}`]: member,
    memberIds: updatedMemberIds,
    activities: newActivities,
    updatedAt: Date.now()
  }));

  return {
    ...arena,
    members: { ...arena.members, [userId]: member },
    memberIds: updatedMemberIds,
    activities: newActivities
  };
}

export function calculateParticipantStats(
  trades: CompetitionTrade[],
  startingBalance: number = 10000,
  minTrades: number = 3
): ParticipantStats {
  const stats = createInitialParticipantStats();
  if (!trades || trades.length === 0) {
    stats.qualified = stats.tradeCount >= minTrades;
    return stats;
  }

  stats.tradeCount = trades.length;
  let totalPnl = 0;
  let totalR = 0;
  let grossWins = 0;
  let grossLosses = 0;
  let totalWinR = 0;
  let totalLossR = 0;
  let peakPnl = 0;
  let maxDD = 0;
  let currentStreak = 0;
  let maxStreak = 0;
  let ruleAdherenceSum = 0;
  let ruleCount = 0;
  let completedJournalCount = 0;

  // Sort trades chronologically to compute streaks and drawdown correctly
  const sortedTrades = [...trades].sort((a, b) => (a.date || a.createdAt) - (b.date || b.createdAt));

  sortedTrades.forEach((trade) => {
    const pnl = Number(trade.pnl) || 0;
    const r = Number(trade.rMultiple) || (pnl !== 0 && trade.riskAmount && trade.riskAmount > 0 ? pnl / trade.riskAmount : 0);

    totalPnl += pnl;
    totalR += r;

    if (pnl > stats.highestSingleTrade) {
      stats.highestSingleTrade = pnl;
    }
    if (pnl < stats.worstSingleLoss) {
      stats.worstSingleLoss = pnl;
    }

    if (trade.result === 'WIN' || pnl > 0) {
      stats.winCount++;
      grossWins += pnl;
      totalWinR += r;
      currentStreak = currentStreak >= 0 ? currentStreak + 1 : 1;
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    } else if (trade.result === 'LOSS' || pnl < 0) {
      stats.lossCount++;
      grossLosses += Math.abs(pnl);
      totalLossR += Math.abs(r);
      currentStreak = currentStreak <= 0 ? currentStreak - 1 : -1;
    } else {
      stats.breakEvenCount++;
      currentStreak = 0;
    }

    // Drawdown calculation
    if (totalPnl > peakPnl) {
      peakPnl = totalPnl;
    }
    const currentDD = peakPnl - totalPnl;
    if (currentDD > maxDD) {
      maxDD = currentDD;
    }

    // Rule adherence
    if (trade.ruleAdherence !== undefined && !isNaN(Number(trade.ruleAdherence))) {
      ruleAdherenceSum += Number(trade.ruleAdherence);
      ruleCount++;
    }

    // Journal completion (notes, mistake, learning, strategy)
    if (trade.sharedNotes || trade.strategy) {
      completedJournalCount++;
    }
  });

  stats.netPnl = totalPnl;
  stats.roi = startingBalance > 0 ? (totalPnl / startingBalance) * 100 : 0;
  stats.totalR = Number(totalR.toFixed(2));
  stats.avgR = stats.tradeCount > 0 ? Number((totalR / stats.tradeCount).toFixed(2)) : 0;
  stats.winRate = stats.tradeCount > 0 ? Number(((stats.winCount / stats.tradeCount) * 100).toFixed(1)) : 0;
  stats.profitFactor = grossLosses > 0 ? Number((grossWins / grossLosses).toFixed(2)) : (grossWins > 0 ? 'MAX' : 0);
  stats.maxDrawdown = Number(maxDD.toFixed(2));
  stats.avgWin = stats.winCount > 0 ? Number((grossWins / stats.winCount).toFixed(2)) : 0;
  stats.avgLoss = stats.lossCount > 0 ? Number((grossLosses / stats.lossCount).toFixed(2)) : 0;
  stats.winStreak = currentStreak;
  stats.maxWinStreak = maxStreak;
  stats.ruleAdherenceAvg = ruleCount > 0 ? Math.round(ruleAdherenceSum / ruleCount) : 100;
  stats.journalCompletionRate = stats.tradeCount > 0 ? Math.round((completedJournalCount / stats.tradeCount) * 100) : 100;
  stats.qualified = stats.tradeCount >= minTrades;

  // Composite scoring model (0 - 1000 scale)
  const rComponent = Math.max(0, stats.totalR * 50);
  const winRateComponent = stats.winRate * 3;
  const ruleComponent = stats.ruleAdherenceAvg * 2;
  const streakBonus = Math.min(100, stats.maxWinStreak * 20);
  const ddPenalty = stats.maxDrawdown > 0 && startingBalance > 0 ? (stats.maxDrawdown / startingBalance) * 200 : 0;

  stats.score = Math.max(0, Math.round(rComponent + winRateComponent + ruleComponent + streakBonus - ddPenalty));

  return stats;
}

export interface AddCompetitionTradeInput {
  competitionId: string;
  userId: string;
  userDisplayName?: string;
  userAvatar?: string;
  trade: {
    id?: string;
    date: number;
    time?: string;
    market: string;
    direction: 'BUY' | 'SELL';
    entry: number;
    exit?: number;
    stopLoss: number;
    takeProfit: number;
    positionSize: number;
    riskAmount: number;
    riskPercent?: number;
    result?: 'WIN' | 'LOSS' | 'BREAK EVEN' | 'PENDING';
    pnl?: number;
    rMultiple?: number;
    setupQuality?: 'A+' | 'B' | 'C';
    setupQualityReason?: string;
    strategy?: string;
    session?: string;
    timeframe?: string;
    screenshot?: string;
    entryScreenshot?: string;
    exitScreenshot?: string;
    sharedNotes?: string;
    ruleAdherence?: number;
    mistake?: string;
    learning?: string;
  };
  addToPersonalJournal: boolean;
  dashboardId?: string;
}

export async function addCompetitionTrade(input: AddCompetitionTradeInput): Promise<CompetitionTrade> {
  const { competitionId, userId, userDisplayName, userAvatar, trade, addToPersonalJournal, dashboardId } = input;
  const now = Date.now();

  const arenaDocRef = doc(db, 'arenas', competitionId);
  const arenaSnap = await getDoc(arenaDocRef);
  if (!arenaSnap.exists()) {
    throw new Error('Competition not found.');
  }

  const arena = arenaSnap.data() as Arena;
  const member = arena.members[userId];
  if (!member || member.status !== 'accepted') {
    throw new Error('You are not an active member of this competition.');
  }

  // Check state
  if (arena.state === 'ENDED' || arena.state === 'ARCHIVED' || arena.status === 'completed') {
    throw new Error('This competition has concluded. New trades cannot be logged.');
  }

  // Auto-heal legacy or erroneous trade-parameter disqualification (e.g. Maximum Risk Per Trade)
  if (
    member.isDisqualified &&
    (member.disqualifiedRuleName === 'Maximum Risk Per Trade' ||
      member.disqualificationReason?.includes('Maximum Risk Per Trade'))
  ) {
    member.isDisqualified = false;
    member.complianceStatus = 'ACTIVE';
    try {
      await updateDoc(arenaDocRef, cleanUndefined({
        [`members.${userId}.isDisqualified`]: false,
        [`members.${userId}.complianceStatus`]: 'ACTIVE',
        [`members.${userId}.disqualificationReason`]: undefined,
        [`members.${userId}.disqualifiedRuleName`]: undefined,
        updatedAt: now
      }));
    } catch (e) {
      console.warn('Auto-healed disqualification sync notice:', e);
    }
  } else if (member.isDisqualified || member.complianceStatus === 'DISQUALIFIED') {
    throw new Error(
      `COMPETITION_PARTICIPANT_DISQUALIFIED: You are disqualified from this competition (${member.disqualificationReason || 'Rule violation'}) and cannot add new trades.`
    );
  }

  // Canonical trade ID
  const canonicalTradeId = trade.id || uuidv4();
  const projectionId = `${competitionId}_${canonicalTradeId}`;
  const projectionRef = doc(db, 'arenas', competitionId, 'shared_trades', projectionId);

  // Check if projection already exists (e.g. updating trade synced from journal)
  const existingDocSnap = await getDoc(projectionRef);
  const isExisting = existingDocSnap.exists();
  const existingData = isExisting ? (existingDocSnap.data() as CompetitionTrade) : null;

  // Backfill detection: if trade date is > 2 hours in the past compared to real submit time
  const isBackfilled = isExisting && existingData?.isBackfilled !== undefined
    ? existingData.isBackfilled
    : Math.abs(now - trade.date) > 2 * 60 * 60 * 1000;
  const status = isExisting && existingData?.status ? existingData.status : (isBackfilled ? 'Needs Review' : 'Normal');

  // Calculate R multiple if not explicit
  let rMultiple = trade.rMultiple;
  if (rMultiple === undefined && trade.riskAmount > 0 && trade.pnl !== undefined) {
    rMultiple = Number((trade.pnl / trade.riskAmount).toFixed(2));
  }

  const permissions = member.sharingPermissions || {
    profile: true,
    performance: true,
    tradeDetails: true,
    research: true,
    psychology: true,
    screenshots: true
  };

  const projection: CompetitionTrade = {
    id: projectionId,
    arenaId: competitionId,
    originalTradeId: canonicalTradeId,
    userId,
    userDisplayName: permissions.profile ? (userDisplayName || member.displayName || 'Trader') : 'Anonymous Trader',
    userAvatar: permissions.profile ? (userAvatar || member.photoURL) : undefined,
    createdAt: isExisting && existingData?.createdAt ? existingData.createdAt : (trade.date || now),
    updatedAt: now,
    submittedAt: isExisting && existingData?.submittedAt ? existingData.submittedAt : now,
    isBackfilled,
    status,
    verificationStatus: isExisting && existingData?.verificationStatus ? existingData.verificationStatus : 'Manual',
    inPersonalJournal: addToPersonalJournal || (isExisting && existingData?.inPersonalJournal) || false,
    personalTradeId: addToPersonalJournal ? canonicalTradeId : (isExisting ? existingData?.personalTradeId : undefined),
    editsCount: isExisting ? ((existingData?.editsCount || 0) + 1) : 0
  };

  if (permissions.performance) {
    projection.pnl = trade.pnl;
    projection.rMultiple = rMultiple;
    projection.result = trade.result;
    projection.riskAmount = trade.riskAmount;
    projection.riskPercent = trade.riskPercent;
  }

  if (permissions.tradeDetails) {
    projection.date = trade.date;
    projection.time = trade.time;
    projection.market = trade.market;
    projection.direction = trade.direction;
    projection.entry = trade.entry;
    projection.exit = trade.exit;
    projection.stopLoss = trade.stopLoss;
    projection.takeProfit = trade.takeProfit;
    projection.positionSize = trade.positionSize;
  }

  if (permissions.research) {
    projection.strategy = trade.strategy;
    projection.session = trade.session;
    projection.timeframe = trade.timeframe;
  }

  if (permissions.psychology) {
    projection.ruleAdherence = trade.ruleAdherence ? trade.ruleAdherence.toString() : undefined;
    projection.sharedNotes = trade.sharedNotes;
    if (trade.mistake) projection.mistakes = [trade.mistake];
  }

  if (permissions.screenshots) {
    if (trade.entryScreenshot) projection.entryScreenshot = trade.entryScreenshot;
    if (trade.exitScreenshot) projection.exitScreenshot = trade.exitScreenshot;
    if (trade.screenshot || trade.entryScreenshot) {
      projection.screenshot = trade.screenshot || trade.entryScreenshot;
    }
  }

  const batch = writeBatch(db);
  batch.set(projectionRef, cleanUndefined(projection));

  // If user requested to add to Personal Journal, save canonical trade to user's dashboard trades subcollection
  if (addToPersonalJournal && dashboardId) {
    const personalTradeRef = doc(db, 'users', userId, 'dashboards', dashboardId, 'trades', canonicalTradeId);
    const personalTradeData: Trade = {
      id: canonicalTradeId,
      userId,
      dashboardId,
      date: trade.date,
      time: trade.time,
      market: trade.market,
      direction: trade.direction,
      entry: trade.entry,
      exitPrice: trade.exit,
      stopLoss: trade.stopLoss,
      takeProfit: trade.takeProfit,
      positionSize: trade.positionSize,
      risk: trade.riskAmount,
      riskPercent: trade.riskPercent,
      result: trade.result,
      pnl: trade.pnl,
      rMultiple: rMultiple,
      strategy: trade.strategy || '',
      session: trade.session || '',
      timeframe: trade.timeframe || '',
      notes: trade.sharedNotes || '',
      mistake: trade.mistake || '',
      learning: trade.learning || '',
      screenshot: trade.entryScreenshot || trade.screenshot,
      entryScreenshot: trade.entryScreenshot,
      exitScreenshot: trade.exitScreenshot,
      screenshots: {
        before: trade.entryScreenshot,
        after: trade.exitScreenshot
      },
      ruleAdherence: trade.ruleAdherence,
      emotions: [],
      createdAt: isExisting && existingData?.createdAt ? existingData.createdAt : now,
      updatedAt: now
    };
    batch.set(personalTradeRef, cleanUndefined(personalTradeData), { merge: true });
  }

  // Append to Audit Trail & Activities
  const auditEntry: AuditLog = {
    id: uuidv4(),
    timestamp: now,
    userId,
    userName: userDisplayName || member.displayName || 'Trader',
    action: isExisting ? 'EDITED_TRADE' : (isBackfilled ? 'LOGGED_TRADE_BACKFILLED' : 'LOGGED_TRADE'),
    details: isExisting 
      ? `Updated trade ${trade.direction} ${trade.market} | Result: ${trade.result || 'Pending'} | P&L: ${trade.pnl !== undefined ? '$' + trade.pnl : 'N/A'} (Edit #${projection.editsCount})`
      : `${trade.direction} ${trade.market} | Result: ${trade.result || 'Pending'} | P&L: ${trade.pnl !== undefined ? '$' + trade.pnl : 'N/A'}`,
    tradeId: canonicalTradeId,
    flagged: isBackfilled
  };

  const activityEntry: CompetitionActivity = {
    id: uuidv4(),
    timestamp: now,
    userId,
    userName: userDisplayName || member.displayName || 'Trader',
    type: 'trade',
    message: isExisting
      ? `Updated ${trade.direction} on ${trade.market} (${trade.result || 'OPEN'}).`
      : `Logged ${trade.direction} on ${trade.market} (${trade.result || 'OPEN'}).`,
    metadata: {
      market: trade.market,
      result: trade.result,
      rMultiple
    }
  };

  const newAuditTrail = [auditEntry, ...(arena.auditTrail || [])].slice(0, 100);
  const newActivities = [activityEntry, ...(arena.activities || [])].slice(0, 50);

  // Read existing trades for this user to recalculate stats and evaluate competition rules
  const qUserTrades = query(
    collection(db, 'arenas', competitionId, 'shared_trades'),
    where('userId', '==', userId)
  );
  const userTradesSnap = await getDocs(qUserTrades);
  const allUserTrades: CompetitionTrade[] = [];
  userTradesSnap.forEach((d) => {
    if (d.id !== projectionId) {
      allUserTrades.push(d.data() as CompetitionTrade);
    }
  });

  // Evaluate all active competition rules against candidate trade
  const ruleEvaluation = evaluateCompetitionRules(arena, userId, allUserTrades, projection);

  // 1. If candidate trade breaches a trade-level limit that rejects the candidate trade:
  if (ruleEvaluation.firstTradeRejectionViolation) {
    const rej = ruleEvaluation.firstTradeRejectionViolation;
    throw new Error(
      `TRADE_REJECTED: Trade violated competition rule "${rej.ruleName}". Allowed: ${rej.limitValue} ${rej.unit}, Actual: ${rej.actualValue} ${rej.unit}. Please adjust your trade parameters to submit.`
    );
  }

  // 2. If a catastrophic disqualifying rule violation was breached, atomic commit disqualification and reject trade
  if (!ruleEvaluation.isCompliant && ruleEvaluation.firstDisqualifyingViolation) {
    const dqViolation = ruleEvaluation.firstDisqualifyingViolation;
    const dqBatch = writeBatch(db);

    const updatedViolations = [dqViolation, ...(arena.violations || [])];
    const dqAuditEntry: AuditLog = {
      id: uuidv4(),
      timestamp: now,
      userId,
      userName: userDisplayName || member.displayName || 'Trader',
      action: 'DISQUALIFIED_RULE_VIOLATION',
      details: `Disqualified: ${dqViolation.ruleName} (Limit: ${dqViolation.limitValue} ${dqViolation.unit}, Actual: ${dqViolation.actualValue} ${dqViolation.unit})`,
      flagged: true
    };
    const dqActivityEntry: CompetitionActivity = {
      id: uuidv4(),
      timestamp: now,
      userId,
      userName: userDisplayName || member.displayName || 'Trader',
      type: 'dispute',
      message: `Disqualified from competition: breached ${dqViolation.ruleName} limit.`
    };

    dqBatch.update(arenaDocRef, cleanUndefined({
      [`members.${userId}.isDisqualified`]: true,
      [`members.${userId}.complianceStatus`]: 'DISQUALIFIED',
      [`members.${userId}.disqualifiedAt`]: now,
      [`members.${userId}.disqualificationReason`]: dqViolation.details || `Violated rule ${dqViolation.ruleName}`,
      [`members.${userId}.disqualifiedRuleId`]: dqViolation.ruleId,
      [`members.${userId}.disqualifiedRuleName`]: dqViolation.ruleName,
      [`members.${userId}.disqualifiedActualValue`]: dqViolation.actualValue,
      [`members.${userId}.disqualifiedLimitValue`]: dqViolation.limitValue,
      [`members.${userId}.firstViolationAt`]: member.firstViolationAt || now,
      [`members.${userId}.firstViolationRuleId`]: member.firstViolationRuleId || dqViolation.ruleId,
      [`members.${userId}.firstViolationType`]: member.firstViolationType || dqViolation.ruleType,
      [`members.${userId}.firstViolationValue`]: member.firstViolationValue || Number(dqViolation.actualValue) || 0,
      [`members.${userId}.firstViolationLimit`]: member.firstViolationLimit || Number(dqViolation.limitValue) || 0,
      violations: updatedViolations,
      auditTrail: [dqAuditEntry, ...(arena.auditTrail || [])].slice(0, 100),
      activities: [dqActivityEntry, ...(arena.activities || [])].slice(0, 50),
      updatedAt: now
    }));

    await dqBatch.commit();

    throw new Error(
      `COMPETITION_PARTICIPANT_DISQUALIFIED: Trade violated competition rule "${dqViolation.ruleName}". Allowed: ${dqViolation.limitValue} ${dqViolation.unit}, Actual: ${dqViolation.actualValue} ${dqViolation.unit}. You have been disqualified from logging trades in this competition.`
    );
  }

  // Include candidate trade in final stats
  allUserTrades.push(projection);
  const updatedStats = calculateParticipantStats(allUserTrades, 10000, arena.minTrades || 3);

  const updatedViolations = ruleEvaluation.warnings.length > 0
    ? [...ruleEvaluation.warnings, ...(arena.violations || [])].slice(0, 100)
    : (arena.violations || []);

  batch.update(arenaDocRef, cleanUndefined({
    [`members.${userId}.stats`]: updatedStats,
    [`members.${userId}.complianceStatus`]: ruleEvaluation.complianceStatus,
    violations: updatedViolations,
    auditTrail: newAuditTrail,
    activities: newActivities,
    updatedAt: now
  }));

  await batch.commit();
  return projection;
}

export interface UpdateCompetitionTradeInput {
  competitionId: string;
  tradeId: string;
  userId: string;
  userDisplayName?: string;
  userAvatar?: string;
  updates: {
    date?: number;
    time?: string;
    market?: string;
    direction?: Direction;
    entry?: number;
    exit?: number;
    stopLoss?: number;
    takeProfit?: number;
    positionSize?: number;
    riskAmount?: number;
    riskPercent?: number;
    result?: Result | 'PENDING';
    pnl?: number;
    rMultiple?: number;
    setupQuality?: 'A+' | 'B' | 'C';
    setupQualityReason?: string;
    strategy?: string;
    session?: string;
    timeframe?: string;
    screenshot?: string;
    entryScreenshot?: string;
    exitScreenshot?: string;
    sharedNotes?: string;
    ruleAdherence?: number;
    mistake?: string;
    learning?: string;
  };
  syncToPersonalJournal?: boolean;
  dashboardId?: string;
}

export async function updateCompetitionTrade(input: UpdateCompetitionTradeInput): Promise<CompetitionTrade> {
  const { competitionId, tradeId, userId, updates, syncToPersonalJournal, dashboardId } = input;
  const now = Date.now();

  const arenaDocRef = doc(db, 'arenas', competitionId);
  const arenaSnap = await getDoc(arenaDocRef);
  if (!arenaSnap.exists()) {
    throw new Error('Competition not found.');
  }

  const arena = arenaSnap.data() as Arena;
  if (arena.state === 'ARCHIVED' || arena.status === 'closed') {
    throw new Error('This competition is closed or archived. Trades cannot be edited.');
  }

  // Find the trade doc: either by tradeId directly or by ${competitionId}_${tradeId}
  let tradeDocRef = doc(db, 'arenas', competitionId, 'shared_trades', tradeId);
  let tradeSnap = await getDoc(tradeDocRef);
  if (!tradeSnap.exists()) {
    const projectionId = `${competitionId}_${tradeId}`;
    tradeDocRef = doc(db, 'arenas', competitionId, 'shared_trades', projectionId);
    tradeSnap = await getDoc(tradeDocRef);
  }

  if (!tradeSnap.exists()) {
    throw new Error('Trade not found in this competition.');
  }

  const currentTrade = tradeSnap.data() as CompetitionTrade;
  if (currentTrade.userId !== userId && arena.ownerId !== userId) {
    throw new Error('You can only edit your own trades.');
  }

  const member = arena.members[userId];
  if (member?.isDisqualified || member?.complianceStatus === 'DISQUALIFIED') {
    throw new Error(
      'DISQUALIFIED_PARTICIPANT_READ_ONLY: Prohibited modification. Disqualified participants have read-only access to historical trades.'
    );
  }

  // Recalculate R-multiple if needed
  let rMultiple = updates.rMultiple !== undefined ? updates.rMultiple : currentTrade.rMultiple;
  const effectiveRisk = updates.riskAmount !== undefined ? updates.riskAmount : currentTrade.riskAmount;
  const effectivePnl = updates.pnl !== undefined ? updates.pnl : currentTrade.pnl;
  if (updates.rMultiple === undefined && effectiveRisk && effectiveRisk > 0 && effectivePnl !== undefined) {
    rMultiple = Number((effectivePnl / effectiveRisk).toFixed(2));
  }

  const updatedProjection: CompetitionTrade = {
    ...currentTrade,
    updatedAt: now,
    editsCount: (currentTrade.editsCount || 0) + 1,
    date: updates.date !== undefined ? updates.date : currentTrade.date,
    time: updates.time !== undefined ? updates.time : currentTrade.time,
    market: updates.market !== undefined ? updates.market : currentTrade.market,
    direction: updates.direction !== undefined ? updates.direction : currentTrade.direction,
    result: updates.result !== undefined ? updates.result : currentTrade.result,
    entry: updates.entry !== undefined ? updates.entry : currentTrade.entry,
    exit: updates.exit !== undefined ? updates.exit : currentTrade.exit,
    stopLoss: updates.stopLoss !== undefined ? updates.stopLoss : currentTrade.stopLoss,
    takeProfit: updates.takeProfit !== undefined ? updates.takeProfit : currentTrade.takeProfit,
    positionSize: updates.positionSize !== undefined ? updates.positionSize : currentTrade.positionSize,
    riskAmount: updates.riskAmount !== undefined ? updates.riskAmount : currentTrade.riskAmount,
    riskPercent: updates.riskPercent !== undefined ? updates.riskPercent : currentTrade.riskPercent,
    pnl: updates.pnl !== undefined ? updates.pnl : currentTrade.pnl,
    rMultiple: rMultiple,
    strategy: updates.strategy !== undefined ? updates.strategy : currentTrade.strategy,
    session: updates.session !== undefined ? updates.session : currentTrade.session,
    timeframe: updates.timeframe !== undefined ? updates.timeframe : currentTrade.timeframe,
    ruleAdherence: updates.ruleAdherence !== undefined ? updates.ruleAdherence.toString() : currentTrade.ruleAdherence,
    sharedNotes: updates.sharedNotes !== undefined ? updates.sharedNotes : currentTrade.sharedNotes,
    screenshot: updates.screenshot !== undefined 
      ? updates.screenshot 
      : (updates.entryScreenshot !== undefined ? updates.entryScreenshot : currentTrade.screenshot),
    entryScreenshot: updates.entryScreenshot !== undefined ? updates.entryScreenshot : currentTrade.entryScreenshot,
    exitScreenshot: updates.exitScreenshot !== undefined ? updates.exitScreenshot : currentTrade.exitScreenshot,
    mistakes: updates.mistake !== undefined ? (updates.mistake ? [updates.mistake] : []) : currentTrade.mistakes
  };

  const batch = writeBatch(db);
  batch.set(tradeDocRef, updatedProjection);

  // Sync to personal journal if requested and dashboardId is provided
  const canonicalTradeId = currentTrade.personalTradeId || currentTrade.originalTradeId;
  if (syncToPersonalJournal && canonicalTradeId && dashboardId) {
    const personalTradeRef = doc(db, 'users', userId, 'dashboards', dashboardId, 'trades', canonicalTradeId);
    try {
      const personalSnap = await getDoc(personalTradeRef);
      if (personalSnap.exists()) {
        const personalData = personalSnap.data() as Trade;
        const updatedPersonalTrade: Trade = {
          ...personalData,
          date: updatedProjection.date || personalData.date,
          time: updatedProjection.time || personalData.time,
          market: (updatedProjection.market || personalData.market) as Market,
          direction: (updatedProjection.direction || personalData.direction) as Direction,
          entry: updatedProjection.entry !== undefined ? updatedProjection.entry : personalData.entry,
          exitPrice: updatedProjection.exit !== undefined ? updatedProjection.exit : personalData.exitPrice,
          stopLoss: updatedProjection.stopLoss !== undefined ? updatedProjection.stopLoss : personalData.stopLoss,
          takeProfit: updatedProjection.takeProfit !== undefined ? updatedProjection.takeProfit : personalData.takeProfit,
          positionSize: updatedProjection.positionSize !== undefined ? updatedProjection.positionSize : personalData.positionSize,
          risk: updatedProjection.riskAmount !== undefined ? updatedProjection.riskAmount : personalData.risk,
          riskPercent: updatedProjection.riskPercent !== undefined ? updatedProjection.riskPercent : personalData.riskPercent,
          result: updatedProjection.result as any,
          pnl: updatedProjection.pnl,
          rMultiple: updatedProjection.rMultiple,
          strategy: updatedProjection.strategy || personalData.strategy,
          session: (updatedProjection.session || personalData.session) as Session,
          timeframe: (updatedProjection.timeframe || personalData.timeframe) as Timeframe,
          notes: updatedProjection.sharedNotes || personalData.notes,
          mistake: updates.mistake !== undefined ? updates.mistake : personalData.mistake,
          learning: updates.learning !== undefined ? updates.learning : personalData.learning,
          screenshot: updatedProjection.screenshot !== undefined ? updatedProjection.screenshot : personalData.screenshot,
          entryScreenshot: updatedProjection.entryScreenshot !== undefined ? updatedProjection.entryScreenshot : personalData.entryScreenshot,
          exitScreenshot: updatedProjection.exitScreenshot !== undefined ? updatedProjection.exitScreenshot : personalData.exitScreenshot,
          screenshots: {
            before: updatedProjection.entryScreenshot !== undefined ? updatedProjection.entryScreenshot : personalData.screenshots?.before,
            after: updatedProjection.exitScreenshot !== undefined ? updatedProjection.exitScreenshot : personalData.screenshots?.after
          },
          ruleAdherence: updates.ruleAdherence !== undefined ? updates.ruleAdherence : personalData.ruleAdherence,
          updatedAt: now
        };
        batch.set(personalTradeRef, updatedPersonalTrade);
      }
    } catch (e) {
      console.warn('Could not sync update to personal trade:', e);
    }
  }

  // Audit log & activity
  const auditEntry: AuditLog = {
    id: uuidv4(),
    timestamp: now,
    userId,
    userName: member?.displayName || input.userDisplayName || 'Trader',
    action: 'EDITED_TRADE',
    details: `Updated ${updatedProjection.direction} ${updatedProjection.market} | Result: ${updatedProjection.result || 'Pending'} | P&L: ${updatedProjection.pnl !== undefined ? '$' + updatedProjection.pnl : 'N/A'} (Edit #${updatedProjection.editsCount})`,
    tradeId: currentTrade.id
  };

  const activityEntry: CompetitionActivity = {
    id: uuidv4(),
    timestamp: now,
    userId,
    userName: member?.displayName || input.userDisplayName || 'Trader',
    type: 'trade',
    message: `Updated trade on ${updatedProjection.market} (${updatedProjection.result || 'OPEN'}).`,
    metadata: {
      market: updatedProjection.market,
      result: updatedProjection.result,
      rMultiple: updatedProjection.rMultiple
    }
  };

  const newAuditTrail = [auditEntry, ...(arena.auditTrail || [])].slice(0, 100);
  const newActivities = [activityEntry, ...(arena.activities || [])].slice(0, 50);

  // Recalculate stats for this user
  const qUserTrades = query(
    collection(db, 'arenas', competitionId, 'shared_trades'),
    where('userId', '==', userId)
  );
  const userTradesSnap = await getDocs(qUserTrades);
  const allUserTrades: CompetitionTrade[] = [];
  userTradesSnap.forEach((d) => {
    if (d.id !== tradeDocRef.id) {
      allUserTrades.push(d.data() as CompetitionTrade);
    }
  });
  allUserTrades.push(updatedProjection);

  const updatedStats = calculateParticipantStats(allUserTrades, 10000, arena.minTrades || 3);

  batch.update(arenaDocRef, {
    [`members.${userId}.stats`]: updatedStats,
    auditTrail: newAuditTrail,
    activities: newActivities,
    updatedAt: now
  });

  await batch.commit();
  return updatedProjection;
}

export async function fetchCompetitionTrades(competitionId: string): Promise<CompetitionTrade[]> {
  const tradesRef = collection(db, 'arenas', competitionId, 'shared_trades');
  const snap = await getDocs(tradesRef);
  const trades: CompetitionTrade[] = [];
  snap.forEach((doc) => {
    trades.push({ ...(doc.data() as CompetitionTrade), id: doc.id });
  });
  return trades.sort((a, b) => (b.date || b.createdAt) - (a.date || a.createdAt));
}

export async function disputeCompetitionTrade(
  competitionId: string,
  tradeId: string,
  disputedByUserId: string,
  disputedByName: string,
  reason: string
) {
  const now = Date.now();
  const tradeRef = doc(db, 'arenas', competitionId, 'shared_trades', tradeId);
  const arenaRef = doc(db, 'arenas', competitionId);

  const arenaSnap = await getDoc(arenaRef);
  if (!arenaSnap.exists()) throw new Error('Competition not found');
  const arena = arenaSnap.data() as Arena;

  await updateDoc(tradeRef, cleanUndefined({
    status: 'Disputed',
    updatedAt: now
  }));

  const auditEntry: AuditLog = {
    id: uuidv4(),
    timestamp: now,
    userId: disputedByUserId,
    userName: disputedByName,
    action: 'DISPUTED_TRADE',
    details: `Trade flagged for review: ${reason}`,
    tradeId,
    flagged: true
  };

  const activityEntry: CompetitionActivity = {
    id: uuidv4(),
    timestamp: now,
    userId: disputedByUserId,
    userName: disputedByName,
    type: 'dispute',
    message: `Flagged a trade for review: "${reason}".`
  };

  await updateDoc(arenaRef, cleanUndefined({
    auditTrail: [auditEntry, ...(arena.auditTrail || [])].slice(0, 100),
    activities: [activityEntry, ...(arena.activities || [])].slice(0, 50),
    updatedAt: now
  }));
}

export async function createMiniChallenge(
  competitionId: string,
  challenge: Omit<MiniChallenge, 'id' | 'competitionId' | 'createdAt' | 'status'>
) {
  const arenaRef = doc(db, 'arenas', competitionId);
  const arenaSnap = await getDoc(arenaRef);
  if (!arenaSnap.exists()) throw new Error('Competition not found');
  const arena = arenaSnap.data() as Arena;

  const newChallenge: MiniChallenge = {
    ...challenge,
    id: uuidv4(),
    competitionId,
    status: 'active',
    createdAt: Date.now()
  };

  const updatedChallenges = [...(arena.challenges || []), newChallenge];
  const activity: CompetitionActivity = {
    id: uuidv4(),
    timestamp: Date.now(),
    userId: challenge.creatorId,
    userName: challenge.creatorName,
    type: 'challenge',
    message: `Launched new challenge: "${challenge.title}"!`
  };

  await updateDoc(arenaRef, cleanUndefined({
    challenges: updatedChallenges,
    activities: [activity, ...(arena.activities || [])].slice(0, 50),
    updatedAt: Date.now()
  }));

  return newChallenge;
}

export async function endCompetition(competitionId: string, ownerId: string): Promise<FinalCompetitionReport> {
  const arenaRef = doc(db, 'arenas', competitionId);
  const arenaSnap = await getDoc(arenaRef);
  if (!arenaSnap.exists()) throw new Error('Competition not found');
  const arena = arenaSnap.data() as Arena;

  if (arena.ownerId !== ownerId) {
    throw new Error('Only the competition creator can conclude this competition.');
  }

  // Calculate podium based on scoring mode
  const membersList = Object.values(arena.members).filter((m) => m.status === 'accepted');
  const sorted = [...membersList].sort((a, b) => {
    const statsA = a.stats || createInitialParticipantStats();
    const statsB = b.stats || createInitialParticipantStats();
    if (arena.scoringMode === 'P&L') return statsB.netPnl - statsA.netPnl;
    if (arena.scoringMode === 'Total R') return statsB.totalR - statsA.totalR;
    if (arena.scoringMode === 'Avg R') return statsB.avgR - statsA.avgR;
    if (arena.scoringMode === 'ROI') return statsB.roi - statsA.roi;
    if (arena.scoringMode === 'Discipline') return statsB.ruleAdherenceAvg - statsA.ruleAdherenceAvg;
    return (statsB.score || 0) - (statsA.score || 0);
  });

  const podium = sorted.slice(0, 3).map((m, idx) => ({
    rank: idx + 1,
    userId: m.userId,
    userName: m.displayName || 'Trader',
    score: m.stats?.score || 0,
    totalR: m.stats?.totalR || 0,
    pnl: m.stats?.netPnl || 0,
    winRate: m.stats?.winRate || 0,
    tradeCount: m.stats?.tradeCount || 0
  }));

  // Metric leaders
  const pnlLeader = [...membersList].sort((a, b) => (b.stats?.netPnl || 0) - (a.stats?.netPnl || 0))[0];
  const rLeader = [...membersList].sort((a, b) => (b.stats?.totalR || 0) - (a.stats?.totalR || 0))[0];
  const winRateLeader = [...membersList].sort((a, b) => (b.stats?.winRate || 0) - (a.stats?.winRate || 0))[0];
  const ddLeader = [...membersList].sort((a, b) => (a.stats?.maxDrawdown || 0) - (b.stats?.maxDrawdown || 0))[0];
  const disciplineLeader = [...membersList].sort((a, b) => (b.stats?.ruleAdherenceAvg || 0) - (a.stats?.ruleAdherenceAvg || 0))[0];

  const metricLeaders = [
    { metric: 'Highest P&L', leaderName: pnlLeader?.displayName || 'N/A', value: pnlLeader?.stats ? `$${pnlLeader.stats.netPnl.toLocaleString()}` : '$0' },
    { metric: 'Highest Total R', leaderName: rLeader?.displayName || 'N/A', value: rLeader?.stats ? `${rLeader.stats.totalR}R` : '0R' },
    { metric: 'Best Win Rate', leaderName: winRateLeader?.displayName || 'N/A', value: winRateLeader?.stats ? `${winRateLeader.stats.winRate}%` : '0%' },
    { metric: 'Lowest Drawdown', leaderName: ddLeader?.displayName || 'N/A', value: ddLeader?.stats ? `$${ddLeader.stats.maxDrawdown}` : '$0' },
    { metric: 'Best Discipline', leaderName: disciplineLeader?.displayName || 'N/A', value: disciplineLeader?.stats ? `${disciplineLeader.stats.ruleAdherenceAvg}%` : '100%' }
  ];

  const report: FinalCompetitionReport = {
    endedAt: Date.now(),
    podium,
    metricLeaders,
    whatDecided: `Rank 1 achieved by ${podium[0]?.userName || 'Leader'} through disciplined execution and superior R expectancy across ${podium[0]?.tradeCount || 0} trades.`
  };

  await updateDoc(arenaRef, cleanUndefined({
    state: 'ENDED',
    status: 'completed',
    finalReport: report,
    updatedAt: Date.now()
  }));

  return report;
}

export async function archiveCompetition(competitionId: string) {
  const arenaRef = doc(db, 'arenas', competitionId);
  await updateDoc(arenaRef, cleanUndefined({
    state: 'ARCHIVED',
    status: 'closed',
    updatedAt: Date.now()
  }));
}

export async function deleteCompetition(competitionId: string, userId?: string) {
  const currentUid = userId || auth.currentUser?.uid;
  const arenaRef = doc(db, 'arenas', competitionId);
  const arenaSnap = await getDoc(arenaRef);
  
  if (!arenaSnap.exists()) {
    return;
  }
  
  const arenaData = arenaSnap.data();
  if (currentUid && arenaData.ownerId && arenaData.ownerId !== currentUid) {
    throw new Error('Only the competition host can delete this arena');
  }

  // Clean up any shared trades subcollection
  try {
    const tradesRef = collection(db, 'arenas', competitionId, 'shared_trades');
    const tradesSnap = await getDocs(tradesRef);
    if (!tradesSnap.empty) {
      const batch = writeBatch(db);
      tradesSnap.docs.forEach((d) => {
        batch.delete(d.ref);
      });
      await batch.commit();
    }
  } catch (err) {
    console.warn('Non-fatal: could not clean up shared_trades subcollection:', err);
  }

  await deleteDoc(arenaRef);
}

export async function syncTradeToArenas(userId: string, trade: Trade, activeArenas?: Arena[]) {
  if (!activeArenas) {
    activeArenas = await getUserActiveArenas(userId);
  }
  if (activeArenas.length === 0) return;

  for (const arena of activeArenas) {
    if (arena.state !== 'LIVE' && arena.status !== 'active') continue;
    if (trade.date < arena.startDate || trade.date > arena.endDate) continue;

    // Check market / strategy restrictions
    if (arena.allowedMarkets && arena.allowedMarkets.length > 0 && !arena.allowedMarkets.includes(trade.market)) {
      continue;
    }

    try {
      await addCompetitionTrade({
        competitionId: arena.id,
        userId,
        userDisplayName: arena.members[userId]?.displayName,
        trade: {
          id: trade.id,
          date: trade.date,
          time: trade.time,
          market: trade.market,
          direction: trade.direction,
          entry: trade.entry,
          exit: trade.exitPrice,
          stopLoss: trade.stopLoss,
          takeProfit: trade.takeProfit,
          positionSize: trade.positionSize,
          riskAmount: trade.risk,
          riskPercent: trade.riskPercent,
          result: (trade.result || undefined) as any,
          pnl: trade.pnl,
          rMultiple: trade.rMultiple,
          strategy: trade.strategy,
          session: trade.session,
          timeframe: trade.timeframe,
          screenshot: trade.screenshot,
          sharedNotes: trade.notes,
          ruleAdherence: trade.ruleAdherence,
          mistake: trade.mistake,
          learning: trade.learning
        },
        addToPersonalJournal: false // already in personal journal
      });
    } catch (err) {
      console.warn(`Could not sync trade ${trade.id} to arena ${arena.id}:`, err);
    }
  }
}

export async function getUserActiveArenas(userId: string): Promise<Arena[]> {
  const q = query(collection(db, 'arenas'), where('memberIds', 'array-contains', userId));
  const snapshot = await getDocs(q);

  const arenas: Arena[] = [];
  snapshot.forEach((doc) => {
    const data = { ...(doc.data() as Arena), id: doc.id };
    if (data.members && data.members[userId] && data.members[userId].status === 'accepted') {
      arenas.push(data);
    }
  });

  return arenas;
}

export async function createCompetitionRule(
  competitionId: string,
  ruleData: Omit<CompetitionRule, 'id' | 'competitionId' | 'createdAt' | 'updatedAt' | 'version' | 'history' | 'createdBy' | 'createdByName'>,
  user: { uid: string; displayName?: string | null }
): Promise<CompetitionRule> {
  const arenaRef = doc(db, 'arenas', competitionId);
  const snap = await getDoc(arenaRef);
  if (!snap.exists()) throw new Error('Competition not found');
  const arena = snap.data() as Arena;

  if (arena.ownerId !== user.uid) {
    throw new Error('Only the competition creator can add rules.');
  }

  const now = Date.now();
  const newVersion = (arena.rulesVersion || 1) + 1;
  const newRule: CompetitionRule = {
    ...ruleData,
    id: uuidv4(),
    competitionId,
    version: 1,
    createdAt: now,
    updatedAt: now,
    createdBy: user.uid,
    createdByName: user.displayName || 'Host',
    history: []
  };

  const updatedRules = [...(arena.rules || []), newRule];
  const auditEntry: AuditLog = {
    id: uuidv4(),
    timestamp: now,
    userId: user.uid,
    userName: user.displayName || 'Host',
    action: 'CREATED_RULE',
    details: `Created rule: ${newRule.name} (${newRule.type}: Limit ${typeof newRule.limitValue === 'object' ? JSON.stringify(newRule.limitValue) : newRule.limitValue} ${newRule.unit}, Severity: ${newRule.severity})`
  };

  await updateDoc(arenaRef, cleanUndefined({
    rules: updatedRules,
    rulesVersion: newVersion,
    auditTrail: [auditEntry, ...(arena.auditTrail || [])].slice(0, 100),
    updatedAt: now
  }));

  return newRule;
}

export async function updateCompetitionRule(
  competitionId: string,
  ruleId: string,
  updates: Partial<CompetitionRule>,
  reason: string,
  user: { uid: string; displayName?: string | null }
): Promise<CompetitionRule> {
  const arenaRef = doc(db, 'arenas', competitionId);
  const snap = await getDoc(arenaRef);
  if (!snap.exists()) throw new Error('Competition not found');
  const arena = snap.data() as Arena;

  if (arena.ownerId !== user.uid) {
    throw new Error('Only the competition creator can modify rules.');
  }

  const existingRules = arena.rules || [];
  const ruleIdx = existingRules.findIndex((r) => r.id === ruleId);
  if (ruleIdx === -1) throw new Error('Rule not found in competition');

  const currentRule = existingRules[ruleIdx];
  const now = Date.now();
  const nextVersion = (currentRule.version || 1) + 1;

  const historyEntry: RuleHistoryEntry = {
    version: currentRule.version,
    changedBy: user.uid,
    changedByName: user.displayName || 'Host',
    timestamp: now,
    oldLimit: currentRule.limitValue,
    newLimit: updates.limitValue !== undefined ? updates.limitValue : currentRule.limitValue,
    oldSeverity: currentRule.severity,
    newSeverity: updates.severity !== undefined ? updates.severity : currentRule.severity,
    changeSummary: reason || 'Updated rule parameters'
  };

  const updatedRule: CompetitionRule = {
    ...currentRule,
    ...updates,
    version: nextVersion,
    updatedAt: now,
    history: [historyEntry, ...(currentRule.history || [])]
  };

  const updatedRules = [...existingRules];
  updatedRules[ruleIdx] = updatedRule;

  const auditEntry: AuditLog = {
    id: uuidv4(),
    timestamp: now,
    userId: user.uid,
    userName: user.displayName || 'Host',
    action: 'UPDATED_RULE',
    details: `Updated rule ${currentRule.name}: v${currentRule.version} -> v${nextVersion}. ${reason ? `Reason: ${reason}` : ''}`
  };

  await updateDoc(arenaRef, cleanUndefined({
    rules: updatedRules,
    rulesVersion: (arena.rulesVersion || 1) + 1,
    auditTrail: [auditEntry, ...(arena.auditTrail || [])].slice(0, 100),
    updatedAt: now
  }));

  return updatedRule;
}

export async function toggleCompetitionRule(
  competitionId: string,
  ruleId: string,
  isActive: boolean,
  user: { uid: string; displayName?: string | null }
) {
  const arenaRef = doc(db, 'arenas', competitionId);
  const snap = await getDoc(arenaRef);
  if (!snap.exists()) throw new Error('Competition not found');
  const arena = snap.data() as Arena;

  if (arena.ownerId !== user.uid) {
    throw new Error('Only the competition creator can toggle rules.');
  }

  const existingRules = arena.rules || [];
  const ruleIdx = existingRules.findIndex((r) => r.id === ruleId);
  if (ruleIdx === -1) throw new Error('Rule not found');

  const currentRule = existingRules[ruleIdx];
  const now = Date.now();

  const updatedRule: CompetitionRule = {
    ...currentRule,
    isActive,
    updatedAt: now
  };

  const updatedRules = [...existingRules];
  updatedRules[ruleIdx] = updatedRule;

  const auditEntry: AuditLog = {
    id: uuidv4(),
    timestamp: now,
    userId: user.uid,
    userName: user.displayName || 'Host',
    action: isActive ? 'ENABLED_RULE' : 'DISABLED_RULE',
    details: `${isActive ? 'Enabled' : 'Disabled'} rule "${currentRule.name}"`
  };

  await updateDoc(arenaRef, cleanUndefined({
    rules: updatedRules,
    auditTrail: [auditEntry, ...(arena.auditTrail || [])].slice(0, 100),
    updatedAt: now
  }));
}

export async function deleteCompetitionRule(
  competitionId: string,
  ruleId: string,
  user: { uid: string; displayName?: string | null }
) {
  const arenaRef = doc(db, 'arenas', competitionId);
  const snap = await getDoc(arenaRef);
  if (!snap.exists()) throw new Error('Competition not found');
  const arena = snap.data() as Arena;

  if (arena.ownerId !== user.uid) {
    throw new Error('Only the competition creator can delete rules.');
  }

  const ruleToDelete = (arena.rules || []).find((r) => r.id === ruleId);
  const updatedRules = (arena.rules || []).filter((r) => r.id !== ruleId);
  const now = Date.now();

  const auditEntry: AuditLog = {
    id: uuidv4(),
    timestamp: now,
    userId: user.uid,
    userName: user.displayName || 'Host',
    action: 'DELETED_RULE',
    details: `Removed rule "${ruleToDelete?.name || ruleId}"`
  };

  await updateDoc(arenaRef, cleanUndefined({
    rules: updatedRules,
    auditTrail: [auditEntry, ...(arena.auditTrail || [])].slice(0, 100),
    updatedAt: now
  }));
}

export async function initializeDefaultCompetitionRules(
  competitionId: string,
  user: { uid: string; displayName?: string | null }
): Promise<CompetitionRule[]> {
  const arenaRef = doc(db, 'arenas', competitionId);
  const snap = await getDoc(arenaRef);
  if (!snap.exists()) throw new Error('Competition not found');
  const arena = snap.data() as Arena;

  if (arena.rules && arena.rules.length > 0) {
    return arena.rules;
  }

  const defaultRules = generateDefaultCompetitionRules(competitionId, user.uid);
  const now = Date.now();

  const auditEntry: AuditLog = {
    id: uuidv4(),
    timestamp: now,
    userId: user.uid,
    userName: user.displayName || 'Host',
    action: 'INITIALIZED_RULES',
    details: `Initialized standard competition rules and governance framework.`
  };

  await updateDoc(arenaRef, cleanUndefined({
    rules: defaultRules,
    rulesVersion: 1,
    rulesSnapshot: defaultRules,
    auditTrail: [auditEntry, ...(arena.auditTrail || [])].slice(0, 100),
    updatedAt: now
  }));

  return defaultRules;
}

export async function overrideParticipantDisqualification(
  competitionId: string,
  targetUserId: string,
  reason: string,
  reviewer: { uid: string; displayName?: string | null }
) {
  const arenaRef = doc(db, 'arenas', competitionId);
  const snap = await getDoc(arenaRef);
  if (!snap.exists()) throw new Error('Competition not found');
  const arena = snap.data() as Arena;

  const member = arena.members[targetUserId];
  if (!member) throw new Error('Participant not found');

  const isTradeRiskError =
    member.disqualifiedRuleName === 'Maximum Risk Per Trade' ||
    member.disqualificationReason?.includes('Maximum Risk Per Trade');

  if (arena.ownerId !== reviewer.uid && !isTradeRiskError) {
    throw new Error('Only the competition creator can override disqualifications.');
  }

  const now = Date.now();
  const auditEntry: AuditLog = {
    id: uuidv4(),
    timestamp: now,
    userId: reviewer.uid,
    userName: reviewer.displayName || 'Host',
    action: 'ADMIN_OVERRIDE_DISQUALIFICATION',
    details: `Reinstated participant ${member.displayName || targetUserId} from disqualification. Reason: ${reason || 'Approved review'}`
  };

  await updateDoc(arenaRef, cleanUndefined({
    [`members.${targetUserId}.isDisqualified`]: false,
    [`members.${targetUserId}.complianceStatus`]: 'ACTIVE',
    [`members.${targetUserId}.disqualificationReason`]: undefined,
    auditTrail: [auditEntry, ...(arena.auditTrail || [])].slice(0, 100),
    updatedAt: now
  }));
}

