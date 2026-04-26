import { useEffect, useState } from "react";
import { loadSettings, saveSettings } from "../services/storage";
import { defaultSettings, type AppSettings } from "../types/settings";

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  return {
    settings,
    setSettings,
    resetSettings: () => setSettings(defaultSettings)
  };
}
