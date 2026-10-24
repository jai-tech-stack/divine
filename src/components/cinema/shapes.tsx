import React from 'react';
import { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

/** All painted backdrops share a 400 × 800 portrait canvas. */
export const W = 400;
export const H = 800;

let uid = 0;
const nextId = (p: string) => `${p}${++uid}`;

export function Sky({ stops }: { stops: string[] }) {
  const id = React.useMemo(() => nextId('sky'), []);
  return (
    <>
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          {stops.map((c, i) => (
            <Stop key={i} offset={i / (stops.length - 1)} stopColor={c} />
          ))}
        </LinearGradient>
      </Defs>
      <Rect x={-200} y={-200} width={W + 400} height={H + 400} fill={`url(#${id})`} />
    </>
  );
}

export function Glow({ cx, cy, r, color, opacity = 1 }: { cx: number; cy: number; r: number; color: string; opacity?: number }) {
  const id = React.useMemo(() => nextId('glow'), []);
  return (
    <>
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={color} stopOpacity={opacity} />
          <Stop offset="0.45" stopColor={color} stopOpacity={opacity * 0.35} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={cx} cy={cy} r={r} fill={`url(#${id})`} />
    </>
  );
}

function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/** A smooth mountain/hill ridge from x=-200 to x=600, filled down to the bottom. */
export function Ridge({ seed, y, amp, color, step = 50, opacity = 1 }: { seed: number; y: number; amp: number; color: string; step?: number; opacity?: number }) {
  const r = rand(seed);
  const pts: [number, number][] = [];
  for (let x = -200; x <= 600; x += step) pts.push([x, y - r() * amp]);
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const mx = (x0 + x1) / 2;
    d += ` Q${x0} ${y0} ${mx} ${(y0 + y1) / 2}`;
  }
  d += ` L600 ${H + 200} L-200 ${H + 200}Z`;
  return <Path d={d} fill={color} opacity={opacity} />;
}

/** Temple tower silhouette (gopuram), base centre at (x, base). */
export function Gopuram({ x, base, w, h, color, opacity = 1 }: { x: number; base: number; w: number; h: number; color: string; opacity?: number }) {
  const tiers = 6;
  let d = '';
  for (let i = 0; i < tiers; i++) {
    const tw = w * (1 - i * 0.13);
    const y0 = base - (h * 0.82 * i) / tiers;
    const y1 = base - (h * 0.82 * (i + 1)) / tiers;
    d += `M${x - tw / 2} ${y0} L${x - tw / 2 + w * 0.03} ${y1} L${x + tw / 2 - w * 0.03} ${y1} L${x + tw / 2} ${y0}Z `;
  }
  const topY = base - h * 0.82;
  const kw = w * 0.3;
  d += `M${x - kw} ${topY} Q${x} ${topY - h * 0.22} ${x + kw} ${topY}Z`;
  d += `M${x - 1.5} ${topY - h * 0.16} L${x} ${base - h} L${x + 1.5} ${topY - h * 0.16}Z`;
  return <Path d={d} fill={color} opacity={opacity} />;
}

export function Tree({ x, base, s, color, opacity = 1 }: { x: number; base: number; s: number; color: string; opacity?: number }) {
  return (
    <G transform={`translate(${x},${base}) scale(${s})`} opacity={opacity}>
      <Path d="M-6 0 L-4 -60 C-14 -70 -24 -74 -34 -72 M4 -60 L6 0Z M-4 -58 L4 -58 L6 0 L-6 0Z" fill={color} stroke={color} strokeWidth={3} />
      <Circle cx={0} cy={-92} r={38} fill={color} />
      <Circle cx={-32} cy={-74} r={26} fill={color} />
      <Circle cx={32} cy={-76} r={28} fill={color} />
      <Circle cx={-14} cy={-120} r={24} fill={color} />
      <Circle cx={18} cy={-118} r={22} fill={color} />
      <Path d="M-30 -60 L-31 0 M30 -62 L31 0" stroke={color} strokeWidth={2} />
    </G>
  );
}

type FigProps = { x: number; y: number; s: number; color: string; opacity?: number; flip?: boolean };
const tf = ({ x, y, s, flip }: FigProps) => `translate(${x},${y}) scale(${flip ? -s : s},${s})`;

