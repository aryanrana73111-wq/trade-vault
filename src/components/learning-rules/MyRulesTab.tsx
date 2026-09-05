import React, { useState, useMemo } from 'react';
import { TradingRule, RuleCategory, RulePriority, RuleStatus, Trade } from '@/types';
import { Card } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Pin,
  PinOff,
  Plus,
  Edit2,
  Trash2,
  History,
  ArrowUp,
  ArrowDown,
  Shield,
  AlertCircle,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  Filter,
  Search,
  X,
  Sparkles,
  AlertTriangle,
  Scale
} from 'lucide-react';
import { RuleVersionHistoryModal } from './RuleVersionHistoryModal';
import { RuleAdherenceInsight } from './RuleAdherenceInsight';

interface MyRulesTabProps {
  rules: TradingRule[];
  trades: Trade[];
  onSaveRule: (rule: Omit<TradingRule, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'dashboardId'>) => Promise<any>;
  onUpdateRule: (id: string, updates: Partial<TradingRule>) => Promise<void>;
  onDeleteRule: (id: string) => Promise<void>;
  onReorderRules: (reorderedRules: TradingRule[]) => Promise<void>;
  prefilledRule?: { text: string; category?: RuleCategory } | null;
  onClearPrefilledRule?: () => void;
}

const CATEGORIES: RuleCategory[] = [
  'Risk Management',
  'Strategy',
  'Execution',
  'Psychology',
  'Market',
  'General',
];

const PRIORITIES: RulePriority[] = ['Critical', 'Important', 'Optional'];

