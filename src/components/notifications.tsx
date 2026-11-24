import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { type AppNotification, useNow, useStore } from '@/lib/store';
import { providerPalette as p, radius } from '@/lib/theme';

import { shadow, T, tap } from './ui';

/** Bell with an unread badge; opens the inbox. */
export function InboxBell() {
  const { state } = useStore();
  const unread = state.notifications.filter((n) => !n.read).length;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={unread ? `Inbox, ${unread} unread` : 'Inbox'}
      onPress={() => router.push('/inbox')}
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: p.surface,
        borderWidth: 1,
        borderColor: p.border,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadow(2),
      }}>
      <Ionicons name="notifications" size={20} color={p.text} />
      {unread > 0 && (
        <View
          style={{
            position: 'absolute',
            top: -4,
            right: -4,
            minWidth: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: p.danger,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 4,
          }}>
          <T variant="caption" color="#fff" style={{ fontWeight: '800', fontSize: 11 }}>
            {unread}
          </T>
        </View>
      )}
    </Pressable>
  );
}

/**
 * Slides in a banner whenever a new notification arrives (shortlist, offer, message),
 * like a push notification while the app is open. Tapping it opens the right screen.
 */
export function NotificationBanner() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { state } = useStore();
  const now = useNow(500);
  const [mountedAt] = useState(() => Date.now());
  const [dismissed, setDismissed] = useState<string | null>(null);
  const [slide] = useState(() => new Animated.Value(0));
  const latest = state.notifications[0];

  // Visible for a few seconds after a new, unread notification arrives (not for old ones,
  // and not for the conversation that is already open on screen).
  const jobId = latest?.href.split('/').pop() ?? '';
  const shown: AppNotification | null =
    latest &&
    !latest.read &&
    latest.id !== dismissed &&
    latest.at >= mountedAt &&
    now - latest.at < 5000 &&
    !(pathname.startsWith('/chat') && pathname.includes(jobId))
      ? latest
      : null;

  useEffect(() => {
    if (!shown) return;
    tap('success');
    slide.setValue(0);
    Animated.spring(slide, { toValue: 1, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [shown?.id, slide]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!shown) return null;
  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: insets.top + 8,
        left: 12,
        right: 12,
        zIndex: 100,
        opacity: slide,
        transform: [{ translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [-80, 0] }) }],
      }}>
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          setDismissed(shown.id);
          router.push(shown.href as never);
        }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          backgroundColor: p.surface,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: p.accent,
          padding: 14,
          ...shadow(3),
        }}>
        <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: p.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="briefcase" size={18} color={p.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <T variant="label">{shown.title}</T>
          <T variant="caption" muted numberOfLines={2}>
            {shown.body}
          </T>
        </View>
        <Ionicons name="chevron-forward" size={18} color={p.textMuted} />
      </Pressable>
    </Animated.View>
  );
}