/** Seated sage, base at (x,y), ~100 units tall before scale. */
export function Sage(p: FigProps) {
  return (
    <G transform={tf(p)} opacity={p.opacity ?? 1}>
      <Circle cx={0} cy={-70} r={9} fill={p.color} />
      <Circle cx={0} cy={-82} r={5} fill={p.color} />
      <Path d="M0 -60 C-12 -59 -17 -48 -15 -32 L-32 -20 C-36 -10 -26 -4 0 -4 C26 -4 36 -10 32 -20 L15 -32 C17 -48 12 -59 0 -60Z" fill={p.color} />
    </G>
  );
}

/** Standing person, base at (x,y), ~100 units tall. */
export function Person({ thin, ...p }: FigProps & { thin?: boolean }) {
  return (
    <G transform={tf(p)} opacity={p.opacity ?? 1}>
      <G transform={thin ? 'scale(0.8,1)' : undefined}>
        <Circle cx={0} cy={-88} r={7} fill={p.color} />
        <Path d="M0 -80 C-7 -79 -9 -72 -9 -64 L-11 -42 L-7 -42 L-8 -2 L-2 -2 L0 -36 L2 -2 L8 -2 L7 -42 L11 -42 L9 -64 C9 -72 7 -79 0 -80Z" fill={p.color} />
      </G>
    </G>
  );
}

export type Bow = 'none' | 'raised' | 'aim' | 'lowered';

/** Crowned king with cape and bow, base at (x,y), ~110 units tall. */
export function King({ bow = 'none', ...p }: FigProps & { bow?: Bow }) {
  const stroke = { stroke: p.color, strokeWidth: 3.5, strokeLinecap: 'round' as const, fill: 'none' };
  return (
    <G transform={tf(p)} opacity={p.opacity ?? 1}>
      <Path d="M-7 -76 C-16 -60 -20 -30 -22 -8 L-10 -8 L-8 -60Z" fill={p.color} opacity={0.85} />
      <Circle cx={0} cy={-88} r={7} fill={p.color} />
      <Path d="M-8 -93 L-6 -101 L-3 -96 L0 -103 L3 -96 L6 -101 L8 -93Z" fill={p.color} />
      <Path d="M0 -80 C-7 -79 -10 -72 -10 -64 L-12 -42 L-8 -42 L-9 -2 L-3 -2 L0 -36 L3 -2 L9 -2 L8 -42 L12 -42 L10 -64 C10 -72 7 -79 0 -80Z" fill={p.color} />
      {bow === 'raised' && (
        <G>
          <Path d="M8 -70 L30 -70" {...stroke} />
          <Path d="M30 -100 Q52 -70 30 -40" {...stroke} />
          <Path d="M30 -100 L16 -70 L30 -40" stroke={p.color} strokeWidth={1} fill="none" />
        </G>
      )}
      {bow === 'aim' && (
        <G transform="rotate(32,8,-70)">
          <Path d="M8 -70 L34 -70" {...stroke} />
          <Path d="M34 -102 Q58 -70 34 -38" {...stroke} />
          <Path d="M34 -102 L4 -70 L34 -38" stroke={p.color} strokeWidth={1} fill="none" />
          <Path d="M4 -70 L66 -70" stroke={p.color} strokeWidth={1.6} />
          <Path d="M66 -70 L58 -74 L58 -66Z" fill={p.color} />
        </G>
      )}
      {bow === 'lowered' && (
        <G>
          <Path d="M8 -68 L14 -42" {...stroke} />
          <Path d="M16 -50 Q30 -22 16 4" {...stroke} />
        </G>
      )}
    </G>
  );
}

/** Kneeling figure with joined hands, base at (x,y). */
export function Kneel({ crown, bow, ...p }: FigProps & { crown?: boolean; bow?: boolean }) {
  return (
    <G transform={tf(p)} opacity={p.opacity ?? 1}>
      <Circle cx={0} cy={-62} r={7} fill={p.color} />
      {crown && <Path d="M-8 -67 L-6 -75 L-3 -70 L0 -77 L3 -70 L6 -75 L8 -67Z" fill={p.color} />}
      <Path d="M0 -54 C-7 -52 -9 -44 -7 -36 L-12 -22 L-22 -2 L22 -2 L18 -14 L6 -16 L8 -36 C10 -44 7 -52 0 -54Z" fill={p.color} />
      <Path d="M4 -46 L12 -40 L10 -54" stroke={p.color} strokeWidth={3} fill="none" strokeLinecap="round" />
      {bow && <Path d="M-30 -2 Q-6 -14 26 -2" stroke={p.color} strokeWidth={3} fill="none" />}
    </G>
  );
}

