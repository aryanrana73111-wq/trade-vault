import os
import re

path = 'src/pages/Settings.tsx'
with open(path, 'r') as f:
    content = f.read()

new_update_section = """  const updateSection = (section: string, data: any) => {
    setLocalSettings(prev => {
      const currentSectionData = (prev as any)[section];
      return {
        ...prev,
        [section]: typeof currentSectionData === 'object' && currentSectionData !== null
          ? { ...currentSectionData, ...data }
          : data
      };
    });
    
    // For immediate appearance updates (theme), we need to update the ThemeProvider
    if (section === 'appearance' && data.theme) {
      setTimeout(() => {
        setLocalSettings(latest => {
          saveSettings(latest);
          updateSettings();
          return latest;
        });
      }, 0);
    }
  };"""

content = re.sub(r'  const updateSection = \(section: string, data: any\) => \{[\s\S]*?  \};\n', new_update_section + "\n", content)

with open(path, 'w') as f:
    f.write(content)

print("Settings Fixed Clean")
