import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  User, CreditCard, ShieldAlert, Brain, LogIn, BarChart2, 
  Palette, LayoutDashboard, Bell, Clock, Target, Database, 
  Lock, Zap, FlaskConical, Search, Plus, BookOpen, Trash2
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { saveSettings } from '@/lib/settings';
import { Card } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

const SETTINGS_SECTIONS = [
  { id: 'profile', label: 'Profile', icon: User, group: 'ACCOUNT' },
  { id: 'dashboards', label: 'Dashboards', icon: BookOpen, group: 'ACCOUNT' },
  { id: 'accounts', label: 'Trading Accounts', icon: CreditCard, group: 'ACCOUNT' },
  
  { id: 'risk', label: 'Risk Management', icon: ShieldAlert, group: 'TRADING' },
  { id: 'entry', label: 'Trade Entry', icon: LogIn, group: 'TRADING' },
  { id: 'strategy', label: 'Strategy Defaults', icon: Target, group: 'TRADING' },
  { id: 'schedule', label: 'Trading Schedule', icon: Clock, group: 'TRADING' },

  { id: 'analytics', label: 'Analytics', icon: BarChart2, group: 'ANALYTICS' },
  { id: 'psychology', label: 'Psychology', icon: Brain, group: 'ANALYTICS' },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'ANALYTICS' },

  { id: 'appearance', label: 'Appearance', icon: Palette, group: 'SYSTEM' },
  { id: 'notifications', label: 'Notifications', icon: Bell, group: 'SYSTEM' },
  { id: 'data', label: 'Data & Backup', icon: Database, group: 'SYSTEM' },
  { id: 'privacy', label: 'Privacy & Security', icon: Lock, group: 'SYSTEM' },

  { id: 'ai', label: 'AI', icon: Zap, group: 'ADVANCED' },
  { id: 'labs', label: 'Labs', icon: FlaskConical, group: 'ADVANCED' },
];

