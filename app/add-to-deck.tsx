import { useMemo, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';

import {
  BodyText,
  LcdScreen,
  PixelButton,
  PixelChip,
  PixelField,
  PixelText,
} from '@/components/pixel-ui';
import { useCollectiverse } from '@/context/collectiverse-context';
import { useGameBoyButtons } from '@/context/gameboy-controls';
import { usePalette } from '@/context/theme-context';
import { pickCollectiblePhoto, takeCollectiblePhoto } from '@/lib/capture-photo';
import { CONDITIONS, type Condition, type Palette } from '@/lib/theme';

export default function AddCollectibleScreen() {
  const params = useLocalSearchParams<{ deckId?: string | string[] }>();
  const incomingDeckId = Array.isArray(params.deckId) ? params.deckId[0] : params.deckId;
  const { identity, decks, saveCollectible } = useCollectiverse();
  const palette = usePalette();
  const styles = useMemo(() => makeStyles(palette), [palette]);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [year, setYear] = useState('');
  const [series, setSeries] = useState('');
  const [notes, setNotes] = useState('');
  const [condition, setCondition] = useState<Condition>('Near Mint');
  const [deckId, setDeckId] = useState(incomingDeckId ?? decks[0]?.id ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = useMemo(
    () => Boolean(imageUri && name.trim() && deckId && !saving),
    [deckId, imageUri, name, saving],
  );

  const capture = async (fromLibrary: boolean) => {
    const uri = fromLibrary ? await pickCollectiblePhoto() : await takeCollectiblePhoto();
    if (uri) setImageUri(uri);
  };

  const onSave = async () => {
    if (!canSave || !imageUri) return;
    setError(null);
    setSaving(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const saved = await saveCollectible({
        deckId,
        name,
        description,
        imageUri,
        year,
        setName: series,
        condition,
        notes,
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace(`/collectible/${saved.id}`);
    } catch {
      setError('Save failed. Try again.');
    } finally {
      setSaving(false);
    }
  };

  useGameBoyButtons({
    a: () => {
      void onSave();
    },
    b: () => router.back(),
  });

  if (!identity) {
    return <Redirect href="/" />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LcdScreen title="ADD TO DECK">
        <BodyText style={styles.subtitle}>Capture it. Tell its story. Save it.</BodyText>

        <View style={styles.cameraFrame}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.preview} />
          ) : (
            <>
              <PixelText style={styles.cameraText}>PHOTO</PixelText>
              <BodyText style={styles.cameraHint}>Your collectible appears here.</BodyText>
            </>
          )}
        </View>

        <View style={styles.photoRow}>
          <View style={styles.flex}>
            <PixelButton label="TAKE" onPress={() => void capture(false)} />
          </View>
          <View style={styles.flex}>
            <PixelButton ghost label="CHOOSE" onPress={() => void capture(true)} />
          </View>
        </View>

        <PixelField
          label="NAME"
          placeholder="Charizard holo, amethyst..."
          value={name}
          onChangeText={setName}
        />
        <PixelField
          label="DESCRIPTION"
          placeholder="What makes this one special?"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <PixelField
          label="YEAR"
          placeholder="1999"
          value={year}
          onChangeText={setYear}
          keyboardType="number-pad"
        />
        <PixelField
          label="SET / SERIES"
          placeholder="Base Set, quartz family..."
          value={series}
          onChangeText={setSeries}
        />

        <PixelText style={styles.fieldLabel}>CONDITION</PixelText>
        <View style={styles.chipRow}>
          {CONDITIONS.map((item) => (
            <PixelChip
              key={item}
              label={item}
              on={item === condition}
              onPress={() => setCondition(item)}
            />
          ))}
        </View>

        <PixelText style={styles.fieldLabel}>DECK</PixelText>
        <View style={styles.chipRow}>
          {decks.map((deck) => (
            <PixelChip
              key={deck.id}
              label={`${deck.icon} ${deck.name}`}
              on={deck.id === deckId}
              onPress={() => setDeckId(deck.id)}
            />
          ))}
        </View>

        <PixelField
          label="NOTES"
          placeholder="Where you found it..."
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        {error ? <BodyText style={styles.error}>{error}</BodyText> : null}

        {saving ? (
          <ActivityIndicator color={palette.accent} />
        ) : (
          <PixelButton label="SAVE TO COLLECTION" onPress={() => void onSave()} disabled={!canSave} />
        )}
        <BodyText style={styles.saveHint}>Saved locally · A SAVE · B BACK</BodyText>
        <PixelButton ghost label="BACK TO VAULT" onPress={() => router.back()} />
      </LcdScreen>
    </KeyboardAvoidingView>
  );
}

function makeStyles(palette: Palette) {
  return StyleSheet.create({
    flex: {
      flex: 1,
    },
    subtitle: {
      fontSize: 16,
      textAlign: 'center',
      color: palette.lavender,
    },
    cameraFrame: {
      width: '100%',
      aspectRatio: 1.2,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: palette.borderStrong,
      backgroundColor: palette.card,
      borderStyle: 'dashed',
    },
    preview: {
      width: '100%',
      height: '100%',
    },
    cameraText: {
      fontSize: 10,
      lineHeight: 16,
      color: palette.gold,
    },
    cameraHint: {
      marginTop: 6,
      fontSize: 15,
      color: palette.muted,
      textAlign: 'center',
    },
    photoRow: {
      flexDirection: 'row',
      gap: 8,
    },
    fieldLabel: {
      marginTop: 4,
      fontSize: 7,
      lineHeight: 12,
      color: palette.gold,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    saveHint: {
      fontSize: 14,
      textAlign: 'center',
      color: palette.muted,
    },
    error: {
      color: palette.accent,
      textAlign: 'center',
      fontSize: 16,
    },
  });
}
