import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

import type { GameBoyButtonId } from '@/lib/gameboy-layout';

const MUTE_KEY = 'collectiverse.sfx.muted';

const BEEP_SOURCES: Record<GameBoyButtonId, number> = {
  up: require('../assets/sfx/beep-up.wav'),
  down: require('../assets/sfx/beep-down.wav'),
  left: require('../assets/sfx/beep-left.wav'),
  right: require('../assets/sfx/beep-right.wav'),
  a: require('../assets/sfx/beep-a.wav'),
  b: require('../assets/sfx/beep-b.wav'),
  start: require('../assets/sfx/beep-start.wav'),
  select: require('../assets/sfx/beep-select.wav'),
  heart: require('../assets/sfx/beep-heart.wav'),
};

const dialupSource = require('../assets/sfx/dialup.wav');

const players = new Map<string, AudioPlayer>();
const listeners = new Set<(muted: boolean) => void>();

let muted = false;
let modeReady = false;
let modePromise: Promise<void> | null = null;

function notify() {
  listeners.forEach((listener) => listener(muted));
}

async function ensureMode() {
  if (modeReady) return;
  if (!modePromise) {
    modePromise = setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
      shouldPlayInBackground: false,
    })
      .then(() => {
        modeReady = true;
      })
      .catch(() => {
        modeReady = true;
      });
  }
  await modePromise;
}

function playerFor(key: string, source: number) {
  const existing = players.get(key);
  if (existing) return existing;
  const player = createAudioPlayer(source, { keepAudioSessionActive: true });
  player.volume = key === 'dialup' ? 0.55 : 0.7;
  players.set(key, player);
  return player;
}

async function replay(player: AudioPlayer) {
  try {
    await player.seekTo(0);
    player.play();
  } catch {
    // Web may block until a gesture; the next tap retries.
  }
}

export async function hydrateSfx() {
  await ensureMode();
  try {
    const raw = await AsyncStorage.getItem(MUTE_KEY);
    muted = raw === '1';
    notify();
  } catch {
    muted = false;
  }
}

export function isSfxMuted() {
  return muted;
}

export async function setSfxMuted(next: boolean) {
  muted = next;
  notify();
  if (next) stopDialup();
  try {
    await AsyncStorage.setItem(MUTE_KEY, next ? '1' : '0');
  } catch {
    // ignore
  }
}

export function useSfxMuted() {
  const [value, setValue] = useState(muted);
  useEffect(() => {
    listeners.add(setValue);
    setValue(muted);
    return () => {
      listeners.delete(setValue);
    };
  }, []);
  return value;
}

export function playBeep(id: GameBoyButtonId) {
  if (muted) return;
  void ensureMode().then(() => {
    const player = playerFor(id, BEEP_SOURCES[id]);
    void replay(player);
  });
}

export function playDialup() {
  if (muted) return;
  void ensureMode().then(() => {
    const player = playerFor('dialup', dialupSource);
    void replay(player);
  });
}

export function stopDialup() {
  const player = players.get('dialup');
  if (!player) return;
  try {
    player.pause();
  } catch {
    // ignore
  }
}