export const MyRulesTab: React.FC<MyRulesTabProps> = ({
  rules,
  trades,
  onSaveRule,
  onUpdateRule,
  onDeleteRule,
  onReorderRules,
  prefilledRule,
  onClearPrefilledRule,
}) => {
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingRule, setEditingRule] = useState<TradingRule | null>(null);
  const [viewHistoryRule, setViewHistoryRule] = useState<TradingRule | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Form State (used for Add and Edit)
  const [formText, setFormText] = useState<string>('');
  const [formCategory, setFormCategory] = useState<RuleCategory>('Risk Management');
  const [formPriority, setFormPriority] = useState<RulePriority>('Critical');
  const [formStatus, setFormStatus] = useState<RuleStatus>('Active');
  const [formIsPinned, setFormIsPinned] = useState<boolean>(false);
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Auto-open modal if prefilledRule is passed from Learning "Convert to Rule"
  React.useEffect(() => {
    if (prefilledRule) {
      setFormText(prefilledRule.text);
      setFormCategory(prefilledRule.category || 'General');
      setFormPriority('Important');
      setFormStatus('Active');
      setFormIsPinned(false);
      setEditingRule(null);
      setIsAddModalOpen(true);
    }
  }, [prefilledRule]);

  const handleOpenAdd = () => {
    setFormText('');
    setFormCategory('Risk Management');
    setFormPriority('Critical');
    setFormStatus('Active');
    setFormIsPinned(false);
    setEditingRule(null);
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (rule: TradingRule) => {
    setEditingRule(rule);
    setFormText(rule.text);
    setFormCategory(rule.category);
    setFormPriority(rule.priority);
    setFormStatus(rule.status);
    setFormIsPinned(rule.isPinned);
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleCloseForm = () => {
    setIsAddModalOpen(false);
    setEditingRule(null);
    setFormError(null);
    if (onClearPrefilledRule) onClearPrefilledRule();
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formText.trim()) {
      setFormError('Rule text cannot be empty.');
      return;
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setFormError('You are currently offline. Please reconnect to save your trading rule.');
      return;
    }

    try {
      setFormSubmitting(true);
      if (editingRule) {
        // Edit Mode: preserve version history
        const currentVersion = editingRule.version || 1;
        const newVersionNumber = currentVersion + 1;
        const previousVersions = editingRule.versions || [];

        // Archive previous iteration
        const updatedVersions = [
          ...previousVersions,
          {
            version: currentVersion,
            text: editingRule.text,
            category: editingRule.category,
            priority: editingRule.priority,
            updatedAt: Date.now(),
          },
        ];

        await onUpdateRule(editingRule.id, {
          text: formText.trim(),
          category: formCategory,
          priority: formPriority,
          status: formStatus,
          isPinned: formIsPinned,
          version: newVersionNumber,
          versions: updatedVersions,
        });
      } else {
        // Add Mode: calculate next order
        const maxOrder = rules.reduce((max, r) => Math.max(max, r.order || 0), 0);
        await onSaveRule({
          text: formText.trim(),
          category: formCategory,
          priority: formPriority,
          status: formStatus,
          isPinned: formIsPinned,
          order: maxOrder + 1,
          version: 1,
          versions: [],
        });
      }

      handleCloseForm();
    } catch (err: any) {
      console.error('Failed to save rule:', err);
      setFormError(err.message || 'Failed to save rule. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleTogglePin = async (rule: TradingRule) => {
    try {
      await onUpdateRule(rule.id, { isPinned: !rule.isPinned });
    } catch (err) {
      console.error('Failed to toggle pin:', err);
    }
  };

  const handleToggleStatus = async (rule: TradingRule) => {
    try {
      const nextStatus: RuleStatus = rule.status === 'Active' ? 'Paused' : 'Active';
      await onUpdateRule(rule.id, { status: nextStatus });
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleMoveRule = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= rules.length) return;

    const reordered = [...rules];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    // Update order indexes
    const updated = reordered.map((r, i) => ({ ...r, order: i + 1 }));
    try {
      await onReorderRules(updated);
    } catch (err) {
      console.error('Failed to reorder rules:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmationId) return;
    try {
      setIsDeleting(true);
      await onDeleteRule(deleteConfirmationId);
      setDeleteConfirmationId(null);
    } catch (err) {
      console.error('Failed to delete rule:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered lists with defensive deduplication
  const uniqueRules = useMemo(() => {
    const seen = new Set<string>();
    return rules.filter((r) => {
      if (!r?.id || seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });
  }, [rules]);

  const filteredRules = useMemo(() => {
    return uniqueRules.filter((r) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const textMatch = r.text.toLowerCase().includes(q);
        const catMatch = r.category.toLowerCase().includes(q);
        if (!textMatch && !catMatch) return false;
      }
      if (categoryFilter !== 'All' && r.category !== categoryFilter) return false;
      if (priorityFilter !== 'All' && r.priority !== priorityFilter) return false;
      if (statusFilter !== 'All' && r.status !== statusFilter) return false;
      return true;
    });
  }, [uniqueRules, searchQuery, categoryFilter, priorityFilter, statusFilter]);

  const pinnedRules = useMemo(() => {
    return filteredRules.filter((r) => r.isPinned);
  }, [filteredRules]);

  const standardRules = useMemo(() => {
    return filteredRules.filter((r) => !r.isPinned);
  }, [filteredRules]);

  const getPriorityBadge = (priority: RulePriority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'Important':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Optional':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Trading Discipline Rules
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Non-negotiable risk, technical, and psychological principles for execution.
          </p>
        </div>
        <Button onClick={handleOpenAdd} size="sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Add New Rule
        </Button>
      </div>

      {/* Rule Adherence Factual Observation Insight */}
      <RuleAdherenceInsight trades={trades} />

      {/* Search & Filters */}
      <Card className="p-3.5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Priority */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Priorities</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Paused">Paused Only</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Rules Display: Pinned & Standard */}
      {filteredRules.length === 0 ? (
        <Card className="p-12 text-center bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <Shield className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            {searchQuery || categoryFilter !== 'All' || priorityFilter !== 'All' || statusFilter !== 'All'
              ? 'No matching trading rules found.'
              : "You haven't created any trading rules yet."}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto mb-4">
            {searchQuery || categoryFilter !== 'All' || priorityFilter !== 'All' || statusFilter !== 'All'
              ? 'Try adjusting your filters or search keywords.'
              : 'Trading rules protect your capital and maintain consistency across every market environment.'}
          </p>
          {!searchQuery && categoryFilter === 'All' && (
            <Button size="sm" onClick={handleOpenAdd}>
              Create Your First Rule
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Pinned Rules Section */}
          {pinnedRules.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <Pin className="w-4 h-4 text-amber-500 fill-amber-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Pinned Priority Rules ({pinnedRules.length})
                </h4>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {pinnedRules.map((rule, idx) => (
                  <RuleCard
                    key={rule.id}
                    rule={rule}
                    index={idx}
                    totalRules={pinnedRules.length}
                    onTogglePin={() => handleTogglePin(rule)}
                    onToggleStatus={() => handleToggleStatus(rule)}
                    onEdit={() => handleOpenEdit(rule)}
                    onDelete={() => setDeleteConfirmationId(rule.id)}
                    onViewHistory={() => setViewHistoryRule(rule)}
                    onMove={(dir) => handleMoveRule(idx, dir)}
                    getPriorityBadge={getPriorityBadge}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Standard Rules Section */}
          <div className="space-y-3">
            {pinnedRules.length > 0 && standardRules.length > 0 && (
              <div className="flex items-center gap-2 px-1 pt-2">
                <Shield className="w-4 h-4 text-slate-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  All Trading Rules ({standardRules.length})
                </h4>
              </div>
            )}
            <div className="grid grid-cols-1 gap-3">
              {standardRules.map((rule, idx) => (
                <RuleCard
                  key={rule.id}
                  rule={rule}
                  index={idx}
                  totalRules={standardRules.length}
                  onTogglePin={() => handleTogglePin(rule)}
                  onToggleStatus={() => handleToggleStatus(rule)}
                  onEdit={() => handleOpenEdit(rule)}
                  onDelete={() => setDeleteConfirmationId(rule.id)}
                  onViewHistory={() => setViewHistoryRule(rule)}
                  onMove={(dir) => handleMoveRule(idx, dir)}
                  getPriorityBadge={getPriorityBadge}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Rule Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-lg p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {editingRule ? `Edit Rule (v${(editingRule.version || 1) + 1})` : 'Create New Trading Rule'}
              </h3>
              <button onClick={handleCloseForm} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4">
              {/* Rule Text */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Rule Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  placeholder="e.g. Never risk more than 1.5% of account balance on a single trade setup..."
                  className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                />
              </div>

              {/* Category & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as RuleCategory)}
                    className="w-full p-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Priority
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as RulePriority)}
                    className="w-full p-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status & Pin Toggle */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as RuleStatus)}
                    className="w-full p-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Active">Active (Enforced)</option>
                    <option value="Paused">Paused (Inactive)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Pin to Top
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormIsPinned(!formIsPinned)}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 p-2 text-sm rounded-lg border transition-colors",
                      formIsPinned
                        ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-medium"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    )}
                  >
                    <Pin className={cn("w-4 h-4", formIsPinned && "fill-amber-500 text-amber-500")} />
                    {formIsPinned ? 'Pinned' : 'Not Pinned'}
                  </button>
                </div>
              </div>

              {formError && (
                <div className="p-3 text-xs rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                  {formError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button variant="outline" size="sm" type="button" onClick={handleCloseForm}>
                  Cancel
                </Button>
                <Button size="sm" type="submit" disabled={formSubmitting || !formText.trim()}>
                  {formSubmitting ? 'Saving...' : editingRule ? 'Update Rule' : 'Save Rule'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Version History Modal */}
      {viewHistoryRule && (
        <RuleVersionHistoryModal
          isOpen={!!viewHistoryRule}
          onClose={() => setViewHistoryRule(null)}
          ruleText={viewHistoryRule.text}
          currentVersion={viewHistoryRule.version || 1}
          versions={viewHistoryRule.versions}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmationId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-md p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-2 rounded-full bg-rose-50 dark:bg-rose-950/60">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Permanently Delete Rule?
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              This action will permanently remove this trading rule from your dashboard in Firestore. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirmationId(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

interface RuleCardProps {
  rule: TradingRule;
  index: number;
  totalRules: number;
  onTogglePin: () => void;
  onToggleStatus: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onViewHistory: () => void;
  onMove: (dir: 'up' | 'down') => void;
  getPriorityBadge: (p: RulePriority) => string;
}

const RuleCard: React.FC<RuleCardProps> = ({
  rule,
  index,
  totalRules,
  onTogglePin,
  onToggleStatus,
  onEdit,
  onDelete,
  onViewHistory,
  onMove,
  getPriorityBadge,
}) => {
  const isPaused = rule.status === 'Paused';

  return (
    <Card
      className={cn(
        "p-4 sm:p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm relative",
        rule.isPinned && "border-l-4 border-l-amber-500 dark:border-l-amber-500",
        isPaused && "opacity-75 bg-slate-50/50 dark:bg-slate-900/40"
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2.5">
        {/* Badges & Status */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Priority Badge */}
          <span className={cn("text-xs px-2.5 py-0.5 rounded-full font-semibold border", getPriorityBadge(rule.priority))}>
            {rule.priority}
          </span>

          {/* Category Badge */}
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium">
            {rule.category}
          </span>

          {/* Status Badge / Toggle */}
          <button
            onClick={onToggleStatus}
            className={cn(
              "text-[11px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 transition-colors",
              rule.status === 'Active'
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100"
                : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-300"
            )}
            title="Click to toggle Active / Paused status"
          >
            {rule.status === 'Active' ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            ) : (
              <PauseCircle className="w-3 h-3 text-slate-400" />
            )}
            {rule.status}
          </button>

          {/* Version Indicator */}
          {(rule.version || 1) > 1 && (
            <button
              onClick={onViewHistory}
              className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 flex items-center gap-1"
              title="View revision history"
            >
              <History className="w-3 h-3" />
              v{rule.version}
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 self-end sm:self-auto">
          {/* Reorder Buttons */}
          <button
            disabled={index === 0}
            onClick={() => onMove('up')}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
            title="Move Up"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            disabled={index === totalRules - 1}
            onClick={() => onMove('down')}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
            title="Move Down"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-3.5 bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* Pin Button */}
          <button
            onClick={onTogglePin}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              rule.isPinned
                ? "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
            title={rule.isPinned ? "Unpin rule" : "Pin rule to top"}
          >
            {rule.isPinned ? <Pin className="w-4 h-4 fill-amber-500" /> : <PinOff className="w-4 h-4" />}
          </button>

          {/* History Button (if versions exist) */}
          <button
            onClick={onViewHistory}
            className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Revision History"
          >
            <History className="w-4 h-4" />
          </button>

          {/* Edit Button */}
          <button
            onClick={onEdit}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Edit Rule"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          {/* Delete Button */}
          <button
            onClick={onDelete}
            className="p-1.5 rounded-md text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            title="Delete Rule"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Rule Content */}
      <p className={cn(
        "text-sm font-medium text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-wrap",
        isPaused && "line-through text-slate-500 dark:text-slate-400"
      )}>
        {rule.text}
      </p>

      {/* Footer Timestamps */}
      <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400 dark:text-slate-500">
        <span>Created {format(new Date(rule.createdAt), 'MMM dd, yyyy')}</span>
        {rule.updatedAt && rule.updatedAt !== rule.createdAt && (
          <span>Updated {format(new Date(rule.updatedAt), 'MMM dd, yyyy · HH:mm')}</span>
        )}
      </div>
    </Card>
  );
};
