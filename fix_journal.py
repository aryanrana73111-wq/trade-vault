import os
import re

path = 'src/pages/Journal.tsx'
with open(path, 'r') as f:
    content = f.read()

old_logic = """      let pnl = 0;
      if (result === 'WIN') {
        const risk = trade.risk || 0;
        const rr = trade.rrRatio || 0;
        pnl = risk * rr;
      } else if (result === 'LOSS') {
        pnl = -(trade.risk || 0);
      } else if (result === 'PENDING') {
        pnl = 0;
      }
      updateTrade(id, { result, pnl: result === 'PENDING' ? undefined : pnl });"""

new_logic = """      let pnl = 0;
      if (result === 'WIN') {
        const risk = trade.risk || 0;
        const rr = trade.rrRatio || 0;
        pnl = risk * rr;
      } else if (result === 'LOSS') {
        pnl = -(trade.risk || 0);
      } else if (result === 'PENDING') {
        pnl = 0;
      }
      const rMultiple = result === 'PENDING' ? undefined : (trade.risk && trade.risk > 0 ? pnl / trade.risk : undefined);
      updateTrade(id, { result, pnl: result === 'PENDING' ? undefined : pnl, rMultiple });"""

content = content.replace(old_logic, new_logic)

with open(path, 'w') as f:
    f.write(content)

print("Journal fixed")
