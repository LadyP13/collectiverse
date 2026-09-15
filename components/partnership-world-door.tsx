import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BodyText, PixelText } from '@/components/pixel-ui';
import { useGameBoyControls } from '@/context/gameboy-controls';
import { usePalette } from '@/context/theme-context';
import {
  isPartnershipWorldUnlocked,
  openPartnershipWorld,
  PARTNERSHIP_WORLD,
} from '@/lib/partnership-world/bridge';
import type { Palette } from '@/lib/theme';

export function PartnershipWorldDoor() {
  const unlocked = isPartnershipWorldUnlocked();
  const { showToast } = useGameBoyControls();
  const palette = usePalette();
  const styles = useMemo(() => makeStyles(palette), [palette]);

  const onPress = async () => {
    if (!unlocked) {
      showToast(`${PARTNERSHIP_WORLD.name} · locked`);
      return;
    }
    await openPartnershipWorld();
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.door, pressed && styles.pressed]}
      onPress={onPress}
    >
      <PixelText style={styles.lock}>{unlocked ? '*' : 'X'}</PixelText>
      <View style={styles.copy}>
        <PixelText style={styles.label}>
          {unlocked ? 'ENTER' : 'LOCKED'} · P.WORLD
        </PixelText>
        <BodyText style={styles.title}>
          {unlocked ? 'Open PartnershipWorld' : PARTNERSHIP_WORLD.comingSoonLabel}
        </BodyText>
        <BodyText style={styles.tagline}>{PARTNERSHIP_WORLD.tagline}</BodyText>
      </View>
    </Pressable>
  );
}

function makeStyles(palette: Palette) {
  return StyleSheet.create({
    door: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      padding: 10,
      borderWidth: 2,
      borderColor: palette.borderStrong,
      backgroundColor: palette.card,
      borderStyle: 'dashed',
    },
    pressed: {
      opacity: 0.75,
    },
    lock: {
      fontSize: 10,
      color: palette.gold,
    },
    copy: {
      flex: 1,
    },
    label: {
      fontSize: 7,
      lineHeight: 12,
      color: palette.gold,
    },
    title: {
      fontSize: 18,
      color: palette.white,
    },
    tagline: {
      fontSize: 15,
      color: palette.muted,
    },
  });
}
