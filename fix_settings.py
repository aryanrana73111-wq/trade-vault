import os
import re

path = 'src/pages/Settings.tsx'
with open(path, 'r') as f:
    content = f.read()

# We want to change updateSection so it doesn't have side effects in setLocalSettings.

new_update_section = """
  const updateSection = (section: string, data: any) => {
    let newSettings: any;
    setLocalSettings(prev => {
      const currentSectionData = (prev as any)[section];
      const updated = {
        ...prev,
        [section]: typeof currentSectionData === 'object' && currentSectionData !== null
          ? { ...currentSectionData, ...data }
          : data
      };
      newSettings = updated;
      return updated;
    });

    // Schedule the side-effects outside of the setState callback
    setTimeout(() => {
      if (section === 'appearance' && data.theme && newSettings) {
        saveSettings(newSettings);
        updateSettings();
      }
    }, 0);
  };
"""

content = re.sub(r'  const updateSection = \(section: string, data: any\) => \{[\s\S]*?  \};\n', new_update_section, content)

with open(path, 'w') as f:
    f.write(content)

print("Settings Fixed")
