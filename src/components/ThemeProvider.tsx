import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSettings, UserSettings } from '@/lib/settings';

interface ThemeContextType {
  settings: UserSettings;
  updateSettings: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(getSettings());

  const updateSettings = () => {
    setSettings(getSettings());
  };

  useEffect(() => {
    const handleSettingsUpdate = () => updateSettings();
    window.addEventListener('tradevault_settings_updated', handleSettingsUpdate);
    return () => window.removeEventListener('tradevault_settings_updated', handleSettingsUpdate);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    let theme = settings.appearance.theme;
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      theme = systemTheme;
    }

    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.add('light');
      root.style.colorScheme = 'light';
    }

    // Apply accent color variable if needed (optional)
  }, [settings.appearance.theme]);

  return (
    <ThemeContext.Provider value={{ settings, updateSettings }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
