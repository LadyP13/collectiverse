import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { useGameBoyButtons } from '@/context/gameboy-controls';
import { playBeep } from '@/lib/sfx';
import { fonts, palette } from '@/lib/theme';

export function PixelText({
  children,
  style,
  numberOfLines,
}: {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}) {
  return (
    <Text style={[styles.pixel, style]} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
}

export function BodyText({
  children,
  style,
  numberOfLines,
}: {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}) {
  return (
    <Text style={[styles.body, style]} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
}

export function LcdScreen({
  title,
  children,
  footer,
  scroll = true,
  dpadScroll = true,
}: {
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  scroll?: boolean;
  dpadScroll?: boolean;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const offset = useRef(0);

  useGameBoyButtons(
    dpadScroll && scroll
      ? {
          up: () =>
            scrollRef.current?.scrollTo({
              y: Math.max(0, offset.current - 72),
              animated: true,
            }),
          down: () =>
            scrollRef.current?.scrollTo({
              y: offset.current + 72,
              animated: true,
            }),
        }
      : {},
  );

  return (
    <View style={styles.lcd}>
      {title ? (
        <View style={styles.titleBar}>
          <PixelText style={styles.titleText}>{title}</PixelText>
        </View>
      ) : null}
      {scroll ? (
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onScroll={(event) => {
            offset.current = event.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, styles.staticContent]}>{children}</View>
      )}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}

export type PixelMenuItem = {
  id: string;
  label: string;
  disabled?: boolean;
  onSelect: () => void;
};

export function PixelMenu({
  items,
  hint,
}: {
  items: PixelMenuItem[];
  hint?: string;
}) {
  const enabled = items.map((item, index) => ({ item, index })).filter((entry) => !entry.item.disabled);
  const [selected, setSelected] = useState(enabled[0]?.index ?? 0);

  useEffect(() => {
    if (items[selected]?.disabled) {
      setSelected(enabled[0]?.index ?? 0);
    }
  }, [enabled, items, selected]);

  const move = (dir: 1 | -1) => {
    if (enabled.length === 0) return;
    const current = Math.max(
      0,
      enabled.findIndex((entry) => entry.index === selected),
    );
    const next = enabled[(current + dir + enabled.length) % enabled.length];
    setSelected(next.index);
  };

  useGameBoyButtons({
    up: () => move(-1),
    down: () => move(1),
    a: () => {
      const item = items[selected];
      if (item && !item.disabled) item.onSelect();
    },
  });

  return (
    <View style={styles.menu}>
      <View style={styles.menuInner}>
        {items.map((item, index) => {
          const on = index === selected;
          return (
            <Pressable
              key={item.id}
              onPress={() => {
                setSelected(index);
                if (!item.disabled) {
                  playBeep('a');
                  item.onSelect();
                }
              }}
              style={[
                styles.menuRow,
                on && styles.menuRowOn,
                item.disabled && styles.menuRowDisabled,
              ]}
            >
              <PixelText style={[styles.menuCursor, !on && styles.menuCursorOff]}>
                {on ? '>' : ' '}
              </PixelText>
              <PixelText
                style={[
                  styles.menuLabel,
                  on && styles.menuLabelOn,
                  item.disabled && styles.menuLabelDisabled,
                ]}
                numberOfLines={1}
              >
                {item.label}
              </PixelText>
            </Pressable>
          );
        })}
      </View>
      {hint ? <BodyText style={styles.hint}>{hint}</BodyText> : null}
    </View>
  );
}

export function PixelButton({
  label,
  onPress,
  disabled,
  ghost,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  ghost?: boolean;
}) {
  return (
    <Pressable
      onPress={() => {
        playBeep(ghost ? 'b' : 'a');
        onPress();
      }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        ghost && styles.buttonGhost,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <PixelText style={[styles.buttonText, ghost && styles.buttonGhostText]}>{label}</PixelText>
    </Pressable>
  );
}

export function PixelField({
  label,
  ...inputProps
}: { label: string } & TextInputProps) {
  return (
    <View style={styles.field}>
      <PixelText style={styles.fieldLabel}>{label}</PixelText>
      <TextInput
        placeholderTextColor={palette.muted}
        {...inputProps}
        style={[styles.input, inputProps.multiline && styles.multiline, inputProps.style]}
      />
    </View>
  );
}

export function PixelChip({
  label,
  on,
  onPress,
}: {
  label: string;
  on?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={() => {
        playBeep('select');
        onPress();
      }}
      style={[styles.chip, on && styles.chipOn]}
    >
      <BodyText style={[styles.chipText, on && styles.chipTextOn]}>{label}</BodyText>
    </Pressable>
  );
}

export function PixelCard({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  pixel: {
    fontFamily: fonts.pixel,
    color: palette.white,
    includeFontPadding: false,
  },
  body: {
    fontFamily: fonts.body,
    color: palette.body,
    includeFontPadding: false,
  },
  lcd: {
    flex: 1,
    backgroundColor: palette.lcd,
  },
  flex: {
    flex: 1,
  },
  titleBar: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: palette.accent,
    borderBottomWidth: 3,
    borderBottomColor: palette.menuBorderDark,
  },
  titleText: {
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center',
    color: palette.white,
  },
  scrollContent: {
    padding: 10,
    paddingBottom: 18,
    gap: 8,
  },
  staticContent: {
    padding: 10,
  },
  footer: {
    padding: 8,
    borderTopWidth: 2,
    borderTopColor: palette.borderStrong,
  },
  menu: {
    width: '100%',
  },
  menuInner: {
    borderWidth: 3,
    borderColor: palette.menuBorder,
    backgroundColor: palette.menu,
    padding: 4,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 28,
    paddingHorizontal: 6,
    gap: 6,
  },
  menuRowOn: {
    backgroundColor: palette.selectBar,
  },
  menuRowDisabled: {
    opacity: 0.45,
  },
  menuCursor: {
    width: 12,
    fontSize: 10,
    lineHeight: 16,
    color: palette.cursor,
  },
  menuCursorOff: {
    color: 'transparent',
  },
  menuLabel: {
    flex: 1,
    fontSize: 8,
    lineHeight: 14,
    color: palette.menuInk,
  },
  menuLabelOn: {
    color: palette.white,
  },
  menuLabelDisabled: {
    color: palette.menuMuted,
  },
  hint: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 18,
    textAlign: 'center',
    color: palette.gold,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: 12,
    backgroundColor: palette.accent,
    borderWidth: 2,
    borderColor: palette.menuBorderDark,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
    borderColor: palette.borderStrong,
  },
  buttonText: {
    fontSize: 8,
    lineHeight: 14,
    color: palette.white,
  },
  buttonGhostText: {
    color: palette.lavender,
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ translateY: 1 }],
  },
  field: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 7,
    lineHeight: 12,
    color: palette.gold,
  },
  input: {
    minHeight: 36,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: palette.borderStrong,
    backgroundColor: palette.card,
    color: palette.white,
    fontFamily: fonts.body,
    fontSize: 18,
  },
  multiline: {
    minHeight: 68,
    textAlignVertical: 'top',
  },
  chip: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: palette.border,
    backgroundColor: palette.card,
  },
  chipOn: {
    borderColor: palette.accent,
    backgroundColor: '#2a1238',
  },
  chipText: {
    fontSize: 16,
    color: palette.lavender,
  },
  chipTextOn: {
    color: palette.white,
  },
  card: {
    padding: 10,
    borderWidth: 2,
    borderColor: palette.border,
    backgroundColor: palette.card,
    gap: 6,
  },
});
