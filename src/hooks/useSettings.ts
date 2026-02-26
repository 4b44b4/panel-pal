/**
 * useSettings Hook
 * 
 * Manages app settings including simple/advanced mode
 */

import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = 'panel_pal_settings';

export interface AppSettings {
  simpleMode: boolean;
  hapticEnabled: boolean;
  autoLocation: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  simpleMode: true,
  hapticEnabled: true,
  autoLocation: true,
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      const updated = { ...settings, ...newSettings };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      setSettings(updated);
    } catch (error) {
      console.log('Error saving settings:', error);
    }
  };

  const toggleSimpleMode = () => updateSettings({ simpleMode: !settings.simpleMode });
  const toggleHaptic = () => updateSettings({ hapticEnabled: !settings.hapticEnabled });
  const toggleAutoLocation = () => updateSettings({ autoLocation: !settings.autoLocation });

  return {
    settings,
    isLoading,
    updateSettings,
    toggleSimpleMode,
    toggleHaptic,
    toggleAutoLocation,
  };
}