/** Cow facing right, base (hooves) at (x,y), ~120 × 70 units. */
export function Cow({ legs = 'stand', ...p }: FigProps & { legs?: 'stand' | 'run' }) {
  const legPath =
    legs === 'run'
      ? 'M-26 -24 L-40 -2 L-34 -2 L-20 -22 M-18 -22 L-10 0 L-4 0 L-12 -24 M30 -24 L46 -4 L52 -6 L38 -26 M36 -24 L28 0 L34 0 L42 -22'
      : 'M-24 -24 L-26 0 L-20 0 L-18 -24 M-14 -24 L-14 0 L-8 0 L-8 -24 M32 -24 L32 0 L38 0 L38 -24 M40 -24 L42 0 L48 0 L46 -24';
  return (
    <G transform={tf(p)} opacity={p.opacity ?? 1}>
      <Path d="M-50 -46 C-46 -56 -26 -58 0 -56 C16 -55 28 -58 36 -62 L44 -70 L48 -66 L46 -60 C54 -58 58 -52 56 -46 C54 -42 48 -42 44 -44 L42 -34 C38 -28 34 -24 30 -22 C14 -20 -10 -20 -24 -22 C-34 -24 -46 -32 -50 -46Z" fill={p.color} />
      <Path d={legPath} stroke={p.color} strokeWidth={5} strokeLinecap="round" fill={p.color} />
      <Path d="M-50 -46 C-56 -40 -58 -28 -54 -20" stroke={p.color} strokeWidth={2.5} fill="none" />
      <Path d="M44 -68 L40 -78 M48 -66 L56 -74" stroke={p.color} strokeWidth={2.5} strokeLinecap="round" />
    </G>
  );
}

const PETAL = 'M0,20 C-20,-14 -20,-70 0,-104 C20,-70 20,-14 0,20Z';
/** Lotus flower, centre-bottom at (x,y). */
export function Lotus({ x, y, s, color, fill = 'none', opacity = 1 }: { x: number; y: number; s: number; color: string; fill?: string; opacity?: number }) {
  return (
    <G transform={`translate(${x},${y}) scale(${s})`} opacity={opacity}>
      {[-75, -50, -25, 25, 50, 75, 0].map((a) => (
        <Path key={a} d={PETAL} transform={`rotate(${a}) scale(${1 - Math.abs(a) / 300})`} stroke={color} strokeWidth={2} fill={fill} />
      ))}
    </G>
  );
}

export function Cloud({ x, y, s, color, opacity = 1 }: { x: number; y: number; s: number; color: string; opacity?: number }) {
  return (
    <G transform={`translate(${x},${y}) scale(${s})`} opacity={opacity}>
      <Ellipse cx={0} cy={0} rx={60} ry={18} fill={color} />
      <Ellipse cx={-28} cy={-10} rx={30} ry={18} fill={color} />
      <Ellipse cx={18} cy={-14} rx={34} ry={22} fill={color} />
    </G>
  );
}

/** Perspective field rows converging on a vanishing point. */
export function Furrows({ top, color, rows = 14, vx = 200, opacity = 1 }: { top: number; color: string; rows?: number; vx?: number; opacity?: number }) {
  const lines: string[] = [];
  for (let i = -rows; i <= rows; i++) lines.push(`M${vx} ${top} L${vx + i * 60} ${H + 60}`);
  return <Path d={lines.join(' ')} stroke={color} strokeWidth={1.4} opacity={opacity} />;
}

export function Cracks({ seed, top, color, width = 2, opacity = 1 }: { seed: number; top: number; color: string; width?: number; opacity?: number }) {
  const r = rand(seed);
  let d = '';
  for (let k = 0; k < 9; k++) {
    let x = r() * W;
    let y = top + r() * (H - top);
    d += `M${x} ${y}`;
    for (let j = 0; j < 5; j++) {
      x += (r() - 0.5) * 70;
      y += (r() - 0.3) * 40;
      d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
    }
  }
  return <Path d={d} stroke={color} strokeWidth={width} fill="none" opacity={opacity} strokeLinejoin="round" />;
}
