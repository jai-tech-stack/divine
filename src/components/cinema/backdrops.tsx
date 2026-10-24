import React from 'react';
import { Circle, Path, Rect } from 'react-native-svg';

import type { Backdrop } from '@/content/types';
import { Cloud, Cow, Cracks, Furrows, Glow, Gopuram, H, King, Kneel, Lotus, Person, Ridge, Sage, Sky, Tree, W } from './shapes';

export type Layers = {
  /** furthest layer: sky, sun, far hills — moves least */
  back: React.ReactNode;
  /** middle distance — moves a little more */
  mid: React.ReactNode;
  /** characters in the foreground — moves most */
  front: React.ReactNode;
  /** origin and colour of the rotating light rays, if any (canvas coords) */
  rays?: { x: number; y: number; color: string; opacity: number };
  /** colour of the bottom subtitle shade */
  shade: string;
};

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

export function getLayers(b: Backdrop): Layers {
  switch (b) {
    case 'forest-dawn':
      return {
        shade: '#120c14',
        rays: { x: 200, y: 470, color: '#ffd28a', opacity: 0.22 },
        back: (
          <>
            <Sky stops={['#22163a', '#7a3d4a', '#d9844a', '#f6c27c']} />
            <Glow cx={200} cy={480} r={260} color="#ffd9a0" />
            <Ridge seed={3} y={520} amp={60} color="#7d4a52" opacity={0.75} />
            <Ridge seed={9} y={560} amp={40} color="#4e2f3c" />
          </>
        ),
        mid: (
          <>
            <Tree x={30} base={640} s={1.5} color="#2a1a24" />
            <Tree x={380} base={630} s={1.7} color="#2a1a24" />
            <Tree x={110} base={600} s={0.8} color="#3a2430" opacity={0.85} />
            <Tree x={300} base={600} s={0.9} color="#3a2430" opacity={0.85} />
            <Rect x={-200} y={610} width={W + 400} height={400} fill="#1e1420" />
            <Path d="M120 820 C170 740 190 690 200 640 C210 690 240 740 300 820Z" fill="#f2b56c" opacity={0.25} />
          </>
        ),
        front: (
          <>
            <Sage x={200} y={630} s={1.25} color="#0f0910" />
            <Sage x={92} y={660} s={1.05} color="#0f0910" flip />
            <Sage x={308} y={660} s={1.05} color="#0f0910" />
            <Sage x={22} y={690} s={0.95} color="#0f0910" flip />
            <Sage x={378} y={690} s={0.95} color="#0f0910" />
          </>
        ),
      };

    case 'palace-storm':
      return {
        shade: '#08040a',
        back: (
          <>
            <Sky stops={['#07060c', '#1e0a14', '#4a1018', '#6e1a1c']} />
            <Glow cx={200} cy={420} r={230} color="#c02a2a" opacity={0.55} />
            <Cloud x={70} y={150} s={1.6} color="#16090f" />
            <Cloud x={330} y={110} s={1.9} color="#140810" />
            <Cloud x={210} y={220} s={1.3} color="#1b0b12" opacity={0.9} />
          </>
        ),
        mid: (
          <>
            <Gopuram x={60} base={600} w={90} h={300} color="#12080c" />
            <Gopuram x={340} base={600} w={100} h={340} color="#12080c" />
            <Gopuram x={200} base={560} w={70} h={200} color="#1a0a10" opacity={0.8} />
            <Rect x={-200} y={590} width={W + 400} height={400} fill="#0d0609" />
            <Path d="M110 600 L130 470 Q200 410 270 470 L290 600Z" fill="#1c0b10" />
          </>
        ),
        front: (
          <>
            <Rect x={150} y={560} width={100} height={40} fill="#050304" />
            <King x={200} y={575} s={1.35} color="#050304" />
            <Sage x={90} y={690} s={0.9} color="#060304" />
            <Sage x={150} y={700} s={0.8} color="#060304" />
            <Sage x={260} y={700} s={0.8} color="#060304" flip />
            <Sage x={320} y={690} s={0.9} color="#060304" flip />
          </>
        ),
      };

    case 'divine-birth':
      return {
        shade: '#0a0814',
        rays: { x: 200, y: 400, color: '#fff1c4', opacity: 0.35 },
        back: (
          <>
            <Sky stops={['#06061a', '#20163a', '#4a2c30', '#2a1a18']} />
            <Glow cx={200} cy={410} r={330} color="#ffd98c" opacity={0.9} />
            <Rect x={170} y={-200} width={60} height={1000} fill="#fff3cc" opacity={0.16} />
            <Rect x={188} y={-200} width={24} height={1000} fill="#fff8e0" opacity={0.25} />
          </>
        ),
        mid: <Ridge seed={21} y={640} amp={20} color="#1a1220" />,
        front: (
          <>
            <Glow cx={200} cy={470} r={120} color="#fff2c8" opacity={0.9} />
            <King x={200} y={560} s={1.5} color="#fff4d6" opacity={0.95} />
            <Person x={70} y={680} s={1.1} color="#0d0910" />
            <Person x={330} y={680} s={1.1} color="#0d0910" flip />
            <Sage x={130} y={700} s={0.8} color="#0d0910" />
            <Sage x={270} y={700} s={0.8} color="#0d0910" flip />
          </>
        ),
      };

    case 'coronation':
      return {
        shade: '#140b1c',
        rays: { x: 200, y: 260, color: '#ffe2a8', opacity: 0.25 },
        back: (
          <>
            <Sky stops={['#140c2a', '#3f2350', '#a8566a', '#f0b070']} />
            <Glow cx={200} cy={250} r={220} color="#ffe3a6" />
            <Cloud x={60} y={360} s={1.5} color="#f7c9a0" opacity={0.35} />
            <Cloud x={340} y={330} s={1.7} color="#f7c9a0" opacity={0.35} />
            {[60, 120, 280, 340].map((x, i) => (
              <Person key={x} x={x} y={330 - (i % 2) * 20} s={0.6} color="#fbe3c0" opacity={0.28} />
            ))}
          </>
        ),
        mid: (
          <>
            <Glow cx={200} cy={250} r={90} color="#fff1c4" />
            <Lotus x={200} y={330} s={0.9} color="#ffe2a0" fill="rgba(255,220,150,0.18)" />
            <Sage x={200} y={300} s={0.9} color="#fff0cf" opacity={0.9} />
            <Ridge seed={5} y={640} amp={30} color="#2b1830" />
          </>
        ),
        front: (
          <>
            <King x={200} y={650} s={1.2} color="#120a16" />
            <Kneel x={90} y={680} s={1} color="#120a16" />
            <Kneel x={310} y={680} s={1} color="#120a16" flip />
          </>
        ),
      };

    case 'famine':
      return {
        shade: '#2a2014',
        back: (
          <>
            <Sky stops={['#cbbd9c', '#dcc8a0', '#e6d2aa']} />
            <Glow cx={300} cy={160} r={140} color="#fffbe8" />
            <Ridge seed={14} y={500} amp={24} color="#b49a72" opacity={0.7} />
            <Gopuram x={300} base={505} w={30} h={90} color="#8f7a5a" opacity={0.7} />
          </>
        ),
        mid: (
          <>
            <Rect x={-200} y={500} width={W + 400} height={500} fill="#a8875a" />
            <Cracks seed={8} top={520} color="#5a4430" width={1.6} />
            <Path d="M70 560 L74 470 M74 500 L52 470 M74 490 L96 460 M60 478 L48 466" stroke="#4a3626" strokeWidth={4} strokeLinecap="round" />
          </>
        ),
        front: (
          <>
            {range(5).map((i) => (
              <Person key={i} x={150 + i * 42} y={630 + (i % 2) * 18} s={0.9 - i * 0.02} color="#3a2c1e" thin flip />
            ))}
            <Cow x={90} y={680} s={0.9} color="#3a2c1e" flip />
            <Person x={340} y={690} s={0.75} color="#3a2c1e" thin flip />
          </>
        ),
      };

    case 'wrath':
      return {
        shade: '#120404',
        back: (
          <>
            <Sky stops={['#140303', '#4a0b0a', '#a82a16', '#f06a2a']} />
            <Glow cx={200} cy={560} r={300} color="#ff7a3a" opacity={0.8} />
            <Cloud x={80} y={180} s={1.8} color="#2a0806" opacity={0.85} />
            <Cloud x={320} y={240} s={2} color="#2a0806" opacity={0.85} />
          </>
        ),
        mid: (
          <>
            <Ridge seed={2} y={590} amp={30} color="#2a0806" />
            <Cracks seed={4} top={620} color="#ff6a2a" width={2.4} />
          </>
        ),
        front: <King x={190} y={700} s={2.3} color="#0a0202" bow="aim" />,
      };

    case 'cosmic-chase':
      return {
        shade: '#03040c',
        back: (
          <>
            <Sky stops={['#020308', '#070b22', '#141040', '#0a0a24']} />
            <Glow cx={90} cy={220} r={180} color="#6a3ab0" opacity={0.45} />
            <Glow cx={330} cy={520} r={200} color="#1a8a9a" opacity={0.35} />
            <Circle cx={320} cy={150} r={34} fill="#c9a26a" opacity={0.85} />
            <Path d="M270 150 Q320 130 370 150" stroke="#e8cc90" strokeWidth={2} fill="none" opacity={0.7} />
            <Circle cx={70} cy={600} r={18} fill="#7a90c0" opacity={0.7} />
          </>
        ),
        mid: (
          <>
            {range(7).map((i) => (
              <Rect key={i} x={30 + i * 16} y={420 + i * 9} width={120 - i * 12} height={1.5} fill="#ffffff" opacity={0.25 - i * 0.03} />
            ))}
            <Person x={40} y={520} s={0.45} color="#9aa6d8" opacity={0.5} />
          </>
        ),
        front: (
          <>
            <Glow cx={230} cy={420} r={110} color="#ffffff" opacity={0.5} />
            <Cow x={230} y={460} s={1.6} color="#f4efe6" legs="run" />
          </>
        ),
      };

    case 'earth-speaks':
      return {
        shade: '#0e0a1a',
        rays: { x: 280, y: 520, color: '#ffe6c0', opacity: 0.14 },
        back: (
          <>
            <Sky stops={['#0f0b22', '#2c2150', '#7a5070', '#c88a6a']} />
            <Glow cx={290} cy={520} r={220} color="#ffd6a8" opacity={0.6} />
            <Ridge seed={30} y={600} amp={30} color="#2a2040" />
          </>
        ),
        mid: <Rect x={-200} y={640} width={W + 400} height={400} fill="#171228" />,
        front: (
          <>
            <Glow cx={290} cy={530} r={100} color="#fff4dc" opacity={0.6} />
            <Cow x={290} y={610} s={1.5} color="#f6efe2" flip />
            <Kneel x={110} y={640} s={1.6} color="#08060f" crown bow />
          </>
        ),
      };

    case 'levelling':
      return {
        shade: '#1c1a14',
        back: (
          <>
            <Sky stops={['#2a3a5a', '#7f94a8', '#e8c890', '#f6dca0']} />
            <Glow cx={200} cy={470} r={200} color="#fff0c8" />
            <Ridge seed={11} y={470} amp={50} color="#6a7088" opacity={0.6} step={80} />
          </>
        ),
        mid: (
          <>
            <Rect x={-200} y={480} width={W + 400} height={500} fill="#7a5a3a" />
            <Furrows top={480} color="#4a3422" />
          </>
        ),
        front: (
          <>
            <Cow x={150} y={640} s={1.1} color="#2a1c12" />
            <Path d="M200 608 L250 630 L262 652" stroke="#2a1c12" strokeWidth={4} fill="none" strokeLinecap="round" />
            <Person x={276} y={656} s={0.95} color="#2a1c12" />
            <King x={340} y={600} s={0.9} color="#2a1c12" bow="lowered" />
            <Person x={60} y={600} s={0.8} color="#2a1c12" flip />
          </>
        ),
      };

    case 'harvest':
    default:
      return {
        shade: '#16200e',
        rays: { x: 200, y: 330, color: '#fff0b0', opacity: 0.22 },
        back: (
          <>
            <Sky stops={['#2f5274', '#d89a58', '#f6c878', '#ffe6a8']} />
            <Glow cx={200} cy={340} r={230} color="#fff2c0" />
            <Cloud x={200} y={170} s={2.2} color="#fff4dc" opacity={0.22} />
            <Glow cx={200} cy={160} r={90} color="#fff8e8" opacity={0.35} />
            <Ridge seed={19} y={430} amp={40} color="#6a8a6a" opacity={0.7} step={70} />
          </>
        ),
        mid: (
          <>
            <Rect x={-200} y={440} width={W + 400} height={600} fill="#4f8a3a" />
            <Furrows top={440} color="#8cc060" opacity={0.6} />
            <Path d="M-40 800 C80 690 150 560 190 444 C200 520 230 640 360 800Z" fill="#7ab8d0" opacity={0.75} />
            <Tree x={40} base={560} s={0.9} color="#24401c" />
            <Tree x={370} base={540} s={1} color="#24401c" />
          </>
        ),
        front: (
          <>
            <Cow x={100} y={650} s={1} color="#2c2418" />
            <Cow x={50} y={672} s={0.6} color="#2c2418" />
            <Person x={300} y={665} s={0.85} color="#2c2418" />
            <Person x={332} y={675} s={0.7} color="#2c2418" />
            <King x={320} y={520} s={0.55} color="#24401c" />
          </>
        ),
      };
  }
}

export const VIEW = `0 0 ${W} ${H}`;
