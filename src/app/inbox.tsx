import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card, IconButton, PaletteProvider, Row, T } from '@/components/ui';
import { useStore } from '@/lib/store';
import { providerPalette as p } from '@/lib/theme';

export default function Inbox() {
  const insets = useSafeAreaInsets();
  const { state, dispatch } = useStore();
  const items = state.notifications;
  const unread = items.filter((n) => !n.read).length;

  // Opening the inbox marks everything as seen (after a moment, so new items stay highlighted).
  useEffect(() => {
    if (!unread) return;
    const t = setTimeout(() => dispatch({ type: 'readNotifications' }), 2500);
    return () => clearTimeout(t);
  }, [unread, dispatch]);

  return (
    <PaletteProvider palette={p}>
      <ScrollView style={{ backgroundColor: p.bg }} contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, gap: 14, paddingBottom: 40 }}>
        <Row>
          <IconButton icon="arrow-back" label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/provider'))} />
          <T variant="title" style={{ flex: 1 }}>
            Inbox
          </T>
        </Row>
        {items.length === 0 && (
          <Card style={{ alignItems: 'center', gap: 10, paddingVertical: 28 }}>
            <Ionicons name="notifications-outline" size={36} color={p.textMuted} />
            <T muted style={{ textAlign: 'center' }}>
              Updates from hirers appear here: shortlists, job offers and messages.
            </T>
          </Card>
        )}
        {items.map((n) => (
          <Pressable key={n.id} onPress={() => router.push(n.href as never)}>
            <Card style={{ flexDirection: 'row', gap: 12, borderColor: n.read ? p.border : p.accent }}>
              <View style={{ width: 10, paddingTop: 6 }}>{!n.read && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: p.accent }} />}</View>
              <View style={{ flex: 1, gap: 2 }}>
                <T variant="label">{n.title}</T>
                <T variant="caption" muted>
                  {n.body}
                </T>
                <T variant="caption" muted style={{ fontSize: 11 }}>
                  {new Date(n.at).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
                </T>
              </View>
              <Ionicons name="chevron-forward" size={18} color={p.textMuted} />
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </PaletteProvider>
  );
}
