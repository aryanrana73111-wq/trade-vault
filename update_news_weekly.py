import os
import re

path = 'src/pages/NewsIntelligence.tsx'
with open(path, 'r') as f:
    content = f.read()

weekly_logic = """
  // Weekly Briefing Logic
  const currentWeekRange = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday
    // Calculate Monday of the current week
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    const formatOpts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${monday.toLocaleDateString(undefined, formatOpts)} – ${sunday.toLocaleDateString(undefined, formatOpts)}`;
  }, []);
"""

content = content.replace("const whatMattersNow = upcomingEvents.slice(0, 4);", weekly_logic + "\n  const whatMattersNow = upcomingEvents.slice(0, 4);")

header_weekly = """
            {/* Time Window Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="bg-blue-600/10 border border-blue-500/20 px-4 py-1.5 rounded-lg flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                <span className="text-sm font-semibold text-blue-300">Weekly Brief: {currentWeekRange}</span>
              </div>
              <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800 overflow-x-auto no-scrollbar">
                <TimeTab active={timeFilter === 'TODAY'} onClick={() => setTimeFilter('TODAY')} label="Today" />
                <TimeTab active={timeFilter === 'TOMORROW'} onClick={() => setTimeFilter('TOMORROW')} label="Tomorrow" />
                <TimeTab active={timeFilter === '7_DAYS'} onClick={() => setTimeFilter('7_DAYS')} label="7 Days" />
                <TimeTab active={timeFilter === '1_MONTH'} onClick={() => setTimeFilter('1_MONTH')} label="1 Month" />
                <TimeTab active={timeFilter === 'PREV_7_DAYS'} onClick={() => setTimeFilter('PREV_7_DAYS')} label="Previous 7 Days" />
              </div>
            </div>
"""

content = re.sub(r'\{\/\* Time Window Filters \*\/\}.*?<div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800 overflow-x-auto no-scrollbar">.*?<\/div>\s*<\/div>', header_weekly + '          </div>', content, flags=re.DOTALL)

with open(path, 'w') as f:
    f.write(content)

print("Updated Weekly Logic")
