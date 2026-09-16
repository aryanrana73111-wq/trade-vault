import os

path = 'src/pages/Arena.tsx'
with open(path, 'r') as f:
    content = f.read()

dashboard_replace = """function ArenaDashboard({ arena, onBack }: { arena: Arena, onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'compare' | 'dna' | 'challenges' | 'feed'>('leaderboard');
  const membersList = Object.values(arena.members).sort((a, b) => (b.stats?.score || 0) - (a.stats?.score || 0));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 font-medium">
        <button onClick={onBack} className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Arenas</button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-900 dark:text-slate-100">{arena.name}</span>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
              {arena.name}
            </h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1"><Target className="w-4 h-4" /> {arena.competitionMode}</span>
              <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {membersList.length} Members</span>
              <span>Ends in {Math.max(0, Math.ceil((arena.endDate - Date.now()) / (1000 * 60 * 60 * 24)))} days</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg text-center">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Invite Code</p>
              <p className="text-lg font-mono font-bold text-slate-900 dark:text-slate-100 tracking-widest">{arena.code}</p>
            </div>
            <Button variant="secondary" onClick={() => {
              navigator.clipboard.writeText(`Join my TradeVault Arena! Code: ${arena.code}`);
              alert('Invite copied to clipboard');
            }}>
              Copy Invite
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2 mb-6 overflow-x-auto">
          {['leaderboard', 'compare', 'dna', 'challenges', 'feed'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap capitalize ${
                activeTab === tab 
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'leaderboard' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  <th className="pb-3 pr-4">Rank</th>
                  <th className="pb-3 pr-4">Trader</th>
                  <th className="pb-3 pr-4 text-right">Avg R</th>
                  <th className="pb-3 pr-4 text-right">Win Rate</th>
                  <th className="pb-3 pr-4 text-right">P&L</th>
                  <th className="pb-3 pr-4 text-right">Trades</th>
                  <th className="pb-3 text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {membersList.map((member, index) => (
                  <tr key={member.userId} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 pr-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        index === 1 ? 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300' :
                        index === 2 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                        'text-slate-400'
                      }`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="py-4 pr-4 font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs">
                        {member.userId.substring(0, 2).toUpperCase()}
                      </div>
                      {member.userId.substring(0, 8)}...
                    </td>
                    <td className="py-4 pr-4 text-right font-medium text-slate-900 dark:text-slate-100">{formatNumber(member.stats?.avgR || 0, 2)}R</td>
                    <td className="py-4 pr-4 text-right text-slate-600 dark:text-slate-400">{formatNumber(member.stats?.winRate || 0, 1)}%</td>
                    <td className={`py-4 pr-4 text-right font-medium ${
                      (member.stats?.netPnl || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {formatCurrency(member.stats?.netPnl || 0)}
                    </td>
                    <td className="py-4 pr-4 text-right text-slate-600 dark:text-slate-400">{member.stats?.tradeCount || 0}</td>
                    <td className="py-4 text-right font-bold text-indigo-600 dark:text-indigo-400">{formatNumber(member.stats?.score || 0, 1)}</td>
                  </tr>
                ))}
                {membersList.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No members have joined yet. Invite your friends!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'compare' && (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Trader Comparison</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Compare your performance against friends. Select a friend to view evidence-based analysis: "What are they doing better?"
            </p>
            <Button variant="outline" className="mt-6" disabled>Select Friend (Coming Soon)</Button>
          </div>
        )}

        {activeTab === 'dna' && (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Trading DNA</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              A visual profile based purely on measurable journal behavior.
            </p>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 opacity-50">
               {/* Placeholders */}
               <div className="p-4 border rounded-xl"><div className="text-sm">Risk Discipline</div></div>
               <div className="p-4 border rounded-xl"><div className="text-sm">Consistency</div></div>
               <div className="p-4 border rounded-xl"><div className="text-sm">Execution Quality</div></div>
               <div className="p-4 border rounded-xl"><div className="text-sm">Rule Adherence</div></div>
            </div>
          </div>
        )}

        {activeTab === 'challenges' && (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Mini Challenges</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Set private challenges like "Beat my Average R this week" or "Highest Rule Adherence."
            </p>
            <Button className="mt-6 flex items-center gap-2 mx-auto" disabled><Plus className="w-4 h-4"/> Create Challenge</Button>
          </div>
        )}

        {activeTab === 'feed' && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Activity Feed</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Private feed of shared milestones, newly shared trades, and challenge completions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
"""

content = content[:content.find("function ArenaDashboard")] + dashboard_replace

with open(path, 'w') as f:
    f.write(content)
