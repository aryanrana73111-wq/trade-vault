import os

path = 'src/components/Layout.tsx'
with open(path, 'r') as f:
    content = f.read()

# Add Swords icon
content = content.replace("  Newspaper", "  Newspaper,\n  Swords")

# Add to navItems
# We want it probably near Dashboard or Analytics
content = content.replace("{ icon: LayoutDashboard, label: 'Dashboard', path: '/' },", "{ icon: LayoutDashboard, label: 'Dashboard', path: '/' },\n  { icon: Swords, label: 'Friends Arena', path: '/arena' },")

with open(path, 'w') as f:
    f.write(content)
