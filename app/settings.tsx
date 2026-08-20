import { router } from 'expo-router';
import { StyleSheet } from 'react-native';

import { BodyText, LcdScreen, PixelMenu, PixelText } from '@/components/pixel-ui';
import { useCollectiverse } from '@/context/collectiverse-context';
import { useGameBoyButtons, useGameBoyControls } from '@/context/gameboy-controls';
import { setSfxMuted, useSfxMuted } from '@/lib/sfx';
import { palette } from '@/lib/theme';

export default function SettingsScreen() {
  const { identity } = useCollectiverse();
  const { showToast } = useGameBoyControls();
  const muted = useSfxMuted();

  useGameBoyButtons({
    b: () => {
      if (router.canGoBack()) router.back();
      else router.replace('/');
    },
  });

  return (
    <LcdScreen title="SETTINGS" dpadScroll={false}>
      <BodyText style={styles.blurb}>
        A pocket universe for the things you love. Your V1 collection stays local to this device.
      </BodyText>

      {identity ? (
        <>
          <PixelText style={styles.label}>COLLECTIVERSE UID</PixelText>
          <BodyText style={styles.value}>{identity.uid}</BodyText>
          <BodyText style={styles.note}>Future wallet and trading features can attach here later.</BodyText>
        </>
      ) : null}

      <PixelMenu
        items={[
          {
            id: 'sound',
            label: muted ? 'SOUND: OFF' : 'SOUND: ON',
            onSelect: () => {
              void setSfxMuted(!muted);
              showToast(muted ? 'Beeps on' : 'Beeps off');
            },
          },
          {
            id: 'love',
            label: 'COLLECT WITH LOVE',
            onSelect: () => showToast('Always.'),
          },
          {
            id: 'back',
            label: 'BACK',
            onSelect: () => {
              if (router.canGoBack()) router.back();
              else router.replace('/');
            },
          },
        ]}
        hint="A SELECT   B BACK"
      />
    </LcdScreen>
  );
}

const styles = StyleSheet.create({
  blurb: {
    fontSize: 17,
    lineHeight: 20,
    color: palette.lavender,
  },
  label: {
    marginTop: 8,
    fontSize: 7,
    lineHeight: 12,
    color: palette.gold,
  },
  value: {
    fontSize: 15,
    color: palette.white,
  },
  note: {
    fontSize: 14,
    lineHeight: 18,
    color: palette.muted,
    marginTop: 4,
    marginBottom: 8,
  },
});
