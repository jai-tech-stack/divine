/**
 * Navagraha positions — real astronomy, computed on the device, no network.
 * Low-precision orbital elements (P. Schlyter / Meeus style): good to a fraction of a degree for the
 * planets and ~0.5° for the Moon — enough to say which rasi a graha is in. Not an ephemeris for casting
 * charts. Rahu/Ketu are the Moon's mean lunar nodes (they are points, not bodies).
 * Sidereal longitude = tropical − Lahiri ayanamsa.
 */

export type GrahaId = 'surya' | 'chandra' | 'mangala' | 'budha' | 'guru' | 'sukra' | 'sani' | 'rahu' | 'ketu';
export type GrahaPos = { id: GrahaId; ta: string; lon: number; rasi: number; deg: number };

export const RASI = ['மேஷம்', 'ரிஷபம்', 'மிதுனம்', 'கடகம்', 'சிம்மம்', 'கன்னி', 'துலாம்', 'விருச்சிகம்', 'தனுசு', 'மகரம்', 'கும்பம்', 'மீனம்'];
export const GRAHA_TA: Record<GrahaId, string> = { surya: 'சூரியன்', chandra: 'சந்திரன்', mangala: 'செவ்வாய்', budha: 'புதன்', guru: 'குரு', sukra: 'சுக்கிரன்', sani: 'சனி', rahu: 'ராகு', ketu: 'கேது' };

const R = Math.PI / 180;
const norm = (x: number) => ((x % 360) + 360) % 360;
const sin = (d: number) => Math.sin(d * R);
const cos = (d: number) => Math.cos(d * R);

/** days since 2000-01-00 (Schlyter's epoch) */
function dayNumber(date: Date) {
  return date.getTime() / 86400000 + 2440587.5 - 2451543.5;
}

function solveKepler(M: number, e: number) {
  let E = M + (e / R) * sin(M) * (1 + e * cos(M));
  for (let i = 0; i < 8; i++) {
    const d = (E - (E - (e / R) * sin(E) - M) / (1 - e * cos(E)));
    if (Math.abs(d - E) < 1e-6) {
      E = d;
      break;
    }
    E = d;
  }
  return E;
}

type El = { N: number; i: number; w: number; a: number; e: number; M: number };
function elements(name: string, d: number): El {
  switch (name) {
    case 'sun': return { N: 0, i: 0, w: 282.9404 + 4.70935e-5 * d, a: 1, e: 0.016709 - 1.151e-9 * d, M: 356.047 + 0.9856002585 * d };
    case 'mercury': return { N: 48.3313 + 3.24587e-5 * d, i: 7.0047 + 5e-8 * d, w: 29.1241 + 1.01444e-5 * d, a: 0.387098, e: 0.205635 + 5.59e-10 * d, M: 168.6562 + 4.0923344368 * d };
    case 'venus': return { N: 76.6799 + 2.4659e-5 * d, i: 3.3946 + 2.75e-8 * d, w: 54.891 + 1.38374e-5 * d, a: 0.72333, e: 0.006773 - 1.302e-9 * d, M: 48.0052 + 1.6021302244 * d };
    case 'mars': return { N: 49.5574 + 2.11081e-5 * d, i: 1.8497 - 1.78e-8 * d, w: 286.5016 + 2.92961e-5 * d, a: 1.523688, e: 0.093405 + 2.516e-9 * d, M: 18.6021 + 0.5240207766 * d };
    case 'jupiter': return { N: 100.4542 + 2.76854e-5 * d, i: 1.303 - 1.557e-7 * d, w: 273.8777 + 1.64505e-5 * d, a: 5.20256, e: 0.048498 + 4.469e-9 * d, M: 19.895 + 0.0830853001 * d };
    default: return { N: 113.6634 + 2.3898e-5 * d, i: 2.4886 - 1.081e-7 * d, w: 339.3939 + 2.97661e-5 * d, a: 9.55475, e: 0.055546 - 9.499e-9 * d, M: 316.967 + 0.0334442282 * d };
  }
}

