import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { EducationalChartCard } from './EducationalChartCard';

export const EducationalDomainProgressChart: React.FC = () => {
  const [profileType, setProfileType] = useState<'balanced' | 'technical-heavy' | 'novice'>('technical-heavy');

  const domainData = React.useMemo(() => {
    if (profileType === 'novice') {
      return [
        { domain: 'Market Knowledge', score: 40, target: 80, color: '#3b82f6' },
        { domain: 'Trading Fundamentals', score: 35, target: 80, color: '#0ea5e9' },
        { domain: 'Technical Analysis', score: 30, target: 80, color: '#6366f1' },
        { domain: 'Risk Management', score: 15, target: 80, color: '#ef4444' },
        { domain: 'Execution', score: 20, target: 80, color: '#f59e0b' },
        { domain: 'Trading Psychology', score: 10, target: 80, color: '#8b5cf6' },
        { domain: 'Quantitative Analysis', score: 5, target: 80, color: '#10b981' },
        { domain: 'Portfolio Mgmt', score: 10, target: 80, color: '#ec4899' }
      ];
    }
    if (profileType === 'technical-heavy') {
      return [
        { domain: 'Market Knowledge', score: 75, target: 80, color: '#3b82f6' },
        { domain: 'Trading Fundamentals', score: 80, target: 80, color: '#0ea5e9' },
        { domain: 'Technical Analysis', score: 92, target: 80, color: '#6366f1' }, // Overdeveloped
        { domain: 'Risk Management', score: 35, target: 80, color: '#ef4444' }, // Dangerous gap!
        { domain: 'Execution', score: 60, target: 80, color: '#f59e0b' },
        { domain: 'Trading Psychology', score: 40, target: 80, color: '#8b5cf6' },
        { domain: 'Quantitative Analysis', score: 25, target: 80, color: '#10b981' },
        { domain: 'Portfolio Mgmt', score: 30, target: 80, color: '#ec4899' }
      ];
    }
    // Balanced institutional profile
    return [
      { domain: 'Market Knowledge', score: 85, target: 80, color: '#3b82f6' },
      { domain: 'Trading Fundamentals', score: 90, target: 80, color: '#0ea5e9' },
      { domain: 'Technical Analysis', score: 82, target: 80, color: '#6366f1' },
      { domain: 'Risk Management', score: 95, target: 80, color: '#10b981' },
      { domain: 'Execution', score: 88, target: 80, color: '#f59e0b' },
      { domain: 'Trading Psychology', score: 80, target: 80, color: '#8b5cf6' },
      { domain: 'Quantitative Analysis', score: 78, target: 80, color: '#10b981' },
      { domain: 'Portfolio Mgmt', score: 84, target: 80, color: '#ec4899' }
    ];
  }, [profileType]);

  const avgScore = Math.round(domainData.reduce((a, c) => a + c.score, 0) / domainData.length);
  const weakest = [...domainData].sort((a, b) => a.score - b.score)[0];
  const strongest = [...domainData].sort((a, b) => b.score - a.score)[0];

  return (
    <EducationalChartCard
      title="Domain Competency & Asymmetric Skill Matrix"
      subtitle="Auditing comprehensive trader proficiency across the 8 essential market domains"
      badge="Educational Example"
      category="SKILL ASSESSMENT"
      units="Domain Proficiency Score (0 - 100)"
      whatAmILookingAt="A horizontal bar chart showing your verified score in each core trading discipline against the institutional benchmark (80%). The simulation allows switching between a Novice Trader, a 'Technical-Heavy' Retail Trader (classic trap with 92% Technical Analysis but 35% Risk Management), and a Balanced Institutional Operator."
      whyItMatters="Trading is a weakest-link discipline. An exquisite technical chart pattern cannot save a trader who scores 35% in Risk Management or 40% in Behavioral Psychology. A single catastrophic loss destroys months of technical accuracy."
      commonMistake="Spending 90% of study time on technical indicator parameters while completely neglecting order routing latency, position sizing mathematics, and psychological tilt controls."
      metrics={[
        { label: 'Aggregate Mastery', value: `${avgScore} / 100`, color: avgScore >= 75 ? 'text-emerald-600' : 'text-amber-500', subtext: 'Composite Competency Index' },
        { label: 'Highest Proficiency', value: strongest.domain, color: 'text-blue-600 dark:text-blue-400', subtext: `${strongest.score}% Mastery` },
        { label: 'Critical Vulnerability', value: weakest.domain, color: 'text-rose-600', subtext: `${weakest.score}% (Requires Remediation)` },
        { label: 'Target Benchmark', value: '80%', subtext: 'Institutional Threshold' }
      ]}
      controls={
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Select Archetype:</span>
          {(['novice', 'technical-heavy', 'balanced'] as const).map(p => (
            <button
              key={p}
              onClick={() => setProfileType(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                profileType === p
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {p.replace('-', ' ')}
            </button>
          ))}
        </div>
      }
    >
      <div className="h-72 sm:h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={domainData}
            margin={{ top: 10, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={v => `${v}%`} />
            <YAxis
              type="category"
              dataKey="domain"
              tick={{ fontSize: 11, fill: '#64748b' }}
              width={100}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#f8fafc' }}
              formatter={(value: any, name: any, item: any) => [
                `${value}% (${value < 50 ? 'Critical Vulnerability' : value < 80 ? 'Developing' : 'Mastered'})`,
                'Proficiency'
              ]}
            />
            <Bar dataKey="score" radius={[0, 6, 6, 0]}>
              {domainData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.score < 50 ? '#ef4444' : entry.score < 80 ? '#f59e0b' : '#10b981'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </EducationalChartCard>
  );
};
