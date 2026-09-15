import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  isThemeId,
  nextTheme,
  palettes,
  themeAssets,
  type Palette,
  type ThemeId,
} from '@/lib/theme';

const THEME_KEY = 'collectiverse.theme.v1';

type AppThemeValue = {
  ready: boolean;
  themeId: ThemeId;
  palette: Palette;
  assets: (typeof themeAssets)[ThemeId];
  setThemeId: (id: ThemeId) => void;
  cycleTheme: () => ThemeId;
};

const AppThemeContext = createContext<AppThemeValue | null>(null);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>('blossom');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const raw = await AsyncStorage.getItem(THEME_KEY);
        if (!cancelled && isThemeId(raw)) {
          setThemeIdState(raw);
        }
      } catch {
        // Keep the blossom default if storage is unavailable.
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const setThemeId = useCallback((id: ThemeId) => {
    setThemeIdState(id);
    void AsyncStorage.setItem(THEME_KEY, id).catch(() => {});
  }, []);

  const cycleTheme = useCallback(() => {
    const next = nextTheme(themeId);
    setThemeId(next);
    return next;
  }, [setThemeId, themeId]);

  const value = useMemo(
    () => ({
      ready,
      themeId,
      palette: palettes[themeId],
      assets: themeAssets[themeId],
      setThemeId,
      cycleTheme,
    }),
    [cycleTheme, ready, setThemeId, themeId],
  );

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme() {
  const value = useContext(AppThemeContext);
  if (!value) {
    throw new Error('useAppTheme must be used inside AppThemeProvider');
  }
  return value;
}

export function usePalette() {
  return useAppTheme().palette;
}
