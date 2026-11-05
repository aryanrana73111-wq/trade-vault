import React, { useState, useMemo, useEffect } from 'react';
import { Trade, Rule } from '@/types';
import { 
  MILESTONE_FEATURES, 
  MilestoneFeatureDef, 
  getQualifyingTrades, 
  getUnlockedMilestonesCount, 
  isMilestoneUnlocked 
} from '@/lib/milestoneAnalytics';
import { Card } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { 
  Lock, 
  Unlock, 
  CheckCircle2, 
  Sparkles, 
  Flame, 
  Clock, 
  ShieldAlert, 
  TrendingDown, 
  Crosshair, 
  Scale, 
  Timer, 
  Calendar, 
  Award,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Info,
  Layers
} from 'lucide-react';

import { WinLossStreakAnalyzer } from './features/WinLossStreakAnalyzer';
import { TimeOfDayPerformance } from './features/TimeOfDayPerformance';
import { RiskDisciplineMatrix } from './features/RiskDisciplineMatrix';
import { DrawdownRecoveryProfile } from './features/DrawdownRecoveryProfile';
import { ExitEfficiencyMfeMae } from './features/ExitEfficiencyMfeMae';
import { ExpectancyEdgeDecomposition } from './features/ExpectancyEdgeDecomposition';
import { HoldingTimeEfficiency } from './features/HoldingTimeEfficiency';
import { RuleAdherenceImpact } from './features/RuleAdherenceImpact';
import { DayOfWeekPerformance } from './features/DayOfWeekPerformance';
import { ConsistencyProcessScore } from './features/ConsistencyProcessScore';

interface AdvancedAnalyticsProgressSectionProps {
  allTrades: Trade[];
  filteredTrades: Trade[];
  rules?: Rule[];
  currentDashboardId?: string;
  onExploreFeatureId?: string | null;
}

