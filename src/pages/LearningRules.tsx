import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { LearningEntry, TradingRule, RuleCategory } from '@/types';
import { TodayLearningForm } from '@/components/learning-rules/TodayLearningForm';
import { LearningHistoryList } from '@/components/learning-rules/LearningHistoryList';
import { MyRulesTab } from '@/components/learning-rules/MyRulesTab';
import { formatCurrency, cn } from '@/lib/utils';
import {
  BookOpenCheck,
  Calendar,
  Shield,
  Layers,
  Sparkles,
  Info,
  Pin
} from 'lucide-react';
import { format } from 'date-fns';

export default function LearningRules() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'rules' ? 'rules' : 'learning';
  const [activeTab, setActiveTab] = useState<'learning' | 'rules'>(initialTab);

  const { activeDashboard } = useAuth();
  const {
    trades,
    learnings,
    rules,
    saveLearning,
    updateLearning,
    deleteLearning,
    saveRule,
    updateRule,
    deleteRule,
    reorderRules,
  } = useData();

  // Reference to top form for scroll-to-form action
  const formRef = useRef<HTMLDivElement>(null);

  // State for prefilling a rule when converting from learning
  const [prefilledRule, setPrefilledRule] = useState<{ text: string; category?: RuleCategory } | null>(null);
  const location = useLocation();

  useEffect(() => {
    if (location.state && (location.state as any).prefilledRule) {
      setPrefilledRule((location.state as any).prefilledRule);
      setActiveTab('rules');
      setSearchParams({ tab: 'rules' });
    }
  }, [location.state, setSearchParams]);

  // Sync tab with URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'rules' || tab === 'learning') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: 'learning' | 'rules') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleConvertToRule = (learning: LearningEntry) => {
    // Map learning category to valid rule category if possible
    let ruleCat: RuleCategory = 'General';
    const validRuleCats: RuleCategory[] = ['Risk Management', 'Strategy', 'Execution', 'Psychology', 'Market', 'General'];
    if (validRuleCats.includes(learning.category as RuleCategory)) {
      ruleCat = learning.category as RuleCategory;
    } else if (learning.category === 'Market Structure') {
      ruleCat = 'Market';
    } else if (learning.category === 'Mistake') {
      ruleCat = 'Risk Management';
    }

    setPrefilledRule({
      text: learning.content,
      category: ruleCat,
    });
    handleTabChange('rules');
  };

  // Counts for badges
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayLearningsCount = learnings.filter((l) => l.dateString === todayStr).length;
  const activeRulesCount = rules.filter((r) => r.status === 'Active').length;
  const pinnedRulesCount = rules.filter((r) => r.isPinned).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-xs uppercase tracking-wider mb-1">
            <BookOpenCheck className="w-4 h-4" />
            <span>Discipline & Continuous Improvement</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Learning & Rules
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Document daily market insights and maintain high-conviction trading rules.
          </p>
        </div>

        {/* Dashboard Isolation Badge */}
        {activeDashboard && (
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2 rounded-xl shadow-sm self-start md:self-auto">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Active Journal</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {activeDashboard.name}
              </span>
              {activeDashboard.currency && (
                <span className="text-slate-400 ml-1">({activeDashboard.currency})</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Unified Tab Switcher */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => handleTabChange('learning')}
          className={cn(
            "flex items-center gap-2.5 px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer relative",
            activeTab === 'learning'
              ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          )}
        >
          <Calendar className="w-4 h-4" />
          <span>Today Learning</span>
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded-full font-medium transition-colors",
              activeTab === 'learning'
                ? "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            )}
          >
            {learnings.length}
          </span>
          {todayLearningsCount > 0 && (
            <span className="hidden sm:inline-flex items-center text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium">
              +{todayLearningsCount} today
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange('rules')}
          className={cn(
            "flex items-center gap-2.5 px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer relative",
            activeTab === 'rules'
              ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          )}
        >
          <Shield className="w-4 h-4" />
          <span>My Rules</span>
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded-full font-medium transition-colors",
              activeTab === 'rules'
                ? "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            )}
          >
            {rules.length}
          </span>
          {pinnedRulesCount > 0 && (
            <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-medium">
              <Pin className="w-2.5 h-2.5 fill-amber-600" />
              {pinnedRulesCount}
            </span>
          )}
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'learning' ? (
        <div className="space-y-6">
          {/* Form Section */}
          <div ref={formRef}>
            <TodayLearningForm trades={trades} onSave={saveLearning} />
          </div>

          {/* History Section */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Learning History & Takeaways
              </h3>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {learnings.length} total entries recorded
              </span>
            </div>

            <LearningHistoryList
              learnings={learnings}
              trades={trades}
              onUpdate={updateLearning}
              onDelete={deleteLearning}
              onConvertToRule={handleConvertToRule}
              onFocusForm={() => formRef.current?.scrollIntoView({ behavior: 'smooth' })}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <MyRulesTab
            rules={rules}
            trades={trades}
            onSaveRule={saveRule}
            onUpdateRule={updateRule}
            onDeleteRule={deleteRule}
            onReorderRules={reorderRules}
            prefilledRule={prefilledRule}
            onClearPrefilledRule={() => setPrefilledRule(null)}
          />
        </div>
      )}
    </div>
  );
}
