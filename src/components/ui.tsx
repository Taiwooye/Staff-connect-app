import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { createContext, type ReactNode, useContext } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  type StyleProp,
  StyleSheet,
  Text,
  type TextProps,
  View,
  type ViewStyle,
} from 'react-native';

import type { IconName } from '@/lib/catalog';
import { clientPalette, type Palette, radius } from '@/lib/theme';

const PaletteContext = createContext<Palette>(clientPalette);

export function PaletteProvider({ palette, children }: { palette: Palette; children: ReactNode }) {
  return <PaletteContext.Provider value={palette}>{children}</PaletteContext.Provider>;
}

export function usePalette() {
  return useContext(PaletteContext);
}

export function tap(style: 'light' | 'medium' | 'heavy' | 'success' = 'light') {
  if (Platform.OS === 'web') return;
  if (style === 'success') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    return;
  }
  const map = {
    light: Haptics.ImpactFeedbackStyle.Light,
    medium: Haptics.ImpactFeedbackStyle.Medium,
    heavy: Haptics.ImpactFeedbackStyle.Heavy,
  } as const;
  Haptics.impactAsync(map[style]).catch(() => {});
}

type Variant = 'display' | 'title' | 'heading' | 'body' | 'label' | 'caption' | 'overline';

const textStyles = StyleSheet.create({
  display: { fontSize: 34, lineHeight: 40, fontWeight: '800', letterSpacing: -0.8 },
  title: { fontSize: 26, lineHeight: 32, fontWeight: '800', letterSpacing: -0.5 },
  heading: { fontSize: 18, lineHeight: 24, fontWeight: '700', letterSpacing: -0.2 },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  label: { fontSize: 15, lineHeight: 20, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
  overline: { fontSize: 11, lineHeight: 14, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
});

export function T({
  variant = 'body',
  muted,
  color,
  style,
  ...props
}: TextProps & { variant?: Variant; muted?: boolean; color?: string }) {
  const p = usePalette();
  return (
    <Text
      {...props}
      style={[textStyles[variant], { color: color ?? (muted ? p.textMuted : p.text) }, style]}
    />
  );
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  loading,
  style,
  size = 'lg',
}: {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  size?: 'lg' | 'md';
}) {
  const p = usePalette();
  const bg =
    variant === 'primary'
      ? p.accent
      : variant === 'secondary'
        ? p.surfaceAlt
        : variant === 'danger'
          ? p.danger
          : 'transparent';
  const fg = variant === 'primary' ? p.accentText : variant === 'danger' ? '#fff' : p.text;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={() => {
        tap('light');
        onPress?.();
      }}
      style={({ pressed }) => [
        {
          backgroundColor: bg,
          height: size === 'lg' ? 56 : 44,
          borderRadius: radius.md,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={20} color={fg} />}
          <Text style={{ color: fg, fontSize: size === 'lg' ? 17 : 15, fontWeight: '700' }}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const p = usePalette();
  return (
    <View
      style={[
        {
          backgroundColor: p.surface,
          borderRadius: radius.lg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: p.border,
          padding: 16,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  icon,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
}) {
  const p = usePalette();
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress?.();
      }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        height: 40,
        borderRadius: radius.pill,
        backgroundColor: selected ? p.accent : p.surface,
        borderWidth: 1,
        borderColor: selected ? p.accent : p.border,
        opacity: pressed ? 0.8 : 1,
      })}>
      {icon && <Ionicons name={icon} size={16} color={selected ? p.accentText : p.text} />}
      <Text style={{ color: selected ? p.accentText : p.text, fontWeight: '600', fontSize: 14 }}>{label}</Text>
      {selected && !icon && <Ionicons name="checkmark" size={16} color={p.accentText} />}
    </Pressable>
  );
}

export function Avatar({
  initials,
  color,
  size = 48,
  photo,
}: {
  initials: string;
  color: string;
  size?: number;
  photo?: string;
}) {
  if (photo) {
    return (
      <Image
        source={{ uri: photo }}
        accessibilityLabel="Profile photo"
        style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }}
      />
    );
  }
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text style={{ color: '#fff', fontWeight: '800', fontSize: size * 0.36 }}>{initials}</Text>
    </View>
  );
}

export function IconButton({
  icon,
  onPress,
  label,
  style,
}: {
  icon: IconName;
  onPress?: () => void;
  label: string;
  style?: StyleProp<ViewStyle>;
}) {
  const p = usePalette();
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={() => {
        tap();
        onPress?.();
      }}
      style={({ pressed }) => [
        {
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: p.surface,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: p.border,
          opacity: pressed ? 0.7 : 1,
          ...shadow(2),
        },
        style,
      ]}>
      <Ionicons name={icon} size={20} color={p.text} />
    </Pressable>
  );
}

export function Row({
  children,
  gap = 12,
  style,
  accessibilityLabel,
}: {
  children: ReactNode;
  gap?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  return (
    <View accessibilityLabel={accessibilityLabel} style={[{ flexDirection: 'row', alignItems: 'center', gap }, style]}>
      {children}
    </View>
  );
}

export function Divider() {
  const p = usePalette();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: p.border, marginVertical: 12 }} />;
}

export function StepBar({ step, total }: { step: number; total: number }) {
  const p = usePalette();
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: 4,
            borderRadius: 2,
            backgroundColor: i <= step ? p.accent : p.surfaceAlt,
          }}
        />
      ))}
    </View>
  );
}

export function DemoNote({ children }: { children: ReactNode }) {
  const p = usePalette();
  return (
    <Row gap={8} style={{ backgroundColor: p.surfaceAlt, borderRadius: radius.sm, padding: 10 }}>
      <Ionicons name="flask-outline" size={16} color={p.textMuted} />
      <T variant="caption" muted style={{ flex: 1 }}>
        {children}
      </T>
    </Row>
  );
}

export function Stars({ value, size = 14, color = '#F5B32F' }: { value: number; size?: number; color?: string }) {
  return (
    <Row gap={2}>
      <Ionicons name="star" size={size} color={color} />
      <Text style={{ color, fontWeight: '700', fontSize: size }}>{value.toFixed(1)}</Text>
    </Row>
  );
}

export function shadow(level: 1 | 2 | 3 = 2): ViewStyle {
  const map = { 1: [2, 0.06, 4], 2: [6, 0.1, 10], 3: [14, 0.18, 24] } as const;
  const [y, opacity, r] = map[level];
  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: y },
    shadowOpacity: opacity,
    shadowRadius: r,
    elevation: level * 3,
  };
}
