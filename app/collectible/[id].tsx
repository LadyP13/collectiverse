import { useMemo } from 'react';
import { Image } from 'expo-image';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BodyText, LcdScreen, PixelButton, PixelCard, PixelText } from '@/components/pixel-ui';
import { useCollectiverse } from '@/context/collectiverse-context';
import { useGameBoyButtons } from '@/context/gameboy-controls';
import { usePalette } from '@/context/theme-context';
import type { Palette } from '@/lib/theme';

export default function CollectibleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { collectibles, decks } = useCollectiverse();
  const palette = usePalette();
  const styles = useMemo(() => makeStyles(palette), [palette]);
  const item = collectibles.find((entry) => entry.id === id);

  useGameBoyButtons({
    b: () => router.replace('/my-vault'),
    start: () => router.replace('/my-vault'),
  });

  if (!item) {
    return <Redirect href="/my-vault" />;
  }

  const deck = decks.find((entry) => entry.id === item.deckId);

  return (
    <LcdScreen title="COLLECTIBLE">
      <Image source={{ uri: item.imageUri }} style={styles.hero} />
      <PixelText style={styles.title}>{item.name}</PixelText>
      {deck ? (
        <BodyText style={styles.deck}>
          {deck.icon} {deck.name}
        </BodyText>
      ) : null}
      {item.description ? <BodyText style={styles.body}>{item.description}</BodyText> : null}

      <PixelCard>
        <MetaRow label="CONDITION" value={item.condition} styles={styles} />
        {item.year ? <MetaRow label="YEAR" value={item.year} styles={styles} /> : null}
        {item.setName ? <MetaRow label="SET" value={item.setName} styles={styles} /> : null}
        {item.notes ? <MetaRow label="NOTES" value={item.notes} styles={styles} /> : null}
      </PixelCard>

      <PixelCard>
        <PixelText style={styles.statusEyebrow}>COLLECTIVERSE V1</PixelText>
        <BodyText style={styles.statusTitle}>Saved to this collection</BodyText>
        <BodyText style={styles.statusNote}>
          This collectible has a local identity now. Wallet minting and trading can be added later.
        </BodyText>
      </PixelCard>

      <PixelButton ghost label="BACK TO VAULT" onPress={() => router.replace('/my-vault')} />
    </LcdScreen>
  );
}

function MetaRow({
  label,
  value,
  styles,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <View>
      <PixelText style={styles.metaLabel}>{label}</PixelText>
      <BodyText style={styles.metaValue}>{value}</BodyText>
    </View>
  );
}

function makeStyles(palette: Palette) {
  return StyleSheet.create({
    hero: {
      width: '100%',
      aspectRatio: 1,
      backgroundColor: palette.card,
    },
    title: {
      fontSize: 10,
      lineHeight: 16,
      color: palette.white,
      textAlign: 'center',
    },
    deck: {
      fontSize: 16,
      color: palette.lavender,
      textAlign: 'center',
    },
    body: {
      fontSize: 16,
      lineHeight: 20,
      textAlign: 'center',
    },
    statusEyebrow: {
      fontSize: 7,
      lineHeight: 12,
      color: palette.gold,
    },
    statusTitle: {
      fontSize: 20,
      color: palette.accent,
    },
    statusNote: {
      fontSize: 14,
      lineHeight: 18,
    },
    metaLabel: {
      fontSize: 7,
      lineHeight: 12,
      color: palette.gold,
    },
    metaValue: {
      fontSize: 17,
      color: palette.white,
    },
  });
}