export default function Settings() {
  const [searchParams] = useSearchParams();
  const { settings, updateSettings } = useTheme();
  const [activeSection, setActiveSection] = useState(searchParams.get('tab') || 'profile');
  const [searchQuery, setSearchQuery] = useState('');
  const [localSettings, setLocalSettings] = useState(settings);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const { user, dashboards, createDashboard, deleteDashboard, activeDashboard, setActiveDashboard } = useAuth();
  const { trades, resetDashboardData } = useData();

  const [newDashName, setNewDashName] = useState('');
  const [newDashCurrency, setNewDashCurrency] = useState('USD');
  const [newDashBalance, setNewDashBalance] = useState('10000');
  const [showCreateDash, setShowCreateDash] = useState(false);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveSection(tab);
  }, [searchParams]);

  const handleSave = () => {
    saveSettings(localSettings);
    updateSettings();
    setSaveStatus('Changes saved');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const updateSection = (section: string, data: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [section]: { ...prev[section as keyof typeof prev], ...data }
    }));
  };

  const filteredSections = SETTINGS_SECTIONS.filter(s => 
    s.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.group.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groups = Array.from(new Set(filteredSections.map(s => s.group)));

  return (
    <div className="max-w-6xl mx-auto pb-24 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Control Center</h1>
          <p className="text-slate-500 mt-1">Manage your platform preferences and trading rules.</p>
        </div>
        <div className="flex items-center gap-3">
          {saveStatus && (
            <span className="text-sm font-medium text-green-600 flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-full">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              {saveStatus}
            </span>
          )}
          <Button onClick={handleSave} className="min-w-[120px]">
            Save Changes
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation - Left Column */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search settings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-6 hidden lg:block overflow-y-auto max-h-[calc(100vh-200px)] pr-2 pb-10">
              {groups.map(group => (
                <div key={group}>
                  <h3 className="text-xs font-semibold text-slate-400 mb-2 tracking-wider">{group}</h3>
                  <div className="space-y-1">
                    {filteredSections.filter(s => s.group === group).map(section => {
                      const isActive = activeSection === section.id;
                      return (
                        <button
                          key={section.id}
                          onClick={() => setActiveSection(section.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isActive 
                              ? 'bg-blue-50 text-blue-700' 
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          <section.icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                          {section.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile/Tablet horizontal scroll navigation */}
            <div className="flex lg:hidden overflow-x-auto pb-4 gap-2 scrollbar-hide">
              {SETTINGS_SECTIONS.map(section => {
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                      isActive 
                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <section.icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    {section.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content - Right Column */}
        <div className="flex-1 min-w-0 pb-12">
          {activeSection === 'profile' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-xl font-semibold text-slate-900">Profile</h2>
                <p className="text-sm text-slate-500 mt-1">Manage your personal information and trading identity.</p>
              </div>
              
              <div className="grid gap-6 max-w-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                    <input 
                      type="text" 
                      value={localSettings.profile.name}
                      onChange={e => updateSection('profile', { name: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input 
                      type="email" 
                      value={localSettings.profile.email}
                      onChange={e => updateSection('profile', { email: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Trading Style</label>
                    <select 
                      value={localSettings.profile.style}
                      onChange={e => updateSection('profile', { style: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option>Scalping</option>
                      <option>Intraday</option>
                      <option>Swing</option>
                      <option>Position</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Account Currency</label>
                    <select 
                      value={localSettings.profile.currency}
                      onChange={e => updateSection('profile', { currency: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option>USD</option>
                      <option>EUR</option>
                      <option>GBP</option>
                      <option>INR</option>
                      <option>AUD</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'appearance' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-xl font-semibold text-slate-900">Appearance</h2>
                <p className="text-sm text-slate-500 mt-1">Customize the look and feel of your platform.</p>
              </div>
              
              <div className="space-y-8 max-w-2xl">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Theme Preference</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {(['light', 'dark', 'system'] as const).map(theme => (
                      <div 
                        key={theme}
                        onClick={() => updateSection('appearance', { theme })}
                        className={`cursor-pointer rounded-xl border-2 p-1 transition-all ${localSettings.appearance.theme === theme ? 'border-blue-600 bg-blue-50/50' : 'border-transparent hover:bg-slate-100'}`}
                      >
                        <div className={`h-24 rounded-lg border border-slate-200 flex flex-col overflow-hidden ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'}`}>
                          <div className={`h-6 border-b ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} flex items-center px-2 gap-1`}>
                            <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                            <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                          </div>
                          <div className="flex-1 p-2 flex gap-2">
                            <div className={`w-6 h-full rounded ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}></div>
                            <div className="flex-1 flex flex-col gap-2">
                              <div className={`h-4 rounded ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'}`}></div>
                              <div className={`flex-1 rounded ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}></div>
                            </div>
                          </div>
                        </div>
                        <p className="text-center text-sm font-medium text-slate-700 mt-2 capitalize">{theme}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Interface Density</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {(['comfortable', 'compact'] as const).map(density => (
                      <div 
                        key={density}
                        onClick={() => updateSection('appearance', { density })}
                        className={`cursor-pointer rounded-xl border p-4 transition-all ${localSettings.appearance.density === density ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${localSettings.appearance.density === density ? 'border-blue-600' : 'border-slate-300'}`}>
                            {localSettings.appearance.density === density && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                          </div>
                          <span className="font-medium text-slate-900 capitalize">{density}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-2 ml-7">
                          {density === 'comfortable' ? 'More spacing and larger cards.' : 'Reduced spacing, more information visible on screen.'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'dashboards' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Dashboards</h2>
                  <p className="text-sm text-slate-500 mt-1">Manage your independent trading journals.</p>
                </div>
                <Button onClick={() => setShowCreateDash(true)} className="gap-2">
                  <Plus className="w-4 h-4" /> New Dashboard
                </Button>
              </div>

              {showCreateDash && (
                <Card className="p-6 bg-blue-50/50 border-blue-100">
                  <h3 className="text-lg font-medium text-slate-900 mb-4">Create New Dashboard</h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                      <input type="text" value={newDashName} onChange={e => setNewDashName(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-slate-300" placeholder="e.g. Gold Scalping" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                      <select value={newDashCurrency} onChange={e => setNewDashCurrency(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-slate-300">
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Starting Balance</label>
                      <input type="number" value={newDashBalance} onChange={e => setNewDashBalance(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-slate-300" />
                    </div>
                  </div>
                  <div className="mt-4 flex gap-3 justify-end">
                    <Button variant="outline" onClick={() => setShowCreateDash(false)}>Cancel</Button>
                    <Button onClick={async () => {
                      if(!newDashName) return;
                      await createDashboard(newDashName, newDashCurrency, parseFloat(newDashBalance) || 0);
                      setNewDashName('');
                      setShowCreateDash(false);
                    }}>Create</Button>
                  </div>
                </Card>
              )}

              <div className="space-y-4">
                {dashboards.map(d => (
                  <Card key={d.id} className={`p-5 flex items-center justify-between ${activeDashboard?.id === d.id ? 'ring-2 ring-blue-500' : ''}`}>
                    <div>
                      <h3 className="text-lg font-medium text-slate-900 flex items-center gap-2">
                        {d.name} 
                        {activeDashboard?.id === d.id && <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider">Active</span>}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">Currency: {d.currency} &bull; Starting Balance: {d.startingBalance}</p>
                    </div>
                    <div className="flex gap-2">
                      {activeDashboard?.id !== d.id && (
                        <Button variant="outline" onClick={() => setActiveDashboard(d)}>
                          Switch To
                        </Button>
                      )}
                      {dashboards.length > 1 && (
                        <Button variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200" onClick={async () => {
                          const conf = window.prompt(`Type "${d.name}" to delete this dashboard and all its trades.`);
                          if(conf === d.name) {
                            try {
                              await deleteDashboard(d.id);
                            } catch (err: any) {
                              alert(err.message || 'Failed to delete dashboard.');
                            }
                          }
                        }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              {activeDashboard && (
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Danger Zone</h3>
                  <p className="text-sm text-slate-500 mb-4">Resetting trade data will permanently delete all trades and strategies from the <strong>current</strong> dashboard only.</p>
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={async () => {
                    const conf = window.prompt(`Type "RESET" to delete all trades from ${activeDashboard.name}.`);
                    if(conf === 'RESET') {
                      try {
                        await resetDashboardData();
                        alert('Dashboard reset successfully.');
                      } catch (err: any) {
                        alert(err.message || 'Failed to reset dashboard.');
                      }
                    }
                  }}>
                    Reset Trade Data
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeSection === 'accounts' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Trading Accounts</h2>
                  <p className="text-sm text-slate-500 mt-1">Manage your live, funded, and demo accounts.</p>
                </div>
                <Button variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" /> Add Account
                </Button>
              </div>
              
              <div className="space-y-4">
                {localSettings.accounts.map(acc => (
                  <div key={acc.id} className={`p-4 rounded-xl border ${localSettings.activeAccountId === acc.id ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 bg-white'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${localSettings.activeAccountId === acc.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                            {acc.name} 
                            {localSettings.activeAccountId === acc.id && (
                              <span className="text-[10px] uppercase font-bold tracking-wider bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Active</span>
                            )}
                          </h3>
                          <p className="text-sm text-slate-500">{acc.broker} • {acc.type} • {acc.currency}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">${acc.currentBalance.toLocaleString()}</p>
                        <p className="text-xs text-slate-500">Starting: ${acc.startingBalance.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'risk' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-xl font-semibold text-slate-900">Risk Management</h2>
                <p className="text-sm text-slate-500 mt-1">Configure your risk limits and guardrail alerts.</p>
              </div>
              
              <div className="grid gap-6 max-w-2xl">
                <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex gap-3">
                  <ShieldAlert className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-orange-900">Risk Guardrails</h4>
                    <p className="text-xs text-orange-800 mt-1">TradeVault will warn you if a trade exceeds these parameters, but will never block you from taking a trade unless Hard Limits are enabled in Labs.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Default Risk Per Trade (%)</label>
                    <input 
                      type="number" step="0.1"
                      value={localSettings.risk.defaultRisk}
                      onChange={e => updateSection('risk', { defaultRisk: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Max Daily Risk (%)</label>
                    <input 
                      type="number" step="0.1"
                      value={localSettings.risk.maxDailyRisk}
                      onChange={e => updateSection('risk', { maxDailyRisk: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Max Weekly Risk (%)</label>
                    <input 
                      type="number" step="0.1"
                      value={localSettings.risk.maxWeeklyRisk}
                      onChange={e => updateSection('risk', { maxWeeklyRisk: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Max Trades Per Day</label>
                    <input 
                      type="number"
                      value={localSettings.risk.maxTradesPerDay}
                      onChange={e => updateSection('risk', { maxTradesPerDay: parseInt(e.target.value) || 0 })}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'psychology' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-xl font-semibold text-slate-900">Psychology Tracking</h2>
                <p className="text-sm text-slate-500 mt-1">Configure behavioral pattern detection based on your journal data.</p>
              </div>
              
              <div className="space-y-6 max-w-2xl">
                <label className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-white cursor-pointer hover:bg-slate-50">
                  <div>
                    <h4 className="font-semibold text-slate-900">Enable Psychology Tracking</h4>
                    <p className="text-xs text-slate-500">Activates the Psychology dashboard and behavioral analytics.</p>
                  </div>
                  <div className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${localSettings.psychology.enabled ? 'bg-blue-600' : 'bg-slate-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${localSettings.psychology.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                  <input type="checkbox" className="hidden" checked={localSettings.psychology.enabled} onChange={() => updateSection('psychology', { enabled: !localSettings.psychology.enabled })} />
                </label>

                <div className={`space-y-3 ${!localSettings.psychology.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">Detection Features</h3>
                  {[
                    { id: 'preTrade', label: 'Pre-Trade Emotion Tracking' },
                    { id: 'fomoDetection', label: 'FOMO Pattern Detection' },
                    { id: 'revengeDetection', label: 'Revenge Pattern Detection' },
                    { id: 'riskEscalationDetection', label: 'Risk Escalation Detection' },
                    { id: 'ruleAdherence', label: 'Rule Adherence Correlation' }
                  ].map(feature => (
                    <label key={feature.id} className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={localSettings.psychology[feature.id as keyof typeof localSettings.psychology] as boolean}
                        onChange={(e) => updateSection('psychology', { [feature.id]: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">{feature.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'data' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-xl font-semibold text-slate-900">Data & Backup</h2>
                <p className="text-sm text-slate-500 mt-1">Manage, export, and secure your trading journal data.</p>
              </div>
              
              <div className="grid gap-6 max-w-2xl">
                <Card className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-1">Cloud Sync Status</h3>
                  <div className="flex items-center gap-2 text-sm text-green-600 mb-4 bg-green-50 px-3 py-2 rounded-md border border-green-100">
                    <Database className="w-4 h-4" />
                    <span>Your data is actively syncing to Firebase Cloud Firestore.</span>
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" className="flex-1 text-slate-500" disabled>Export CSV (Soon)</Button>
                    <Button variant="outline" className="flex-1 text-slate-500" disabled>Export JSON (Soon)</Button>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeSection === 'entry' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-xl font-semibold text-slate-900">Trade Entry Preferences</h2>
                <p className="text-sm text-slate-500 mt-1">Set default values for the Add Trade form.</p>
              </div>
              
              <div className="grid gap-6 max-w-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Default Market</label>
                    <input 
                      type="text" placeholder="e.g. XAU/USD"
                      value={localSettings.entryPreferences.market}
                      onChange={e => updateSection('entryPreferences', { market: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Default Direction</label>
                    <select 
                      value={localSettings.entryPreferences.direction}
                      onChange={e => updateSection('entryPreferences', { direction: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">None</option>
                      <option value="BUY">Long / Buy</option>
                      <option value="SELL">Short / Sell</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Default Session</label>
                    <select 
                      value={localSettings.entryPreferences.session}
                      onChange={e => updateSection('entryPreferences', { session: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">None</option>
                      <option>New York</option>
                      <option>London</option>
                      <option>Tokyo</option>
                      <option>Sydney</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Default Timeframe</label>
                    <select 
                      value={localSettings.entryPreferences.timeframe}
                      onChange={e => updateSection('entryPreferences', { timeframe: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">None</option>
                      <option>1m</option>
                      <option>5m</option>
                      <option>15m</option>
                      <option>1H</option>
                      <option>4H</option>
                      <option>Daily</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'strategy' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-xl font-semibold text-slate-900">Strategy Defaults</h2>
                <p className="text-sm text-slate-500 mt-1">Configure default strategy properties.</p>
              </div>
              <div className="p-8 border border-dashed border-slate-200 rounded-xl bg-slate-50 text-center max-w-2xl">
                <p className="text-slate-500">Your strategies are managed dynamically in the Strategies section.</p>
                <Button className="mt-4" variant="outline">Go to Strategies</Button>
              </div>
            </div>
          )}

          {activeSection === 'analytics' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-xl font-semibold text-slate-900">Analytics Preferences</h2>
                <p className="text-sm text-slate-500 mt-1">Customize how your data is displayed.</p>
              </div>
              
              <div className="grid gap-6 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Default Analytics Period</label>
                  <select 
                    value={localSettings.analytics.defaultPeriod}
                    onChange={e => updateSection('analytics', { defaultPeriod: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Today</option>
                    <option>7 Days</option>
                    <option>30 Days</option>
                    <option>90 Days</option>
                    <option>This Year</option>
                    <option>All Time</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Default Chart Type</label>
                  <select 
                    value={localSettings.analytics.defaultChart}
                    onChange={e => updateSection('analytics', { defaultChart: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Equity Curve</option>
                    <option>Drawdown</option>
                    <option>R-Multiple</option>
                    <option>Daily P&L</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'dashboard' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-xl font-semibold text-slate-900">Dashboard Layout</h2>
                <p className="text-sm text-slate-500 mt-1">Show or hide widgets on your main dashboard.</p>
              </div>
              <div className="space-y-3 max-w-2xl">
                  {['Total P&L', 'Win Rate', 'Total Trades', 'Profit Factor', 'Expectancy', 'Average R', 'Maximum Drawdown', 'Equity Curve', 'Recent Trades', 'Best Strategy', 'Worst Strategy', 'Psychology Score', 'Risk Overview'].map(widget => (
                    <label key={widget} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={localSettings.dashboard.widgets.includes(widget)}
                        onChange={(e) => {
                          const current = [...localSettings.dashboard.widgets];
                          if (e.target.checked) current.push(widget);
                          else current.splice(current.indexOf(widget), 1);
                          updateSection('dashboard', { widgets: current });
                        }}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">{widget}</span>
                    </label>
                  ))}
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-xl font-semibold text-slate-900">Notifications</h2>
                <p className="text-sm text-slate-500 mt-1">Manage trading alerts and journal reminders.</p>
              </div>
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Trading Alerts</h3>
                  <div className="space-y-3">
                    {[
                      { id: 'riskLimit', label: 'Risk Limit Warnings' },
                      { id: 'dailyLoss', label: 'Daily Loss Warnings' },
                      { id: 'consecutiveLoss', label: 'Consecutive Loss Warnings' },
                      { id: 'overtrading', label: 'Overtrading Warnings' },
                      { id: 'psychologyPattern', label: 'Psychology Pattern Warnings' }
                    ].map(notification => (
                      <label key={notification.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                        <span className="text-sm text-slate-700">{notification.label}</span>
                        <div className={`w-9 h-5 rounded-full transition-colors flex items-center px-1 ${localSettings.notifications[notification.id as keyof typeof localSettings.notifications] ? 'bg-blue-600' : 'bg-slate-300'}`}>
                          <div className={`w-3 h-3 bg-white rounded-full transition-transform ${localSettings.notifications[notification.id as keyof typeof localSettings.notifications] ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                        <input type="checkbox" className="hidden" 
                          checked={localSettings.notifications[notification.id as keyof typeof localSettings.notifications] as boolean} 
                          onChange={(e) => updateSection('notifications', { [notification.id]: e.target.checked })} 
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'schedule' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-xl font-semibold text-slate-900">Trading Schedule</h2>
                <p className="text-sm text-slate-500 mt-1">Define your preferred trading hours for analytics context.</p>
              </div>
              <div className="space-y-3 max-w-2xl">
                {Object.keys(localSettings.schedule).map(day => (
                  <div key={day} className="flex items-center gap-4 p-3 rounded-lg border border-slate-200">
                    <label className="flex items-center gap-3 w-32 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={localSettings.schedule[day].enabled}
                        onChange={e => {
                          const sched = { ...localSettings.schedule };
                          sched[day].enabled = e.target.checked;
                          updateSection('schedule', sched);
                        }}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-slate-700">{day}</span>
                    </label>
                    
                    <div className={`flex items-center gap-2 ${!localSettings.schedule[day].enabled ? 'opacity-30 pointer-events-none' : ''}`}>
                      <input type="time" value={localSettings.schedule[day].start} 
                        onChange={e => {
                          const sched = { ...localSettings.schedule };
                          sched[day].start = e.target.value;
                          updateSection('schedule', sched);
                        }}
                        className="p-1 border border-slate-200 rounded text-sm" />
                      <span className="text-slate-400 text-sm">to</span>
                      <input type="time" value={localSettings.schedule[day].end} 
                        onChange={e => {
                          const sched = { ...localSettings.schedule };
                          sched[day].end = e.target.value;
                          updateSection('schedule', sched);
                        }}
                        className="p-1 border border-slate-200 rounded text-sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'privacy' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-xl font-semibold text-slate-900">Privacy & Security</h2>
                <p className="text-sm text-slate-500 mt-1">Manage your account security and sessions.</p>
              </div>
              <div className="space-y-4 max-w-2xl">
                <Button variant="outline" className="w-full justify-start py-6">Change Password</Button>
                <Button variant="outline" className="w-full justify-start py-6">Sign Out From All Devices</Button>
                <Button variant="outline" className="w-full justify-start py-6 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">Delete Account</Button>
              </div>
            </div>
          )}

          {activeSection === 'ai' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-xl font-semibold text-slate-900">AI Settings</h2>
                <p className="text-sm text-slate-500 mt-1">Manage artificial intelligence assistance features.</p>
              </div>
              <div className="p-6 bg-slate-900 text-white rounded-xl shadow-lg relative overflow-hidden max-w-2xl">
                <Zap className="absolute right-0 top-0 w-32 h-32 text-slate-800 opacity-50 transform translate-x-8 -translate-y-8 pointer-events-none" />
                <div className="relative z-10">
                  <h3 className="font-semibold mb-2">TradeVault AI Capabilities</h3>
                  <p className="text-sm text-slate-400 mb-6">AI features analyze your journal data to uncover patterns you might miss. They never invent stats or predict market movements.</p>
                  
                  <div className="space-y-3">
                    {[
                      { id: 'aiTradeReview', label: 'AI Trade Review' },
                    ].map(feature => (
                      <label key={feature.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-700 hover:bg-slate-800 cursor-pointer">
                        <span className="text-sm text-slate-200">{feature.label}</span>
                        <div className={`w-9 h-5 rounded-full transition-colors flex items-center px-1 ${localSettings.labs[feature.id as keyof typeof localSettings.labs] ? 'bg-blue-500' : 'bg-slate-700'}`}>
                          <div className={`w-3 h-3 bg-white rounded-full transition-transform ${localSettings.labs[feature.id as keyof typeof localSettings.labs] ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                        <input type="checkbox" className="hidden" 
                          checked={localSettings.labs[feature.id as keyof typeof localSettings.labs] as boolean} 
                          onChange={(e) => updateSection('labs', { [feature.id]: e.target.checked })} 
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'labs' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">TradeVault Labs <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">BETA</span></h2>
                <p className="text-sm text-slate-500 mt-1">Experimental features that are still in development.</p>
              </div>
              <div className="space-y-4 max-w-2xl">
                <Card className="p-4 border-purple-100 bg-purple-50/30">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">Advanced Psychology</h3>
                      <p className="text-sm text-slate-500 mt-1">Enables multi-variable correlation in the psychology dashboard.</p>
                    </div>
                    <div className={`mt-1 w-9 h-5 rounded-full transition-colors flex items-center px-1 cursor-pointer ${localSettings.labs.advancedPsychology ? 'bg-purple-600' : 'bg-slate-300'}`} onClick={() => updateSection('labs', { advancedPsychology: !localSettings.labs.advancedPsychology })}>
                      <div className={`w-3 h-3 bg-white rounded-full transition-transform ${localSettings.labs.advancedPsychology ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                  </div>
                </Card>
                <Card className="p-4 border-slate-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900 flex items-center gap-2">Smart Risk Warnings</h3>
                      <p className="text-sm text-slate-500 mt-1">Context-aware risk limits based on current market volatility.</p>
                    </div>
                    <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2 py-1 rounded">Coming Soon</span>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Fallback */}
          {activeSection !== 'profile' && activeSection !== 'appearance' && activeSection !== 'accounts' && activeSection !== 'risk' && activeSection !== 'psychology' && activeSection !== 'data' && activeSection !== 'entry' && activeSection !== 'strategy' && activeSection !== 'analytics' && activeSection !== 'dashboard' && activeSection !== 'notifications' && activeSection !== 'schedule' && activeSection !== 'privacy' && activeSection !== 'ai' && activeSection !== 'labs' && (

             <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
               <div className="border-b border-slate-200 pb-4">
                <h2 className="text-xl font-semibold text-slate-900">{SETTINGS_SECTIONS.find(s => s.id === activeSection)?.label}</h2>
                <p className="text-sm text-slate-500 mt-1">Configure your settings for this section.</p>
              </div>
              <div className="p-8 border border-dashed border-slate-200 rounded-xl bg-slate-50 text-center">
                <p className="text-slate-500">More configuration options for this section will be implemented shortly.</p>
              </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
