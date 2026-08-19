import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { BodyText, LcdScreen, PixelButton, PixelChip, PixelField } from '@/components/pixel-ui';
import { useCollectiverse } from '@/context/collectiverse-context';
import { useGameBoyButtons } from '@/context/gameboy-controls';
import { DECK_ICONS, palette } from '@/lib/theme';

export default function CreateNewDeckScreen() {
  const { createDeck } = useCollectiverse();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState<(typeof DECK_ICONS)[number]>(DECK_ICONS[0]);
  const [saving, setSaving] = useState(false);

  const canSave = name.trim().length > 0 && !saving;

  const onCreate = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await createDeck(name, icon);
      router.back();
    } finally {
      setSaving(false);
    }
  };

  useGameBoyButtons({
    a: () => {
      void onCreate();
    },
    b: () => router.back(),
  });

  return (
    <LcdScreen title="NEW DECK">
      <BodyText style={styles.subtitle}>Give your collection a home.</BodyText>
      <PixelField
        label="NAME"
        placeholder="Deck name..."
        value={name}
        onChangeText={setName}
      />
      <BodyText style={styles.iconLabel}>ICON</BodyText>
      <View style={styles.iconRow}>
        {DECK_ICONS.map((item) => (
          <PixelChip key={item} label={item} on={item === icon} onPress={() => setIcon(item)} />
        ))}
      </View>
      <PixelButton
        label={saving ? 'CREATING...' : 'CREATE DECK'}
        onPress={() => void onCreate()}
        disabled={!canSave}
      />
      <PixelButton ghost label="CANCEL" onPress={() => router.back()} />
    </LcdScreen>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 17,
    textAlign: 'center',
    color: palette.lavender,
  },
  iconLabel: {
    fontSize: 14,
    color: palette.gold,
  },
  iconRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
});
