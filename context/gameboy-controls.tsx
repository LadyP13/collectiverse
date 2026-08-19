import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from 'react';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

import type { GameBoyButtonId } from '@/lib/gameboy-layout';
import { playBeep } from '@/lib/sfx';
import {
  isPartnershipWorldUnlocked,
  openPartnershipWorld,
  PARTNERSHIP_WORLD,
} from '@/lib/partnership-world/bridge';

export type GameBoyHandlers = Partial<Record<GameBoyButtonId, () => void>>;

type HandlerRef = MutableRefObject<GameBoyHandlers>;

type GameBoyControlsValue = {
  toast: string | null;
  press: (id: GameBoyButtonId) => void;
  register: (handlers: HandlerRef) => () => void;
  showToast: (message: string) => void;
};

const GameBoyControlsContext = createContext<GameBoyControlsValue | null>(null);

export function GameBoyControlsProvider({ children }: { children: ReactNode }) {
  const stack = useRef(new Set<HandlerRef>());
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1600);
  }, []);

  const register = useCallback((handlers: HandlerRef) => {
    stack.current.add(handlers);
    return () => {
      stack.current.delete(handlers);
    };
  }, []);

  const defaultPress = useCallback(
    (id: GameBoyButtonId) => {
      if (id === 'b') {
        if (router.canGoBack()) router.back();
        return;
      }
      if (id === 'start') {
        router.replace('/');
        return;
      }
      if (id === 'select') {
        if (isPartnershipWorldUnlocked()) {
          void openPartnershipWorld();
          return;
        }
        showToast(`${PARTNERSHIP_WORLD.name} · locked`);
        return;
      }
      if (id === 'heart') {
        showToast('Collect with love');
      }
    },
    [showToast],
  );

  const press = useCallback(
    (id: GameBoyButtonId) => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      playBeep(id);
      const handlers = [...stack.current];
      for (let i = handlers.length - 1; i >= 0; i -= 1) {
        const handler = handlers[i].current[id];
        if (handler) {
          handler();
          return;
        }
      }
      defaultPress(id);
    },
    [defaultPress],
  );

  const value = useMemo(
    () => ({ toast, press, register, showToast }),
    [press, register, showToast, toast],
  );

  return (
    <GameBoyControlsContext.Provider value={value}>{children}</GameBoyControlsContext.Provider>
  );
}

export function useGameBoyControls() {
  const value = useContext(GameBoyControlsContext);
  if (!value) {
    throw new Error('useGameBoyControls must be used inside GameBoyControlsProvider');
  }
  return value;
}

export function useGameBoyButtons(handlers: GameBoyHandlers) {
  const { register } = useGameBoyControls();
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => register(handlersRef), [register]);
}
