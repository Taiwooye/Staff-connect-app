import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, type TextInputProps, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius } from '@/lib/theme';

import { IconButton, StepBar, T, usePalette } from './ui';

/** Shared chrome for onboarding and booking steps: back, progress, title, sticky CTA. */
export function FormScreen({
  title,
  subtitle,
  step,
  total,
  onBack,
  footer,
  children,
}: {
  title: string;
  subtitle?: string;
  step?: number;
  total?: number;
  onBack?: () => void;
  footer?: ReactNode;
  children: ReactNode;
}) {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: p.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 20, gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <IconButton
            icon="arrow-back"
            label="Back"
            onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))}
          />
          {step !== undefined && total !== undefined && (
            <View style={{ flex: 1 }}>
              <StepBar step={step} total={total} />
            </View>
          )}
        </View>
      </View>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 20 }}
        keyboardShouldPersistTaps="handled">
        <View style={{ gap: 6 }}>
          <T variant="title">{title}</T>
          {subtitle && <T muted>{subtitle}</T>}
        </View>
        {children}
      </ScrollView>
      {footer && (
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: insets.bottom + 16,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: p.border,
            backgroundColor: p.bg,
            gap: 8,
          }}>
          {footer}
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  const p = usePalette();
  return (
    <View style={{ gap: 8 }}>
      <T variant="caption" muted>
        {label}
      </T>
      <TextInput
        placeholderTextColor={p.textMuted}
        {...props}
        style={[
          {
            height: props.multiline ? 96 : 54,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: p.border,
            backgroundColor: p.surface,
            paddingHorizontal: 16,
            paddingTop: props.multiline ? 14 : 0,
            fontSize: 16,
            color: p.text,
            textAlignVertical: props.multiline ? 'top' : 'center',
          },
          props.style,
        ]}
      />
    </View>
  );
}
