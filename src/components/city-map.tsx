import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import type { IconName } from '@/lib/catalog';
import type { Palette } from '@/lib/theme';

import { shadow } from './ui';

type Point = { x: number; y: number }; // 0..1 relative coordinates

export type MapMarker =
  | { kind: 'home'; at: Point; label?: string }
  | { kind: 'pro'; at: Point; initials: string; color: string }
  | { kind: 'me'; at: Point }
  | { kind: 'job'; at: Point; icon: IconName };

const useNative = Platform.OS !== 'web';

/**
 * A stylised, dependency-light city map drawn with SVG. It works identically on
 * iOS, Android and web, which keeps the hosted web demo faithful to the apps.
 */
export function CityMap({
  palette,
  markers = [],
  route,
  progress = 0,
  pulseAt,
  seed = 7,
}: {
  palette: Palette;
  markers?: MapMarker[];
  route?: { from: Point; to: Point };
  progress?: number;
  pulseAt?: Point;
  seed?: number;
}) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const geo = useMemo(() => buildCity(size.w, size.h, seed), [size.w, size.h, seed]);
  const m = palette.map;

  const routePts = route ? lPath(route.from, route.to, size) : null;
  const moving = routePts ? pointAlong(routePts, progress) : null;

  return (
    <View
      style={StyleSheet.absoluteFill}
      onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      {size.w > 0 && (
        <Svg width={size.w} height={size.h}>
          <Rect x={0} y={0} width={size.w} height={size.h} fill={m.land} />
          {geo.blocks.map((b, i) => (
            <Rect key={`b${i}`} x={b.x} y={b.y} width={b.w} height={b.h} rx={6} fill={b.park ? m.park : m.block} />
          ))}
          <Path d={geo.water} fill={m.water} />
          {geo.roads.map((r, i) => (
            <Rect key={`r${i}`} x={r.x} y={r.y} width={r.w} height={r.h} fill={r.major ? m.roadMajor : m.road} />
          ))}
          <Path d={geo.expressway} stroke={m.roadMajor} strokeWidth={10} fill="none" strokeLinecap="round" />
          {routePts && (
            <>
              <Path
                d={toD(routePts)}
                stroke={m.route}
                strokeOpacity={0.25}
                strokeWidth={10}
                fill="none"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <Path
                d={toD(routePts)}
                stroke={m.route}
                strokeWidth={5}
                fill="none"
                strokeDasharray="1 9"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </>
          )}
        </Svg>
      )}

      {size.w > 0 && pulseAt && <Pulse x={pulseAt.x * size.w} y={pulseAt.y * size.h} color={m.route} />}

      {size.w > 0 &&
        markers.map((mk, i) => {
          const at = mk.kind === 'pro' && moving ? moving : { x: mk.at.x * size.w, y: mk.at.y * size.h };
          return <Marker key={i} marker={mk} x={at.x} y={at.y} palette={palette} />;
        })}
    </View>
  );
}

function Marker({ marker, x, y, palette }: { marker: MapMarker; x: number; y: number; palette: Palette }) {
  if (marker.kind === 'home') {
    return (
      <View style={[styles.anchor, { left: x - 20, top: y - 44 }]} pointerEvents="none">
        {marker.label && (
          <View style={styles.tagRow}>
            <View style={[styles.tag, { backgroundColor: palette.text }]}>
              <Text numberOfLines={1} style={{ color: palette.bg, fontSize: 11, fontWeight: '700' }}>
                {marker.label}
              </Text>
            </View>
          </View>
        )}
        <View style={[styles.pin, { backgroundColor: palette.text, ...shadow(2) }]}>
          <Ionicons name="home" size={18} color={palette.bg} />
        </View>
        <View style={[styles.pinTail, { borderTopColor: palette.text }]} />
      </View>
    );
  }
  if (marker.kind === 'pro') {
    return (
      <View
        pointerEvents="none"
        style={[
          styles.pro,
          { left: x - 20, top: y - 20, backgroundColor: marker.color, borderColor: palette.surface, ...shadow(3) },
        ]}>
        <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>{marker.initials}</Text>
      </View>
    );
  }
  if (marker.kind === 'job') {
    return (
      <View
        pointerEvents="none"
        style={[
          styles.pro,
          { left: x - 20, top: y - 20, backgroundColor: palette.surface, borderColor: palette.accent, ...shadow(2) },
        ]}>
        <Ionicons name={marker.icon} size={18} color={palette.accent} />
      </View>
    );
  }
  return (
    <View pointerEvents="none" style={[styles.me, { left: x - 18, top: y - 18 }]}>
      <View style={[styles.meHalo, { backgroundColor: palette.accent }]} />
      <View style={[styles.meDot, { backgroundColor: palette.accent, borderColor: palette.surface, ...shadow(2) }]}>
        <Ionicons name="navigate" size={12} color={palette.accentText} />
      </View>
    </View>
  );
}

