import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, type ScrollViewInstance, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useToast } from '@/components/toast';
import { Avatar, Chip, IconButton, PaletteProvider, Row, T, tap } from '@/components/ui';
import { getJob } from '@/lib/catalog';
import { hirerContact } from '@/lib/hiring';
import { sendMessageAction, useStore } from '@/lib/store';
import { initialsOf, providerPalette as p, radius } from '@/lib/theme';

const QUICK = ['I can start Monday', 'What time should I arrive?', 'What is the full address?', 'Thank you!'];

export default function ChatScreen() {
  return (
    <PaletteProvider palette={p}>
      <Chat />
    </PaletteProvider>
  );
}

function Chat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { state, dispatch } = useStore();
  const [text, setText] = useState('');
  const scroller = useRef<ScrollViewInstance>(null);
  const job = getJob(id);
  const app = state.applications.find((a) => a.jobId === id);
  const unread = app?.unread ?? 0;
  const count = app?.messages.length ?? 0;

  useEffect(() => {
    if (unread > 0) dispatch({ type: 'readChat', jobId: id });
  }, [unread, id, dispatch]);

  useEffect(() => {
    setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), 50);
  }, [count, app?.replyDueAt]);

  if (!job || !app) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: p.bg, gap: 12 }}>
        <T variant="heading">Conversation not found</T>
        <Chip label="Back" onPress={() => router.back()} />
      </View>
    );
  }

  const send = (msg: string) => {
    const clean = msg.trim();
    if (!clean) return;
    tap();
    dispatch(sendMessageAction(job.id, clean));
    setText('');
  };
  const contact = hirerContact(job);
  const typing = !!app.replyDueAt;
  const canChat = app.status !== 'not_selected' && app.status !== 'declined';

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: p.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Row style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: p.border }}>
        <IconButton icon="arrow-back" label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace(`/job/${job.id}`))} />
        <Avatar initials={initialsOf(job.hirer)} color="#3B4743" size={40} />
        <Pressable style={{ flex: 1 }} onPress={() => router.push(`/job/${job.id}`)}>
          <T variant="label">{job.hirer}</T>
          <T variant="caption" muted numberOfLines={1}>
            {typing ? 'typing…' : job.title}
          </T>
        </Pressable>
        {app.status === 'hired' && (
          <IconButton icon="call" label="Call hirer" onPress={() => toast.show(`Calling ${contact.phone} (demo).`)} />
        )}
      </Row>

      <ScrollView ref={scroller} contentContainerStyle={{ padding: 16, gap: 10 }}>
        <View style={{ alignSelf: 'center', backgroundColor: p.surfaceAlt, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 4 }}>
          <T variant="caption" muted>
            Keep payments in StaffConnect. Never share bank PINs or OTPs.
          </T>
        </View>
        {app.note ? <Bubble mine text={`Application note: ${app.note}`} at={app.appliedAt} /> : null}
        {app.messages.map((m) => (
          <Bubble key={m.id} mine={m.from === 'me'} text={m.text} at={m.at} />
        ))}
        {typing && (
          <View style={{ alignSelf: 'flex-start', backgroundColor: p.surface, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 10 }}>
            <T muted>…</T>
          </View>
        )}
      </ScrollView>

      {canChat ? (
        <View style={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: insets.bottom + 10, gap: 8, borderTopWidth: 1, borderTopColor: p.border }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} keyboardShouldPersistTaps="handled">
            {QUICK.map((q) => (
              <Chip key={q} label={q} onPress={() => send(q)} />
            ))}
          </ScrollView>
          <Row gap={8}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder={`Message ${job.hirer}`}
              placeholderTextColor={p.textMuted}
              onSubmitEditing={() => send(text)}
              returnKeyType="send"
              style={{
                flex: 1,
                height: 48,
                borderRadius: radius.pill,
                backgroundColor: p.surface,
                borderWidth: 1,
                borderColor: p.border,
                paddingHorizontal: 16,
                color: p.text,
                fontSize: 15,
              }}
            />
            <Pressable
              accessibilityLabel="Send"
              disabled={!text.trim()}
              onPress={() => send(text)}
              style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: p.accent, alignItems: 'center', justifyContent: 'center', opacity: text.trim() ? 1 : 0.4 }}>
              <Ionicons name="send" size={20} color={p.accentText} />
            </Pressable>
          </Row>
        </View>
      ) : (
        <View style={{ padding: 16, paddingBottom: insets.bottom + 16 }}>
          <T variant="caption" muted style={{ textAlign: 'center' }}>
            This conversation is closed.
          </T>
        </View>
      )}
      {toast.node}
    </KeyboardAvoidingView>
  );
}

function Bubble({ mine, text, at }: { mine: boolean; text: string; at: number }) {
  return (
    <View
      style={{
        alignSelf: mine ? 'flex-end' : 'flex-start',
        maxWidth: '82%',
        backgroundColor: mine ? p.accent : p.surface,
        borderRadius: radius.md,
        borderBottomRightRadius: mine ? 4 : radius.md,
        borderBottomLeftRadius: mine ? radius.md : 4,
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 4,
      }}>
      <T color={mine ? p.accentText : p.text}>{text}</T>
      <T variant="caption" color={mine ? 'rgba(20,16,7,0.6)' : p.textMuted} style={{ alignSelf: 'flex-end', fontSize: 11 }}>
        {new Date(at).toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' })}
      </T>
    </View>
  );
}
