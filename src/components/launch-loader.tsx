import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';

/** How long the loader stays up on every app launch (ms). */
const LOADER_DURATION = 5000;
const EXIT_DURATION = 400;
/** One full roll = four hops. */
const ROLL_DURATION = 2400;

// Matches the native splash background so the hand-off is seamless.
const BG = '#F1F5F9'; // light grey (slate-100)
const NAVY = '#142236';
const AMBER = '#FCD34D';

/** Piecewise timing for one hop (0..1): crouch → airborne → land → settle. */
function hopPhase(f: number) {
  'worklet';
  const air = Math.min(Math.max((f - 0.12) / 0.72, 0), 1);
  const turn = air < 0.5 ? 2 * air * air : 1 - Math.pow(-2 * air + 2, 2) / 2;
  const squash = f < 0.12 ? Math.sin((Math.PI * f) / 0.12) : f > 0.84 ? Math.sin((Math.PI * (f - 0.84)) / 0.16) : 0;
  const landing = f >= 0.84 ? (f - 0.84) / 0.16 : -1;
  return { air, turn, squash, landing };
}

/** Dust puff that drifts outward as the tile lands. */
function puff(landing: number, dir: -1 | 1) {
  'worklet';
  if (landing < 0) return { opacity: 0, transform: [{ translateX: 0 }, { translateY: 0 }] };
  return { opacity: 1 - landing, transform: [{ translateX: dir * 10 * landing }, { translateY: -6 * landing }] };
}

/**
 * StaffConnect launch loader: the house tile hops and tumbles a quarter turn per
 * bounce. Shown on every launch for ~5s, starting once it is on screen.
 */
export function LaunchLoader({ onDone }: { onDone: () => void }) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(0);
  const opacity = useSharedValue(1);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!reduceMotion) {
      progress.value = withRepeat(withTiming(4, { duration: ROLL_DURATION, easing: Easing.linear }), -1, false);
    }
    const timer = setTimeout(() => setLeaving(true), LOADER_DURATION - EXIT_DURATION);
    return () => clearTimeout(timer);
  }, [progress, reduceMotion]);

  useEffect(() => {
    if (!leaving) return;
    opacity.value = withTiming(0, { duration: EXIT_DURATION, easing: Easing.out(Easing.quad) });
    const timer = setTimeout(onDone, EXIT_DURATION);
    return () => clearTimeout(timer);
  }, [leaving, onDone, opacity]);

  const containerStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const tileStyle = useAnimatedStyle(() => {
    const hop = Math.floor(progress.value);
    const { air, turn, squash } = hopPhase(progress.value - hop);
    return {
      transform: [
        { translateY: -34 * Math.sin(Math.PI * air) },
        { scaleX: 1 + 0.1 * squash },
        { scaleY: 1 - 0.12 * squash },
        { rotate: `${(hop + turn) * 90}deg` },
      ],
    };
  });

  const shadowStyle = useAnimatedStyle(() => {
    const { air } = hopPhase(progress.value % 1);
    const lift = Math.sin(Math.PI * air);
    return { opacity: 0.28 - 0.14 * lift, transform: [{ scaleX: 1 - 0.45 * lift }] };
  });

  const leftPuff = useAnimatedStyle(() => puff(hopPhase(progress.value % 1).landing, -1));
  const rightPuff = useAnimatedStyle(() => puff(hopPhase(progress.value % 1).landing, 1));

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.root, containerStyle]}
      pointerEvents={leaving ? 'none' : 'auto'}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading StaffConnect">
      <StatusBar style="dark" />

      <View style={styles.stage}>
        <Animated.View style={[styles.puff, { left: 22 }, leftPuff]} />
        <Animated.View style={[styles.puff, { right: 22 }, rightPuff]} />
        <Animated.View style={[styles.shadow, shadowStyle]} />
        <Animated.View style={[styles.tile, tileStyle]}>
          <Svg width={76} height={76} viewBox="46 62 68 68">
            <Rect x={46} y={62} width={68} height={68} rx={19} fill={NAVY} />
            <Path
              d="M62.5 96 L80 80.5 L97.5 96 M67.5 91.5 V113 H92.5 V91.5"
              fill="none"
              stroke={AMBER}
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M80 109 C74.5 105 73 102 75.2 99.6 C77 97.7 79 98.3 80 100 C81 98.3 83 97.7 84.8 99.6 C87 102 85.5 105 80 109 Z"
              fill={AMBER}
            />
          </Svg>
        </Animated.View>
      </View>

      <Text style={styles.wordmark}>StaffConnect</Text>
      <Text style={styles.tagline}>Trusted help at home</Text>

      <Pressable
        onPress={() => setLeaving(true)}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Skip loading screen"
        style={[styles.skip, { bottom: insets.bottom + 24 }]}>
        <Text style={styles.skipText}>Skip →</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { zIndex: 100, backgroundColor: BG, alignItems: 'center', justifyContent: 'center' },
  stage: { width: 140, height: 140, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 18 },
  tile: {
    width: 76,
    height: 76,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  shadow: { position: 'absolute', bottom: 8, width: 64, height: 10, borderRadius: 999, backgroundColor: '#CBD5E1' },
  puff: { position: 'absolute', bottom: 14, width: 7, height: 7, borderRadius: 999, backgroundColor: '#94A3B8' },
  wordmark: { marginTop: 18, fontSize: 28, fontWeight: '800', letterSpacing: -0.8, color: NAVY },
  tagline: { marginTop: 6, fontSize: 15, fontWeight: '500', color: '#475569' },
  skip: { position: 'absolute', right: 24, paddingHorizontal: 14, paddingVertical: 8 },
  skipText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
});
