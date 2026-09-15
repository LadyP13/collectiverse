import { useMemo } from 'react';
import { Image } from 'expo-image';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { BodyText, LcdScreen, PixelButton } from '@/components/pixel-ui';
import { useCollectiverse } from '@/context/collectiverse-context';
import { useGameBoyButtons } from '@/context/gameboy-controls';
import { usePalette } from '@/context/theme-context';
import type { Palette } from '@/lib/theme';
import { collectiblesInDeck } from '@/lib/vault/storage';

export default function DeckScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { decks, collectibles } = useCollectiverse();
  const palette = usePalette();
  const styles = useMemo(() => makeStyles(palette), [palette]);
  const deck = decks.find((entry) => entry.id === id);

  const add = () => {
    if (!deck) return;
    router.push({ pathname: '/add-to-deck', params: { deckId: deck.id } });
  };

  useGameBoyButtons({
    a: add,
    b: () => router.back(),
  });

  if (!deck) {
    return <Redirect href="/my-vault" />;
  }

  const items = collectiblesInDeck(collectibles, deck.id);

  return (
    <LcdScreen title={deck.name.toUpperCase()}>
      <BodyText style={styles.icon}>{deck.icon}</BodyText>
      <BodyText style={styles.count}>
        {items.length} {items.length === 1 ? 'collectible' : 'collectibles'}
      </BodyText>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <BodyText style={styles.emptyTitle}>This deck is empty.</BodyText>
          <BodyText style={styles.emptyText}>Photograph something that belongs here.</BodyText>
        </View>
      ) : (
        <View style={styles.grid}>
          {items.map((item) => (
            <Pressable
              key={item.id}
              style={styles.card}
              onPress={() => router.push(`/collectible/${item.id}`)}
            >
              <Image source={{ uri: item.imageUri }} style={styles.image} />
              <BodyText style={styles.name} numberOfLines={1}>
                {item.name}
              </BodyText>
              <BodyText style={styles.meta}>#{item.tokenId ?? '—'}</BodyText>
            </Pressable>
          ))}
        </View>
      )}

      <PixelButton label="+ ADD TO THIS DECK" onPress={add} />
      <PixelButton ghost label="BACK TO VAULT" onPress={() => router.back()} />
    </LcdScreen>
  );
}

function makeStyles(palette: Palette) {
  return StyleSheet.create({
    icon: {
      fontSize: 28,
      textAlign: 'center',
    },
    count: {
      fontSize: 16,
      color: palette.lavender,
      textAlign: 'center',
    },
    empty: {
      alignItems: 'center',
      padding: 12,
      borderWidth: 2,
      borderColor: palette.border,
      backgroundColor: palette.card,
    },
    emptyTitle: {
      fontSize: 18,
      color: palette.white,
    },
    emptyText: {
      marginTop: 4,
      fontSize: 15,
      textAlign: 'center',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    card: {
      width: '47%',
      flexGrow: 1,
      padding: 6,
      borderWidth: 2,
      borderColor: palette.border,
      backgroundColor: palette.card,
    },
    image: {
      width: '100%',
      aspectRatio: 1,
      backgroundColor: palette.bg,
    },
    name: {
      marginTop: 4,
      fontSize: 14,
      color: palette.white,
    },
    meta: {
      fontSize: 13,
      color: palette.gold,
    },
  });
}