export function AdvancedAnalyticsProgressSection({
  allTrades,
  filteredTrades,
  rules = [],
  currentDashboardId = 'ALL',
  onExploreFeatureId
}: AdvancedAnalyticsProgressSectionProps) {
  // 1. Calculate actual qualifying trade records for unlock count
  const qualifyingTrades = useMemo(() => {
    return getQualifyingTrades(allTrades, currentDashboardId);
  }, [allTrades, currentDashboardId]);

  const qualifyingCount = qualifyingTrades.length;
  const unlockedCount = useMemo(() => getUnlockedMilestonesCount(qualifyingCount), [qualifyingCount]);

  // Filter view state: 'all' | 'unlocked' | 'locked'
  const [filterView, setFilterView] = useState<'all' | 'unlocked' | 'locked'>('all');

  // If explore was triggered via celebration modal
  useEffect(() => {
    if (onExploreFeatureId) {
      setTimeout(() => {
        const el = document.getElementById(`feature-box-${onExploreFeatureId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-2', 'ring-indigo-500', 'ring-offset-2');
          setTimeout(() => {
            el.classList.remove('ring-2', 'ring-indigo-500', 'ring-offset-2');
          }, 3000);
        }
      }, 150);
    }
  }, [onExploreFeatureId]);

  // Next milestone calculation
  const nextFeature = useMemo(() => {
    return MILESTONE_FEATURES.find(f => f.index > unlockedCount) || null;
  }, [unlockedCount]);

  const tradesNeededForNext = nextFeature ? Math.max(0, nextFeature.requiredTrades - qualifyingCount) : 0;
  const overallProgressPercent = Math.min(100, Math.round((qualifyingCount / 50) * 100));

  const getFeatureIcon = (iconName: string, className = 'w-4 h-4') => {
    switch (iconName) {
      case 'Flame': return <Flame className={className} />;
      case 'Clock': return <Clock className={className} />;
      case 'ShieldAlert': return <ShieldAlert className={className} />;
      case 'TrendingDown': return <TrendingDown className={className} />;
      case 'Crosshair': return <Crosshair className={className} />;
      case 'Scale': return <Scale className={className} />;
      case 'Timer': return <Timer className={className} />;
      case 'CheckCircle2': return <ShieldCheck className={className} />;
      case 'Calendar': return <Calendar className={className} />;
      case 'Award': return <Award className={className} />;
      default: return <Sparkles className={className} />;
    }
  };

  const renderFeatureComponent = (featureId: string) => {
    switch (featureId) {
      case 'streak_analyzer':
        return <WinLossStreakAnalyzer trades={filteredTrades} />;
      case 'time_of_day':
        return <TimeOfDayPerformance trades={filteredTrades} />;
      case 'risk_discipline':
        return <RiskDisciplineMatrix trades={filteredTrades} />;
      case 'drawdown_recovery':
        return <DrawdownRecoveryProfile trades={filteredTrades} />;
      case 'exit_efficiency':
        return <ExitEfficiencyMfeMae trades={filteredTrades} />;
      case 'expectancy_decomposition':
        return <ExpectancyEdgeDecomposition trades={filteredTrades} />;
      case 'holding_time':
        return <HoldingTimeEfficiency trades={filteredTrades} />;
      case 'rule_adherence_impact':
        return <RuleAdherenceImpact trades={filteredTrades} rules={rules} />;
      case 'day_of_week':
        return <DayOfWeekPerformance trades={filteredTrades} />;
      case 'process_score':
        return <ConsistencyProcessScore trades={filteredTrades} rules={rules} />;
      default:
        return null;
    }
  };

  const displayedFeatures = useMemo(() => {
    if (filterView === 'unlocked') {
      return MILESTONE_FEATURES.filter(f => f.index <= unlockedCount);
    }
    if (filterView === 'locked') {
      return MILESTONE_FEATURES.filter(f => f.index > unlockedCount);
    }
    return MILESTONE_FEATURES;
  }, [filterView, unlockedCount]);

  const scrollToFeature = (featureId: string) => {
    const el = document.getElementById(`feature-box-${featureId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="advanced-analytics-progress" className="space-y-6 pt-4">
      {/* Section Header Card */}
      <Card className="p-5 sm:p-6 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border-indigo-500/30 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                Journaling Milestones
              </span>
              <span className="text-xs text-slate-400">
                {unlockedCount} of 10 Features Unlocked
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              ADVANCED ANALYTICS PROGRESS
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Build your journal to unlock deeper performance analysis. Every 5 completed trades unlocks a new professional analytics engine displayed in its own dedicated workspace box.
            </p>
          </div>

          {/* Progress Tracker Widget */}
          <div className="w-full lg:w-80 bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3 shrink-0">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-400">Journal Depth</span>
              <span className="font-extrabold text-white font-mono">{qualifyingCount} / 50 Trades</span>
            </div>

            {/* Main Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-700/50">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-700 ease-out"
                style={{ width: `${overallProgressPercent}%` }}
              />
            </div>

            <div className="text-[11px] flex items-center justify-between pt-1 text-slate-400 border-t border-slate-800/80">
              {nextFeature ? (
                <>
                  <span className="truncate">Next: <strong className="text-indigo-300">{nextFeature.name}</strong></span>
                  <span className="font-bold text-amber-400 shrink-0 ml-2">{tradesNeededForNext} more trades</span>
                </>
              ) : (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> All 10 Advanced Tools Unlocked!
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Control Bar: View Filter & Quick Jump Nav */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        {/* Filter View Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-950/80 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
          <button
            type="button"
            onClick={() => setFilterView('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterView === 'all'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Boxes (10)
          </button>
          <button
            type="button"
            onClick={() => setFilterView('unlocked')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filterView === 'unlocked'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Unlocked ({unlockedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterView('locked')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filterView === 'locked'
                ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Locked ({10 - unlockedCount})
          </button>
        </div>

        {/* Quick Jump Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-hide">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 shrink-0 ml-1 mr-0.5">Jump to:</span>
          {MILESTONE_FEATURES.map(f => {
            const isUnlocked = f.index <= unlockedCount;
            return (
              <button
                key={`jump-${f.id}`}
                type="button"
                onClick={() => {
                  setFilterView('all');
                  scrollToFeature(f.id);
                }}
                title={`${f.name} (${isUnlocked ? 'Unlocked' : `Requires ${f.requiredTrades} trades`})`}
                className={`w-7 h-7 rounded-lg text-xs font-bold shrink-0 flex items-center justify-center border transition-all ${
                  isUnlocked
                    ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-500/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {f.index}
              </button>
            );
          })}
        </div>
      </div>

      {/* Individual Feature Boxes List */}
      <div className="space-y-6">
        {displayedFeatures.map(feature => {
          const isUnlocked = feature.index <= unlockedCount;
          const tradesNeeded = Math.max(0, feature.requiredTrades - qualifyingCount);
          const progressPercent = Math.min(100, Math.round((qualifyingCount / feature.requiredTrades) * 100));

          if (isUnlocked) {
            return (
              <Card
                key={feature.id}
                id={`feature-box-${feature.id}`}
                className="p-5 sm:p-7 bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-xs dark:shadow-xl transition-all duration-300"
              >
                {/* Unlocked Box Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800 gap-3 mb-6">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-100 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-2xs">
                      {getFeatureIcon(feature.iconName, 'w-6 h-6')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                          Feature #{feature.index} • Unlocked at {feature.requiredTrades} Trades
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                          <Unlock className="w-3 h-3" /> Active
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                        {feature.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {feature.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
                      Analyzing <strong className="text-slate-900 dark:text-white font-mono">{filteredTrades.length}</strong> trades
                    </span>
                  </div>
                </div>

                {/* Feature Analytics Content */}
                <div>
                  {renderFeatureComponent(feature.id)}
                </div>
              </Card>
            );
          }

          // Locked Feature Box
          return (
            <Card
              key={feature.id}
              id={`feature-box-${feature.id}`}
              className="p-6 sm:p-8 bg-slate-50/70 dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl shadow-xs transition-all duration-300 relative overflow-hidden"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-start gap-4 max-w-2xl">
                  <div className="w-12 h-12 rounded-2xl bg-slate-200/80 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0 shadow-2xs mt-1">
                    <Lock className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Feature #{feature.index} • Locked Milestone
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Lock className="w-2.5 h-2.5" /> Requires {feature.requiredTrades} Trades
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200">
                      {feature.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>

                {/* Requirement & Progress Tracker for this locked box */}
                <div className="w-full md:w-80 bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2.5 shrink-0 shadow-2xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Milestone Goal:</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">{qualifyingCount} / {feature.requiredTrades} Trades</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-700">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                    <span>{progressPercent}% completed</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      {tradesNeeded > 0 ? `${tradesNeeded} more trades needed` : 'Ready to unlock!'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
