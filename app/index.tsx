import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';

import { BodyText, PixelMenu, PixelText } from '@/components/pixel-ui';
import { useCollectiverse } from '@/context/collectiverse-context';
import { useGameBoyButtons, useGameBoyControls } from '@/context/gameboy-controls';
import { useAppTheme } from '@/context/theme-context';
import {
  isPartnershipWorldUnlocked,
  openPartnershipWorld,
  PARTNERSHIP_WORLD,
} from '@/lib/partnership-world/bridge';
import { playDialup, stopDialup } from '@/lib/sfx';
import { THEME_LABELS, type Palette } from '@/lib/theme';

type HomeView = 'dial' | 'boot' | 'menu';

const DIAL_MS = 5200;
const STATUS_LINES = [
  { at: 0, text: 'ATDT 1-800-VAULT' },
  { at: 700, text: 'DIALING.....' },
  { at: 1800, text: 'RINGING.....' },
  { at: 2800, text: 'HANDSHAKE...' },
  { at: 4800, text: 'CONNECTED!' },
] as const;

let hasBooted = false;

function statusFor(elapsed: number) {
  let text: string = STATUS_LINES[0].text;
  for (const line of STATUS_LINES) {
    if (elapsed >= line.at) text = line.text;
  }
  return text;
}

export default function SplashScreen() {
  const { ready, identity } = useCollectiverse();
  const { showToast } = useGameBoyControls();
  const { themeId, cycleTheme, palette, assets } = useAppTheme();
  const styles = useMemo(() => makeStyles(palette), [palette]);
  const [view, setView] = useState<HomeView>(hasBooted ? 'menu' : 'dial');
  const [blink, setBlink] = useState(true);
  const [dialing, setDialing] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const finishTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const finishDial = () => {
    if (finishTimer.current) clearTimeout(finishTimer.current);
    if (tickTimer.current) clearInterval(tickTimer.current);
    stopDialup();
    hasBooted = true;
    setView('boot');
  };

  const startDial = () => {
    if (dialing || hasBooted) return;
    setDialing(true);
    setElapsed(0);
    playDialup();
    const started = Date.now();
    tickTimer.current = setInterval(() => {
      setElapsed(Date.now() - started);
    }, 120);
    finishTimer.current = setTimeout(finishDial, DIAL_MS);
  };

  useEffect(() => {
    return () => {
      if (finishTimer.current) clearTimeout(finishTimer.current);
      if (tickTimer.current) clearInterval(tickTimer.current);
    };
  }, []);

  useEffect(() => {
    if (view !== 'dial' || Platform.OS === 'web') return;
    const timer = setTimeout(startDial, 200);
    return () => clearTimeout(timer);
    // startDial is stable enough for first mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  useEffect(() => {
    if (view === 'dial' && !dialing) {
      const pulse = setInterval(() => setBlink((on) => !on), 520);
      return () => clearInterval(pulse);
    }
    if (view !== 'boot') {
      if (view !== 'dial') hasBooted = true;
      return;
    }
    const pulse = setInterval(() => setBlink((on) => !on), 520);
    const auto = setTimeout(() => setView('menu'), 2200);
    return () => {
      clearInterval(pulse);
      clearTimeout(auto);
    };
  }, [dialing, view]);

  useGameBoyButtons(
    view === 'dial'
      ? {
          a: () => (dialing ? finishDial() : startDial()),
          start: () => (dialing ? finishDial() : startDial()),
        }
      : view === 'boot'
        ? {
            a: () => setView('menu'),
            start: () => setView('menu'),
          }
        : {
            start: () => {
              if (ready && identity) router.replace('/my-vault');
            },
          },
  );

  if (view === 'dial') {
    const blocks = Math.min(8, Math.max(0, Math.floor((elapsed / DIAL_MS) * 8)));
    const bar = `${'#'.repeat(blocks)}${'-'.repeat(8 - blocks)}`;
    return (
      <Pressable style={styles.dial} onPress={() => (dialing ? finishDial() : startDial())}>
        <PixelText style={styles.dialTitle}>COLLECTIVERSE</PixelText>
        <BodyText style={styles.dialSub}>est. a pocket universe</BodyText>
        {dialing ? (
          <>
            <PixelText style={styles.dialStatus}>{statusFor(elapsed)}</PixelText>
            <PixelText style={styles.dialBar}>[{bar}]</PixelText>
            <BodyText style={styles.dialHint}>LOADING...</BodyText>
          </>
        ) : (
          <>
            <PixelText style={styles.dialStatus}>NO CARRIER</PixelText>
            <BodyText style={styles.dialHint}>TAP TO DIAL{blink ? '_' : ''}</BodyText>
          </>
        )}
      </Pressable>
    );
  }

  if (view === 'boot') {
    return (
      <Pressable style={styles.boot} onPress={() => setView('menu')}>
        <Image source={assets.boot} style={StyleSheet.absoluteFill} contentFit="cover" />
        {blink ? <PixelText style={styles.pressStart}>PRESS START</PixelText> : null}
      </Pressable>
    );
  }

  return (
    <View style={styles.screen}>
      <Image source={assets.boot} style={StyleSheet.absoluteFill} contentFit="cover" />
      <View style={styles.dim} />
      <PixelMenu
        items={[
          {
            id: 'vault',
            label: 'MY VAULT',
            disabled: !ready,
            onSelect: () => {
              if (ready && identity) router.push('/my-vault');
            },
          },
          {
            id: 'pw',
            label: 'P. WORLD',
            onSelect: () => {
              if (isPartnershipWorldUnlocked()) {
                void openPartnershipWorld();
                return;
              }
              showToast(`${PARTNERSHIP_WORLD.name} · locked`);
            },
          },
          {
            id: 'theme',
            label: `THEME: ${THEME_LABELS[themeId]}`,
            onSelect: () => {
              const next = cycleTheme();
              showToast(`${THEME_LABELS[next]} MODE`);
            },
          },
          { id: 'settings', label: 'SETTINGS', onSelect: () => router.push('/settings') },
        ]}
        hint="D-PAD MOVE   A SELECT"
      />
    </View>
  );
}

function makeStyles(palette: Palette) {
  return StyleSheet.create({
    dial: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
      backgroundColor: palette.lcd,
      gap: 10,
    },
    dialTitle: {
      fontSize: 10,
      lineHeight: 16,
      color: palette.accent,
      textAlign: 'center',
    },
    dialSub: {
      fontSize: 16,
      color: palette.muted,
      marginBottom: 16,
    },
    dialStatus: {
      fontSize: 8,
      lineHeight: 14,
      color: palette.gold,
      textAlign: 'center',
    },
    dialBar: {
      fontSize: 8,
      lineHeight: 14,
      color: palette.lavender,
      letterSpacing: 1,
    },
    dialHint: {
      marginTop: 10,
      fontSize: 18,
      color: palette.gold,
    },
    boot: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
      backgroundColor: palette.lcd,
    },
    pressStart: {
      marginBottom: 18,
      fontSize: 10,
      lineHeight: 16,
      color: palette.gold,
    },
    screen: {
      flex: 1,
      justifyContent: 'flex-end',
      padding: 12,
      gap: 8,
      backgroundColor: palette.lcd,
    },
    dim: {
      ...StyleSheet.absoluteFill,
      backgroundColor: 'rgba(8, 4, 24, 0.22)',
    },
  });
}