function Pulse({ x, y, color }: { x: number; y: number; color: string }) {
  const [rings] = useState(() => [new Animated.Value(0), new Animated.Value(0)]);
  useEffect(() => {
    const loops = rings.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 900),
          Animated.timing(v, { toValue: 1, duration: 1800, easing: Easing.out(Easing.quad), useNativeDriver: useNative }),
          Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: useNative }),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const R = 110;
  return (
    <>
      {rings.map((v, i) => (
        <Animated.View
          key={i}
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: x - R,
            top: y - R,
            width: R * 2,
            height: R * 2,
            borderRadius: R,
            backgroundColor: color,
            opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] }),
            transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.1, 1] }) }],
          }}
        />
      ))}
    </>
  );
}

// ----- geometry helpers -----

function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function buildCity(w: number, h: number, seed: number) {
  const r = rand(seed);
  const roads: { x: number; y: number; w: number; h: number; major: boolean }[] = [];
  const blocks: { x: number; y: number; w: number; h: number; park: boolean }[] = [];
  if (!w || !h) return { roads, blocks, water: '', expressway: '' };

  const xs: number[] = [];
  for (let x = -20 + r() * 30; x < w + 40; x += 70 + r() * 40) xs.push(x);
  const ys: number[] = [];
  for (let y = -20 + r() * 30; y < h + 40; y += 80 + r() * 50) ys.push(y);

  xs.forEach((x, i) => {
    const major = i % 3 === 1;
    roads.push({ x, y: 0, w: major ? 9 : 6, h, major });
  });
  ys.forEach((y, i) => {
    const major = i % 3 === 2;
    roads.push({ x: 0, y, w, h: major ? 9 : 6, major });
  });
  for (let i = 0; i < xs.length - 1; i++) {
    for (let j = 0; j < ys.length - 1; j++) {
      blocks.push({
        x: xs[i] + 10,
        y: ys[j] + 10,
        w: xs[i + 1] - xs[i] - 14,
        h: ys[j + 1] - ys[j] - 14,
        park: r() > 0.88,
      });
    }
  }

  const water = `M0 ${h * 0.86} C ${w * 0.3} ${h * 0.8}, ${w * 0.55} ${h * 0.95}, ${w} ${h * 0.84} L ${w} ${h} L 0 ${h} Z`;
  const expressway = `M ${-10} ${h * 0.2} C ${w * 0.35} ${h * 0.28}, ${w * 0.6} ${h * 0.5}, ${w + 10} ${h * 0.62}`;
  return { roads, blocks, water, expressway };
}

function lPath(from: Point, to: Point, size: { w: number; h: number }) {
  const a = { x: from.x * size.w, y: from.y * size.h };
  const b = { x: to.x * size.w, y: to.y * size.h };
  return [a, { x: b.x, y: a.y }, b];
}

function toD(pts: { x: number; y: number }[]) {
  return pts.map((p, i) => `${i ? 'L' : 'M'} ${p.x} ${p.y}`).join(' ');
}

function pointAlong(pts: { x: number; y: number }[], t: number) {
  const segs = pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y));
  const total = segs.reduce((a, b) => a + b, 0) || 1;
  let d = Math.min(Math.max(t, 0), 1) * total;
  for (let i = 0; i < segs.length; i++) {
    if (d <= segs[i] || i === segs.length - 1) {
      const k = segs[i] ? d / segs[i] : 0;
      return { x: pts[i].x + (pts[i + 1].x - pts[i].x) * k, y: pts[i].y + (pts[i + 1].y - pts[i].y) * k };
    }
    d -= segs[i];
  }
  return pts[pts.length - 1];
}

const styles = StyleSheet.create({
  anchor: { position: 'absolute', width: 40, alignItems: 'center' },
  tagRow: { position: 'absolute', bottom: 50, left: -60, width: 160, alignItems: 'center' },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  pin: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  pinTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  pro: { position: 'absolute', width: 40, height: 40, borderRadius: 20, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  me: { position: 'absolute', width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  meHalo: { position: 'absolute', width: 36, height: 36, borderRadius: 18, opacity: 0.25 },
  meDot: { width: 24, height: 24, borderRadius: 12, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
});
