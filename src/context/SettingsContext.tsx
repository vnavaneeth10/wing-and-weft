import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSettings, DEFAULTS, SiteSettings } from '../lib/settingsCache';

const SettingsContext = createContext<SiteSettings>(DEFAULTS);

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULTS);

  useEffect(() => {
    getSettings()
      .then(setSettings)
      .catch(() => {
        // keep defaults if everything fails
      });
  }, []);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
};