/** heliocentric rectangular ecliptic coords (AU) */
function helio(name: string, d: number) {
  const el = elements(name, d);
  const M = norm(el.M);
  const E = solveKepler(M, el.e);
  const xv = el.a * (cos(E) - el.e);
  const yv = el.a * Math.sqrt(1 - el.e * el.e) * sin(E);
  const v = norm(Math.atan2(yv, xv) / R);
  const r = Math.sqrt(xv * xv + yv * yv);
  const N = el.N, w = el.w, i = el.i;
  return {
    x: r * (cos(N) * cos(v + w) - sin(N) * sin(v + w) * cos(i)),
    y: r * (sin(N) * cos(v + w) + cos(N) * sin(v + w) * cos(i)),
    z: r * (sin(v + w) * sin(i)),
    lonSun: norm(v + w),
    r,
  };
}

function sunGeo(d: number) {
  const s = helio('sun', d);
  // the sun's "orbit" is the earth's seen from earth: longitude = v + w
  return { x: s.r * cos(s.lonSun), y: s.r * sin(s.lonSun), lon: s.lonSun };
}

function moonLon(d: number) {
  const el = { N: 125.1228 - 0.0529538083 * d, w: 318.0634 + 0.1643573223 * d, M: 115.3654 + 13.0649929509 * d };
  const e = 0.0549;
  const M = norm(el.M);
  const E0 = M + (e / R) * sin(M) * (1 + e * cos(M));
  const E = E0 - (E0 - (e / R) * sin(E0) - M) / (1 - e * cos(E0));
  const xv = 60.2666 * (cos(E) - e);
  const yv = 60.2666 * Math.sqrt(1 - e * e) * sin(E);
  const v = norm(Math.atan2(yv, xv) / R);
  const N = el.N, w = el.w, i = 5.1454;
  const xe = Math.sqrt(xv * xv + yv * yv) * (cos(N) * cos(v + w) - sin(N) * sin(v + w) * cos(i));
  const ye = Math.sqrt(xv * xv + yv * yv) * (sin(N) * cos(v + w) + cos(N) * sin(v + w) * cos(i));
  let lon = norm(Math.atan2(ye, xe) / R);
  const Ms = norm(356.047 + 0.9856002585 * d);
  const Ls = norm(282.9404 + 4.70935e-5 * d + Ms);
  const Mm = M, Lm = norm(N + el.w + Mm);
  const D = norm(Lm - Ls), F = norm(Lm - N);
  lon += -1.274 * sin(Mm - 2 * D) + 0.658 * sin(2 * D) - 0.186 * sin(Ms) - 0.059 * sin(2 * Mm - 2 * D) - 0.057 * sin(Mm - 2 * D + Ms) + 0.053 * sin(Mm + 2 * D) + 0.046 * sin(2 * D - Ms) + 0.041 * sin(Mm - Ms) - 0.035 * sin(D) - 0.031 * sin(Mm + Ms) - 0.015 * sin(2 * F - 2 * D) + 0.011 * sin(Mm - 4 * D);
  return norm(lon);
}

/** Lahiri (Chitrapaksha) ayanamsa, degrees — linear in time; fine for rasi-level work */
export function lahiri(date: Date) {
  const years = (date.getTime() / 86400000 + 2440587.5 - 2451545) / 365.25;
  return 23.85306 + 0.013972 * years;
}

export function grahas(date: Date = new Date()): GrahaPos[] {
  const d = dayNumber(date);
  const ay = lahiri(date);
  const sun = sunGeo(d);
  const out: Record<GrahaId, number> = {} as never;
  out.surya = sun.lon;
  out.chandra = moonLon(d);
  const pl: [GrahaId, string][] = [['mangala', 'mars'], ['budha', 'mercury'], ['guru', 'jupiter'], ['sukra', 'venus'], ['sani', 'saturn']];
  for (const [id, n] of pl) {
    const p = helio(n, d);
    out[id] = norm(Math.atan2(p.y + sun.y, p.x + sun.x) / R);
  }
  const node = norm(125.1228 - 0.0529538083 * d); // mean ascending node = Rahu
  out.rahu = node;
  out.ketu = norm(node + 180);
  return (Object.keys(GRAHA_TA) as GrahaId[]).map((id) => {
    const lon = norm(out[id] - ay);
    return { id, ta: GRAHA_TA[id], lon, rasi: Math.floor(lon / 30), deg: lon % 30 };
  });
}

/** a short Tamil line per graha for the companion */
export function grahaLines(date: Date = new Date()) {
  return grahas(date).map((g) => `${g.ta}: ${RASI[g.rasi]} ${Math.floor(g.deg)}°`);
}
