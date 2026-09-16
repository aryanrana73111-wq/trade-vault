import React, { useState, useMemo } from 'react';
import {
  Arena,
  ArenaMember,
  CompetitionRule,
  CompetitionRuleType,
  RuleSeverity,
  RuleEnforcement,
  CompetitionViolation
} from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import {
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertOctagon,
  AlertTriangle,
  Lock,
  Unlock,
  Plus,
  Pencil,
  Trash2,
  History,
  CheckCircle2,
  XCircle,
  Info,
  Clock,
  Search,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  X,
  UserCheck,
  SlidersHorizontal,
  Flame,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Input';
import { format } from 'date-fns';
import {
  createCompetitionRule,
  updateCompetitionRule,
  toggleCompetitionRule,
  deleteCompetitionRule,
  initializeDefaultCompetitionRules,
  overrideParticipantDisqualification
} from '@/lib/arenaService';

interface CompetitionRulesViewProps {
  arena: Arena;
  onRefresh?: () => void;
}

export function CompetitionRulesView({ arena, onRefresh }: CompetitionRulesViewProps) {
  const { user } = useAuth();
  const isHost = user && arena.ownerId === user.uid;

  // View tabs
  const [subTab, setSubTab] = useState<'rules' | 'participants' | 'violations'>('rules');

  // Rule management modals
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<CompetitionRule | null>(null);
  const [editReason, setEditReason] = useState('');
  const [historyRule, setHistoryRule] = useState<CompetitionRule | null>(null);
  const [reinstatingMember, setReinstatingMember] = useState<ArenaMember | null>(null);
  const [reinstateReason, setReinstateReason] = useState('');

  // Status & search filters
  const [violationSearch, setViolationSearch] = useState('');
  const [violationSeverityFilter, setViolationSeverityFilter] = useState<'ALL' | 'DISQUALIFY' | 'WARNING'>('ALL');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Current user participant state
  const currentMember = user ? arena.members?.[user.uid] : null;
  const isCurrentUserDisqualified = currentMember?.isDisqualified || currentMember?.complianceStatus === 'DISQUALIFIED';

  const rules = arena.rules || [];
  const violations = arena.violations || [];
  const membersList = Object.values(arena.members || {});

  // Form State for Add / Edit Rule
  const [ruleForm, setRuleForm] = useState<{
    name: string;
    description: string;
    type: CompetitionRuleType;
    limitValue: string;
    unit: string;
    severity: RuleSeverity;
    enforcement: RuleEnforcement;
    isActive: boolean;
  }>({
    name: '',
    description: '',
    type: 'MAX_DRAWDOWN',
    limitValue: '10',
    unit: '%',
    severity: 'DISQUALIFY',
    enforcement: 'INSTANT_DISQUALIFY',
    isActive: true
  });

  const resetRuleForm = () => {
    setRuleForm({
      name: '',
      description: '',
      type: 'MAX_DRAWDOWN',
      limitValue: '10',
      unit: '%',
      severity: 'DISQUALIFY',
      enforcement: 'INSTANT_DISQUALIFY',
      isActive: true
    });
    setEditingRule(null);
    setEditReason('');
    setActionError(null);
  };

  const handleOpenEdit = (rule: CompetitionRule) => {
    setEditingRule(rule);
    setRuleForm({
      name: rule.name,
      description: rule.description || '',
      type: rule.type,
      limitValue: typeof rule.limitValue === 'object' ? JSON.stringify(rule.limitValue) : String(rule.limitValue),
      unit: rule.unit,
      severity: rule.severity,
      enforcement: rule.enforcement,
      isActive: rule.isActive
    });
    setEditReason('');
    setIsAddRuleOpen(true);
  };

  const handleRuleTypeSelect = (type: CompetitionRuleType) => {
    let defaultUnit = '%';
    let defaultLimit = '10';
    let defaultName = 'Max Drawdown Ceiling';
    let defaultDesc = 'Limits maximum cumulative drawdown from high-water mark.';
    let defaultSeverity: RuleSeverity = 'DISQUALIFY';

    if (type === 'MAX_DAILY_LOSS') {
      defaultUnit = '%';
      defaultLimit = '5';
      defaultName = 'Max Daily Loss Limit';
      defaultDesc = 'Limits maximum realized loss in any calendar day.';
    } else if (type === 'MAX_RISK_PER_TRADE') {
      defaultUnit = '%';
      defaultLimit = '2';
      defaultName = 'Max Risk Per Trade';
      defaultDesc = 'Limits individual trade risk percentage.';
    } else if (type === 'MIN_HOLDING_TIME_SECONDS') {
      defaultUnit = 'seconds';
      defaultLimit = '60';
      defaultName = 'Minimum Holding Duration';
      defaultDesc = 'Prohibits ultra-high-frequency tick scalping.';
      defaultSeverity = 'WARNING';
    } else if (type === 'MAX_OPEN_POSITIONS') {
      defaultUnit = 'positions';
      defaultLimit = '3';
      defaultName = 'Maximum Simultaneous Open Trades';
      defaultDesc = 'Prevents overleveraging across concurrent positions.';
    } else if (type === 'MANDATORY_STOP_LOSS') {
      defaultUnit = 'boolean';
      defaultLimit = 'true';
      defaultName = 'Mandatory Stop Loss';
      defaultDesc = 'Requires every submitted trade to have a defined protective stop loss.';
    } else if (type === 'MAX_DAILY_TRADES') {
      defaultUnit = 'trades';
      defaultLimit = '10';
      defaultName = 'Max Daily Trades Limit';
      defaultDesc = 'Prevents revenge trading by capping daily executions.';
      defaultSeverity = 'WARNING';
    } else if (type === 'PROHIBITED_INSTRUMENTS') {
      defaultUnit = 'list';
      defaultLimit = 'CRYPTO, HIGH_VOLATILITY';
      defaultName = 'Prohibited Instruments';
      defaultDesc = 'Trades on these restricted symbols will be flagged or rejected.';
    }

    setRuleForm(prev => ({
      ...prev,
      type,
      name: defaultName,
      description: defaultDesc,
      limitValue: defaultLimit,
      unit: defaultUnit,
      severity: defaultSeverity
    }));
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isHost) return;

    setIsProcessing(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      let parsedLimit: any = ruleForm.limitValue.trim();
      if (!isNaN(Number(parsedLimit))) {
        parsedLimit = Number(parsedLimit);
      } else if (parsedLimit.toLowerCase() === 'true') {
        parsedLimit = true;
      } else if (parsedLimit.toLowerCase() === 'false') {
        parsedLimit = false;
      } else if (parsedLimit.includes(',')) {
        parsedLimit = parsedLimit.split(',').map((s: string) => s.trim());
      }

      if (editingRule) {
        if (!editReason.trim()) {
          throw new Error('Please provide a reason for modifying this active competition rule.');
        }

        await updateCompetitionRule(
          arena.id,
          editingRule.id,
          {
            name: ruleForm.name.trim(),
            description: ruleForm.description.trim(),
            limitValue: parsedLimit,
            unit: ruleForm.unit.trim(),
            severity: ruleForm.severity,
            enforcement: ruleForm.enforcement,
            isActive: ruleForm.isActive
          },
          editReason.trim(),
          { uid: user.uid, displayName: user.displayName }
        );
        setActionSuccess(`Rule "${ruleForm.name}" updated to version ${(editingRule.version || 1) + 1}.`);
      } else {
        await createCompetitionRule(
          arena.id,
          {
            name: ruleForm.name.trim(),
            description: ruleForm.description.trim(),
            type: ruleForm.type,
            limitValue: parsedLimit,
            unit: ruleForm.unit.trim(),
            severity: ruleForm.severity,
            enforcement: ruleForm.enforcement,
            isActive: ruleForm.isActive
          },
          { uid: user.uid, displayName: user.displayName }
        );
        setActionSuccess(`Rule "${ruleForm.name}" added successfully.`);
      }

      setIsAddRuleOpen(false);
      resetRuleForm();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setActionError(err.message || 'Failed to save competition rule.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleActive = async (rule: CompetitionRule) => {
    if (!user || !isHost) return;
    setIsProcessing(true);
    setActionError(null);
    try {
      await toggleCompetitionRule(arena.id, rule.id, !rule.isActive, {
        uid: user.uid,
        displayName: user.displayName
      });
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setActionError(err.message || 'Failed to toggle rule status.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!user || !isHost) return;
    if (!confirm('Are you sure you want to remove this rule from the competition?')) return;

    setIsProcessing(true);
    setActionError(null);
    try {
      await deleteCompetitionRule(arena.id, ruleId, {
        uid: user.uid,
        displayName: user.displayName
      });
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete rule.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInitializeDefaults = async () => {
    if (!user || !isHost) return;
    setIsProcessing(true);
    setActionError(null);
    try {
      await initializeDefaultCompetitionRules(arena.id, {
        uid: user.uid,
        displayName: user.displayName
      });
      setActionSuccess('Standard competition governance rules initialized.');
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setActionError(err.message || 'Failed to initialize default rules.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReinstate = async () => {
    if (!user || !isHost || !reinstatingMember) return;
    setIsProcessing(true);
    setActionError(null);
    try {
      await overrideParticipantDisqualification(
        arena.id,
        reinstatingMember.userId,
        reinstateReason.trim() || 'Approved host review',
        { uid: user.uid, displayName: user.displayName }
      );
      setActionSuccess(`Participant ${reinstatingMember.displayName || 'Trader'} has been reinstated to active standing.`);
      setReinstatingMember(null);
      setReinstateReason('');
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setActionError(err.message || 'Failed to reinstate participant.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Filtered violations
  const filteredViolations = useMemo(() => {
    return violations.filter(v => {
      if (violationSeverityFilter !== 'ALL' && v.severity !== violationSeverityFilter) return false;
      if (violationSearch.trim()) {
        const q = violationSearch.toLowerCase();
        const matchTrader = (v.userDisplayName || v.userName || '').toLowerCase().includes(q);
        const matchRule = v.ruleName?.toLowerCase().includes(q);
        const matchDetails = v.details?.toLowerCase().includes(q);
        if (!matchTrader && !matchRule && !matchDetails) return false;
      }
      return true;
    });
  }, [violations, violationSeverityFilter, violationSearch]);

  return (
    <div className="space-y-6">
      {/* Current User Disqualification Alert Banner */}
      {isCurrentUserDisqualified && (
        <div className="p-4 sm:p-5 rounded-2xl bg-red-500/10 border-2 border-red-500/40 text-red-700 dark:text-red-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded-md">
                  DISQUALIFIED & TRADING LOCKED
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {currentMember?.disqualifiedAt ? format(new Date(currentMember.disqualifiedAt), 'MMM d, HH:mm') : ''}
                </span>
              </div>
              <h4 className="font-bold text-sm sm:text-base text-red-950 dark:text-red-200 mt-1">
                Breach of Rule: {currentMember?.disqualifiedRuleName || 'Risk Limit Violation'}
              </h4>
              <p className="text-xs text-red-800 dark:text-red-300/90 mt-0.5 leading-relaxed">
                {currentMember?.disqualificationReason || 'You exceeded the strict competition limits. In accordance with fair-play rules, further trade submissions are locked.'}
              </p>
              <p className="text-[11px] text-red-600 dark:text-red-400 mt-1 font-medium">
                Your past trade records remain preserved in read-only mode for audit transparency. If you believe this was triggered in error, contact the host to request an appeal review.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header Overview Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold flex-shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
              Competition Governance & Rule Engine
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
              Rules v{arena.rulesVersion || 1}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {rules.filter(r => r.isActive).length} Active Rules
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-3xl">
            Rules are evaluated authoritatively on every trade submission. Strict disqualification rules lock trading accounts upon limit breach, preventing asymmetric risk taking and protecting leaderboard integrity.
          </p>
        </div>

        {/* Host Controls */}
        <div className="flex items-center gap-2.5 flex-wrap flex-shrink-0">
          {isHost && (
            <>
              {rules.length === 0 ? (
                <Button
                  size="sm"
                  onClick={handleInitializeDefaults}
                  disabled={isProcessing}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                  Initialize Standard Rules
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => {
                    resetRuleForm();
                    setIsAddRuleOpen(true);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Rule
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Notifications */}
      {actionError && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-red-400 hover:text-red-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {actionSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-400 hover:text-emerald-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setSubTab('rules')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            subTab === 'rules'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Active Rules ({rules.length})</span>
        </button>

        <button
          onClick={() => setSubTab('participants')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            subTab === 'participants'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Participant Compliance ({membersList.length})</span>
        </button>

        <button
          onClick={() => setSubTab('violations')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            subTab === 'violations'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>Violations Ledger ({violations.length})</span>
        </button>
      </div>

      {/* TAB 1: RULES MATRIX */}
      {subTab === 'rules' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rules.map((rule) => {
              const isDisqualifying = rule.severity === 'DISQUALIFY';
              const displayLimit = typeof rule.limitValue === 'object'
                ? JSON.stringify(rule.limitValue)
                : `${rule.limitValue} ${rule.unit}`;

              return (
                <div
                  key={rule.id}
                  className={`rounded-2xl border p-4 sm:p-5 flex flex-col justify-between transition-all ${
                    rule.isActive
                      ? isDisqualifying
                        ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs hover:border-red-300 dark:hover:border-red-800'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-300 dark:hover:border-amber-800'
                      : 'bg-slate-50/70 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-800/60 opacity-65'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          isDisqualifying
                            ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                        }`}>
                          {rule.severity}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          v{rule.version || 1}
                        </span>
                        {!rule.isActive && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-500">
                            Inactive
                          </span>
                        )}
                      </div>

                      {rule.history && rule.history.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setHistoryRule(rule)}
                          className="text-[11px] text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 flex items-center gap-1 font-semibold"
                          title="View Version Changelog"
                        >
                          <History className="w-3.5 h-3.5" />
                          <span>History ({rule.history.length})</span>
                        </button>
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                        {rule.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {rule.description || 'Threshold governing fair participation.'}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-baseline justify-between gap-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Enforced Limit</span>
                      <span className="font-mono font-black text-sm text-slate-900 dark:text-slate-100">
                        {displayLimit}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 space-y-0.5">
                      <div className="flex justify-between">
                        <span>Enforcement:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {rule.enforcement === 'INSTANT_DISQUALIFY' ? 'Instant Disqualification' :
                           rule.enforcement === 'STRICT_REJECT' ? 'Strict Reject Trade' : 'Audit Flag Only'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Scope:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {rule.type.includes('TRADE') ? 'Per-Trade Check' : 'Account-Wide State'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Host Actions Toolbar */}
                  {isHost && (
                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(rule)}
                        disabled={isProcessing}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 ${
                          rule.isActive
                            ? 'text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                            : 'text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                        }`}
                      >
                        {rule.isActive ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        <span>{rule.isActive ? 'Disable' : 'Enable'}</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(rule)}
                          disabled={isProcessing}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors"
                          title="Edit Rule"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRule(rule.id)}
                          disabled={isProcessing}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                          title="Delete Rule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {rules.length === 0 && (
              <div className="col-span-full p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <Scale className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  No Active Governance Rules Defined
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Initialize the standard competition governance package (Drawdown caps, Daily loss ceiling, Risk-per-trade limits, Minimum holding time) to ensure fair play.
                </p>
                {isHost && (
                  <Button
                    onClick={handleInitializeDefaults}
                    disabled={isProcessing}
                    className="bg-indigo-600 text-white text-xs"
                  >
                    Initialize Default Rules
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PARTICIPANT COMPLIANCE ROSTER */}
      {subTab === 'participants' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                Participant Standing & Integrity Roster
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live compliance status, warning counters, and disqualification locks across all traders
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              {membersList.length} Traders
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {membersList.map((member) => {
              const isDisqualified = member.isDisqualified || member.complianceStatus === 'DISQUALIFIED';
              const isWarning = !isDisqualified && member.complianceStatus === 'WARNING';
              const isCurrent = user && member.userId === user.uid;

              return (
                <div
                  key={member.userId}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    isDisqualified
                      ? 'bg-red-50/40 dark:bg-red-950/20'
                      : isWarning
                      ? 'bg-amber-50/30 dark:bg-amber-950/10'
                      : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {member.photoURL ? (
                      <img
                        src={member.photoURL}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {(member.displayName || 'T').substring(0, 2).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                          {member.displayName || 'Trader'}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold">
                            YOU
                          </span>
                        )}
                        {member.role === 'owner' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                            HOST
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                        <span>Trades: <strong>{member.stats?.tradeCount || 0}</strong></span>
                        <span>•</span>
                        <span>Total R: <strong>{(member.stats?.totalR || 0) > 0 ? `+${member.stats?.totalR}R` : `${member.stats?.totalR || 0}R`}</strong></span>
                        <span>•</span>
                        <span>Max DD: <strong>${member.stats?.maxDrawdown || 0}</strong></span>
                      </div>

                      {isDisqualified && (
                        <div className="mt-2 p-2.5 rounded-xl bg-red-100/70 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-xs text-red-800 dark:text-red-300 space-y-0.5">
                          <div className="font-bold flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                            <span>DISQUALIFIED: {member.disqualifiedRuleName || 'Rule Violation'}</span>
                          </div>
                          <p className="text-[11px] text-red-700 dark:text-red-400">
                            {member.disqualificationReason}
                          </p>
                          {member.disqualifiedAt && (
                            <span className="text-[10px] text-red-500 block">
                              Recorded on {format(new Date(member.disqualifiedAt), 'MMM d, yyyy HH:mm')}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Standing Badge & Host Actions */}
                  <div className="flex items-center gap-3 justify-between sm:justify-end flex-shrink-0">
                    <div className="text-right">
                      {isDisqualified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                          <Lock className="w-3 h-3" />
                          Disqualified
                        </span>
                      ) : isWarning ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
                          <AlertTriangle className="w-3 h-3" />
                          Warning Issued
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
                          <ShieldCheck className="w-3 h-3" />
                          Compliant
                        </span>
                      )}
                    </div>

                    {isHost && isDisqualified && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setReinstatingMember(member);
                          setReinstateReason('');
                        }}
                        className="text-xs text-indigo-600 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                      >
                        Reinstate
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: VIOLATIONS AUDIT LEDGER */}
      {subTab === 'violations' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs space-y-4 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                Rule Violations & Enforcement Ledger
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Permanent fair-play evaluation history generated automatically on trade entry
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search violations..."
                  value={violationSearch}
                  onChange={(e) => setViolationSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs w-48 text-slate-900 dark:text-slate-100"
                />
              </div>

              <select
                value={violationSeverityFilter}
                onChange={(e) => setViolationSeverityFilter(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
              >
                <option value="ALL">All Severities</option>
                <option value="DISQUALIFY">Disqualifying Only</option>
                <option value="WARNING">Warnings Only</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold whitespace-nowrap">
                  <th className="pb-3 pr-3">Timestamp</th>
                  <th className="pb-3 pr-3">Trader</th>
                  <th className="pb-3 pr-3">Rule Breached</th>
                  <th className="pb-3 pr-3 text-center">Severity</th>
                  <th className="pb-3 pr-3 text-right">Allowed Limit</th>
                  <th className="pb-3 pr-3 text-right">Actual Value</th>
                  <th className="pb-3">Enforcement Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredViolations.map((v) => {
                  const dateStr = format(new Date(v.timestamp), 'MMM d, yyyy HH:mm');
                  const isDq = v.severity === 'DISQUALIFY';

                  return (
                    <tr key={v.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 pr-3 font-medium text-slate-500 whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="py-3 pr-3 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {v.userDisplayName || v.userName || 'Trader'}
                      </td>
                      <td className="py-3 pr-3 font-semibold whitespace-nowrap">
                        {v.ruleName}
                      </td>
                      <td className="py-3 pr-3 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          isDq
                            ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                        }`}>
                          {v.severity}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-right font-mono font-bold whitespace-nowrap">
                        {v.limitValue} {v.unit}
                      </td>
                      <td className={`py-3 pr-3 text-right font-mono font-bold whitespace-nowrap ${
                        isDq ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        {v.actualValue} {v.unit}
                      </td>
                      <td className="py-3 text-slate-600 dark:text-slate-400">
                        {v.actionTaken === 'PARTICIPANT_DISQUALIFIED' || v.actionTaken === 'DISQUALIFY' ? (
                          <span className="font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Account Disqualified & Locked
                          </span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Warning Logged
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredViolations.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No rule violations recorded. All participants are within permissible risk thresholds!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT RULE MODAL */}
      {isAddRuleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <Scale className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  {editingRule ? `Edit Rule: ${editingRule.name}` : 'Add Competition Rule'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddRuleOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="space-y-4 text-xs">
              {!editingRule && (
                <div>
                  <Label className="text-xs font-semibold mb-1 block">Rule Type</Label>
                  <select
                    value={ruleForm.type}
                    onChange={(e) => handleRuleTypeSelect(e.target.value as CompetitionRuleType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
                  >
                    <option value="MAX_DRAWDOWN">Max Drawdown Ceiling (%)</option>
                    <option value="MAX_DAILY_LOSS">Max Daily Realized Loss (%)</option>
                    <option value="MAX_RISK_PER_TRADE">Max Risk Per Trade (%)</option>
                    <option value="MIN_HOLDING_TIME_SECONDS">Minimum Holding Duration (Seconds)</option>
                    <option value="MAX_OPEN_POSITIONS">Max Simultaneous Open Trades</option>
                    <option value="MANDATORY_STOP_LOSS">Mandatory Protective Stop Loss</option>
                    <option value="MAX_DAILY_TRADES">Max Daily Executions Limit</option>
                    <option value="PROHIBITED_INSTRUMENTS">Restricted Instruments List</option>
                  </select>
                </div>
              )}

              <div>
                <Label className="text-xs font-semibold mb-1 block">Rule Display Name</Label>
                <Input
                  value={ruleForm.name}
                  onChange={(e) => setRuleForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="e.g. Max Cumulative Drawdown"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold mb-1 block">Rule Description / Guidance</Label>
                <textarea
                  value={ruleForm.description}
                  onChange={(e) => setRuleForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  placeholder="Explain the operational boundaries of this rule..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold mb-1 block">Limit Value</Label>
                  <Input
                    value={ruleForm.limitValue}
                    onChange={(e) => setRuleForm(prev => ({ ...prev, limitValue: e.target.value }))}
                    required
                    placeholder="e.g. 10"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold mb-1 block">Unit</Label>
                  <Input
                    value={ruleForm.unit}
                    onChange={(e) => setRuleForm(prev => ({ ...prev, unit: e.target.value }))}
                    required
                    placeholder="%, $, trades, seconds"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold mb-1 block">Severity</Label>
                  <select
                    value={ruleForm.severity}
                    onChange={(e) => {
                      const sev = e.target.value as RuleSeverity;
                      setRuleForm(prev => ({
                        ...prev,
                        severity: sev,
                        enforcement: sev === 'DISQUALIFY' ? 'INSTANT_DISQUALIFY' : 'AUDIT_LOG_FLAG'
                      }));
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  >
                    <option value="DISQUALIFY">Disqualify Participant</option>
                    <option value="WARNING">Warning Flag Only</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs font-semibold mb-1 block">Enforcement Mode</Label>
                  <select
                    value={ruleForm.enforcement}
                    onChange={(e) => setRuleForm(prev => ({ ...prev, enforcement: e.target.value as RuleEnforcement }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  >
                    <option value="INSTANT_DISQUALIFY">Instant Disqualification & Lock</option>
                    <option value="STRICT_REJECT">Strict Reject Trade (Keep Active)</option>
                    <option value="AUDIT_LOG_FLAG">Audit Log Flag</option>
                  </select>
                </div>
              </div>

              {editingRule && (
                <div>
                  <Label className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1 block">
                    Change Reason / Audit Note (Required for Fair-Play Trail)
                  </Label>
                  <Input
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    required
                    placeholder="e.g. Adjusted drawdown limit following group consensus"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddRuleOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isProcessing}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {isProcessing ? 'Saving...' : (editingRule ? 'Save & Update Version' : 'Create Rule')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RULE HISTORY MODAL */}
      {historyRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {historyRule.name} — Version History
                </h3>
              </div>
              <button onClick={() => setHistoryRule(null)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto text-xs">
              {(historyRule.history || []).map((h, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100">
                    <span>Version {h.version}</span>
                    <span className="text-[10px] text-slate-400">
                      {format(new Date(h.timestamp), 'MMM d, yyyy HH:mm')}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    Limit: {h.oldLimit} → <strong>{h.newLimit}</strong> ({h.newSeverity})
                  </p>
                  <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                    Reason: {h.changeSummary}
                  </p>
                  <span className="text-[10px] text-slate-400 block">
                    Modified by {h.changedByName}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 text-right">
              <Button size="sm" variant="outline" onClick={() => setHistoryRule(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* REINSTATE PARTICIPANT MODAL */}
      {reinstatingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Reinstate {reinstatingMember.displayName || 'Participant'}
                </h3>
                <p className="text-xs text-slate-500">
                  Clear disqualification lock and restore trade submission privileges
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <Label className="text-xs font-semibold mb-1 block">Reinstatement Reason (Logged to Audit Trail)</Label>
                <Input
                  value={reinstateReason}
                  onChange={(e) => setReinstateReason(e.target.value)}
                  placeholder="e.g. Trade entry typo appealed and verified with screenshot"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setReinstatingMember(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isProcessing}
                onClick={handleReinstate}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isProcessing ? 'Reinstating...' : 'Confirm Reinstatement'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
