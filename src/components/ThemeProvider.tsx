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
    const body = window.document.body;
    root.classList.remove('light', 'dark');
    if (body) body.classList.remove('light', 'dark');

    let theme = settings.appearance?.theme || 'dark';
    
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = prefersDark ? 'dark' : 'light';
    }

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');

    if (theme === 'light') {
      root.classList.add('light');
      root.style.colorScheme = 'light';
      if (body) {
        body.classList.add('light');
        body.style.backgroundColor = '#f8fafc';
        body.style.color = '#0f172a';
      }
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#ffffff');
    } else {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
      if (body) {
        body.classList.add('dark');
        body.style.backgroundColor = '#000000';
        body.style.color = '#f8fafc';
      }
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#000000');
    }
  }, [settings?.appearance?.theme]);

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
