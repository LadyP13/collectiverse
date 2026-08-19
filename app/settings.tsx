import { router } from 'expo-router';
import { StyleSheet } from 'react-native';

import { BodyText, LcdScreen, PixelMenu, PixelText } from '@/components/pixel-ui';
import { providerLabel, shortAddress, useCollectiverse } from '@/context/collectiverse-context';
import { useGameBoyButtons, useGameBoyControls } from '@/context/gameboy-controls';
import { setSfxMuted, useSfxMuted } from '@/lib/sfx';
import { palette } from '@/lib/theme';

export default function SettingsScreen() {
  const { session, disconnect } = useCollectiverse();
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
        A pocket universe for the things you love. Preview wallets. Polygon mint lives in
        lib/mint/polygon.ts.
      </BodyText>

      {session ? (
        <>
          <PixelText style={styles.label}>WALLET</PixelText>
          <BodyText style={styles.value}>
            {providerLabel(session.provider).toUpperCase()}
            {session.isMock ? ' · PREVIEW' : ''}
          </BodyText>
          <BodyText style={styles.address}>{shortAddress(session.address)}</BodyText>
        </>
      ) : (
        <BodyText style={styles.value}>No wallet connected.</BodyText>
      )}

      <PixelMenu
        items={[
          ...(session
            ? [
                {
                  id: 'disconnect',
                  label: 'DISCONNECT',
                  onSelect: async () => {
                    await disconnect();
                    router.replace('/');
                  },
                },
              ]
            : [
                {
                  id: 'connect',
                  label: 'CONNECT WALLET',
                  onSelect: () => router.replace('/'),
                },
              ]),
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
    fontSize: 18,
    color: palette.white,
  },
  address: {
    fontSize: 18,
    color: palette.lavender,
    marginBottom: 8,
  },
});
