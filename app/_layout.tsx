import { useEffect } from 'react';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { GameBoyShell } from '@/components/gameboy-shell';
import { CollectiverseProvider, useCollectiverse } from '@/context/collectiverse-context';
import { GameBoyControlsProvider } from '@/context/gameboy-controls';
import { AppThemeProvider, useAppTheme } from '@/context/theme-context';
import { hydrateSfx } from '@/lib/sfx';

export const unstable_settings = {
  anchor: 'index',
};

function RootStack() {
  const { ready } = useCollectiverse();
  const { ready: themeReady, palette } = useAppTheme();
  const [fontsLoaded, fontError] = useFonts({
    PressStart2P: require('../assets/fonts/PressStart2P-Regular.ttf'),
    VT323: require('../assets/fonts/VT323-Regular.ttf'),
  });

  useEffect(() => {
    void hydrateSfx();
  }, []);

  if (!ready || !themeReady || (!fontsLoaded && !fontError)) {
    return (
      <View style={[styles.boot, { backgroundColor: palette.chassis }]}>
        <ActivityIndicator color={palette.accent} size="large" />
      </View>
    );
  }

  return (
    <GameBoyControlsProvider>
      <GameBoyShell>
        <ThemeProvider value={DarkTheme}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: palette.lcd },
              animation: 'fade',
            }}
          />
        </ThemeProvider>
      </GameBoyShell>
      <StatusBar hidden />
    </GameBoyControlsProvider>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <CollectiverseProvider>
        <RootStack />
      </CollectiverseProvider>
    </AppThemeProvider>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
