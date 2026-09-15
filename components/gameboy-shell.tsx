import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';

import { useAppTheme } from '@/context/theme-context';
import { useGameBoyControls } from '@/context/gameboy-controls';
import {
  BUTTON_HINTS,
  GAMEBOY_SIZE,
  HITBOXES,
  LCD_CORNER,
  LCD_RECT,
  containFit,
  type GameBoyButtonId,
} from '@/lib/gameboy-layout';
import type { Palette } from '@/lib/theme';
import { BodyText, PixelText } from '@/components/pixel-ui';

export function GameBoyShell({ children }: { children: ReactNode }) {
  const { press, toast } = useGameBoyControls();
  const { palette, assets } = useAppTheme();
  const styles = useMemo(() => makeStyles(palette), [palette]);
  const [box, setBox] = useState({ width: 0, height: 0 });
  const [down, setDown] = useState<GameBoyButtonId | null>(null);

  const fit = useMemo(
    () => containFit(box.width, box.height, GAMEBOY_SIZE.width, GAMEBOY_SIZE.height),
    [box.height, box.width],
  );

  const lcd = {
    left: fit.x + LCD_RECT.x * fit.w,
    top: fit.y + LCD_RECT.y * fit.h,
    width: LCD_RECT.w * fit.w,
    height: LCD_RECT.h * fit.h,
    borderRadius: LCD_CORNER * fit.w,
  };

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) return;

      const map: Record<string, GameBoyButtonId> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        z: 'a',
        Z: 'a',
        x: 'b',
        X: 'b',
        Enter: 'a',
        Escape: 'b',
        Backspace: 'b',
        ' ': 'start',
        Tab: 'select',
      };
      const id = map[event.key];
      if (!id) return;
      event.preventDefault();
      press(id);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [press]);

  return (
    <View
      style={styles.root}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setBox({ width, height });
      }}
    >
      {fit.w > 0 ? (
        <>
          <Image
            source={assets.chassis}
            style={{
              position: 'absolute',
              left: fit.x,
              top: fit.y,
              width: fit.w,
              height: fit.h,
            }}
            contentFit="fill"
            pointerEvents="none"
          />

          <View style={[styles.lcd, lcd]}>
            {children}
            <View pointerEvents="none" style={styles.scanlines} />
            {toast ? (
              <View pointerEvents="none" style={styles.toast}>
                <PixelText style={styles.toastText}>{toast}</PixelText>
              </View>
            ) : null}
          </View>

          {(Object.keys(HITBOXES) as GameBoyButtonId[]).map((id) => {
            const hit = HITBOXES[id];
            return (
              <Pressable
                key={id}
                accessibilityRole="button"
                accessibilityLabel={BUTTON_HINTS[id]}
                onPressIn={() => setDown(id)}
                onPressOut={() => setDown(null)}
                onPress={() => press(id)}
                style={{
                  position: 'absolute',
                  left: fit.x + hit.x * fit.w,
                  top: fit.y + hit.y * fit.h,
                  width: hit.w * fit.w,
                  height: hit.h * fit.h,
                }}
              >
                {down === id ? <View style={styles.pressFlash} /> : null}
              </Pressable>
            );
          })}
        </>
      ) : (
        <BodyText style={styles.loading}>LOADING...</BodyText>
      )}
    </View>
  );
}

function makeStyles(palette: Palette) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: palette.chassis,
      alignItems: 'center',
      justifyContent: 'center',
    },
    lcd: {
      position: 'absolute',
      overflow: 'hidden',
      backgroundColor: palette.lcd,
    },
    scanlines: {
      ...StyleSheet.absoluteFill,
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.06)',
      backgroundColor: 'transparent',
    },
    toast: {
      position: 'absolute',
      left: 10,
      right: 10,
      bottom: 10,
      paddingVertical: 6,
      paddingHorizontal: 8,
      backgroundColor: palette.lcd,
      borderWidth: 2,
      borderColor: palette.gold,
    },
    toastText: {
      fontSize: 7,
      lineHeight: 12,
      textAlign: 'center',
      color: palette.gold,
    },
    pressFlash: {
      flex: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.22)',
      borderRadius: 8,
    },
    loading: {
      fontSize: 18,
      color: palette.white,
    },
  });
}
