import { useCallback, useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shadow } from './ui';

/** Lightweight cross-platform toast (Alert.alert is a no-op on web). */
export function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const show = useCallback((msg: string) => {
    if (timer.current) clearTimeout(timer.current);
    setMessage(msg);
    timer.current = setTimeout(() => setMessage(null), 2600);
  }, []);

  const node = message ? (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: insets.top + 64,
        left: 20,
        right: 20,
        backgroundColor: '#111',
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 16,
        ...shadow(3),
      }}>
      <Text style={{ color: '#fff', fontWeight: '600', textAlign: 'center' }}>{message}</Text>
    </View>
  ) : null;

  return { show, node };
}
