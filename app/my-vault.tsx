import { useMemo } from 'react';
import { Image } from 'expo-image';
import { Redirect, router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { PartnershipWorldDoor } from '@/components/partnership-world-door';
import { BodyText, LcdScreen, PixelButton, PixelText } from '@/components/pixel-ui';
import { useCollectiverse } from '@/context/collectiverse-context';
import { useGameBoyButtons } from '@/context/gameboy-controls';
import { usePalette } from '@/context/theme-context';
import type { Palette } from '@/lib/theme';
import { collectiblesInDeck } from '@/lib/vault/storage';

export default function MyVaultScreen() {
  const { identity, decks, collectibles } = useCollectiverse();
  const palette = usePalette();
  const styles = useMemo(() => makeStyles(palette), [palette]);

  useGameBoyButtons({
    a: () => router.push('/add-to-deck'),
    b: () => router.replace('/'),
    start: () => router.replace('/'),
  });

  if (!identity) {
    return <Redirect href="/" />;
  }

  return (
    <LcdScreen title="MY VAULT">
      <Pressable onPress={() => router.push('/settings')}>
        <BodyText style={styles.identity}>COLLECTIVERSE · {identity.uid}</BodyText>
      </Pressable>

      <PixelText style={styles.section}>COLLECTION</PixelText>

      {collectibles.length === 0 ? (
        <View style={styles.empty}>
          <BodyText style={styles.emptyTitle}>Your collection is waiting.</BodyText>
          <BodyText style={styles.emptyText}>
            Photograph a collectible, tell its story, and save it to a deck.
          </BodyText>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {collectibles.map((item) => (
            <Pressable
              key={item.id}
              style={styles.thumb}
              onPress={() => router.push(`/collectible/${item.id}`)}
            >
              <Image source={{ uri: item.imageUri }} style={styles.thumbImage} />
              <BodyText style={styles.thumbName} numberOfLines={1}>
                {item.name}
              </BodyText>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <PixelButton label="+ ADD TO DECK" onPress={() => router.push('/add-to-deck')} />

      <PixelText style={styles.section}>MY DECKS</PixelText>
      <View style={styles.deckGrid}>
        {decks.map((deck) => {
          const count = collectiblesInDeck(collectibles, deck.id).length;
          return (
            <Pressable key={deck.id} style={styles.deck} onPress={() => router.push(`/deck/${deck.id}`)}>
              <BodyText style={styles.deckIcon}>{deck.icon}</BodyText>
              <BodyText style={styles.deckName} numberOfLines={1}>
                {deck.name}
              </BodyText>
              <BodyText style={styles.deckCount}>{count}</BodyText>
            </Pressable>
          );
        })}
      </View>
      <PixelButton
        ghost
        label="+ NEW DECK"
        onPress={() => router.push('/create-new-deck')}
      />

      <PixelText style={styles.section}>THE WIDER WORLD</PixelText>
      <PartnershipWorldDoor />
      <BodyText style={styles.hint}>A ADD   B MENU   SELECT P.WORLD</BodyText>
    </LcdScreen>
  );
}

function makeStyles(palette: Palette) {
  return StyleSheet.create({
    identity: {
      fontSize: 14,
      textAlign: 'center',
      color: palette.lavender,
    },
    section: {
      marginTop: 6,
      fontSize: 7,
      lineHeight: 12,
      color: palette.gold,
    },
    empty: {
      padding: 10,
      borderWidth: 2,
      borderColor: palette.border,
      backgroundColor: palette.card,
      gap: 4,
    },
    emptyTitle: {
      fontSize: 18,
      color: palette.white,
      textAlign: 'center',
    },
    emptyText: {
      fontSize: 16,
      textAlign: 'center',
    },
    row: {
      gap: 8,
      paddingRight: 4,
    },
    thumb: {
      width: 92,
      padding: 6,
      borderWidth: 2,
      borderColor: palette.border,
      backgroundColor: palette.card,
    },
    thumbImage: {
      width: '100%',
      aspectRatio: 1,
      backgroundColor: palette.bg,
    },
    thumbName: {
      marginTop: 4,
      fontSize: 14,
      color: palette.white,
    },
    deckGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    deck: {
      width: '47%',
      flexGrow: 1,
      padding: 8,
      borderWidth: 2,
      borderColor: palette.border,
      backgroundColor: palette.card,
    },
    deckIcon: {
      fontSize: 22,
    },
    deckName: {
      fontSize: 16,
      color: palette.white,
    },
    deckCount: {
      fontSize: 14,
      color: palette.muted,
    },
    hint: {
      marginTop: 4,
      fontSize: 14,
      textAlign: 'center',
      color: palette.gold,
    },
  });
}
