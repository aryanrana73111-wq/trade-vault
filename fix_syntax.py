import os
import re

path = 'src/pages/Settings.tsx'
with open(path, 'r') as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if "const updateSection = (section: string, data: any) => {" in line:
        skip = True
        new_lines.append("""  const updateSection = (section: string, data: any) => {
    setLocalSettings(prev => {
      const currentSectionData = (prev as any)[section];
      return {
        ...prev,
        [section]: typeof currentSectionData === 'object' && currentSectionData !== null
          ? { ...currentSectionData, ...data }
          : data
      };
    });
    
    if (section === 'appearance' && data.theme) {
      setTimeout(() => {
        setLocalSettings(latest => {
          saveSettings(latest);
          updateSettings();
          return latest;
        });
      }, 0);
    }
  };
""")
    if skip and "const filteredSections = SETTINGS_SECTIONS.filter(s =>" in line:
        skip = False
    
    if not skip:
        new_lines.append(line)

with open(path, 'w') as f:
    f.writelines(new_lines)

print("Syntax fixed")
