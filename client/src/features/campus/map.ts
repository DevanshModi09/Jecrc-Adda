import { WORLD_SIZE } from '@adda/shared';

// JECRC University Campus Map, built with pixel-art arcade geometry.
// Source of truth: top-down campus layout topology.
export const W = WORLD_SIZE.w; // 120
export const H = WORLD_SIZE.h; // 80
export const TILE = 16; // source pixels per tile

export const T = {
  Grass: 0,
  Path: 1,
  Floor: 2,
  Wall: 3,
  Tree: 4,
  Water: 5,
  Bench: 6,
  Desk: 7,
  Shelf: 8,
  Counter: 9,
  Stage: 10,
  Flower: 11,
  Pc: 12,
  Deck: 13,
  Seat: 14,
  Table: 15,
  Stall: 16,
  Umbrella: 17,
  Beanbag: 18,
  Fire: 19,
  Game: 20,
  // Sports & Campus Terrain
  Track: 21,
  FieldLine: 22,
  Court: 23,
  CourtLine: 24,
  Turf: 25,
  Pitch: 26,
  Goal: 27,
  Gate: 28,
} as const;
export type T = (typeof T)[keyof typeof T];

const BLOCKING = new Set<T>([
  T.Wall,
  T.Tree,
  T.Water,
  T.Bench,
  T.Desk,
  T.Shelf,
  T.Counter,
  T.Pc,
  T.Table,
  T.Stall,
  T.Umbrella,
  T.Fire,
  T.Game,
  T.Goal,
  T.Gate,
]);

const SEATS = new Set<T>([T.Seat, T.Beanbag]);

export type ZoneId =
  | 'vib'
  | 'lawn'
  | 'football'
  | 'nyb'
  | 'bh1'
  | 'mess'
  | 'basketball'
  | 'bh2'
  | 'cricket'
  | 'tennis'
  | 'gh'
  | 'jmch'
  | 'ground'
  | 'bh3'
  | 'maingate'
  | 'gate3'
  | 'gate16';

export interface Zone {
  id: ZoneId;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Building {
  id: string;
  label: string;
  category: 'academic' | 'hostel' | 'mess' | 'institutional';
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DiningTable {
  id: string;
  zone: ZoneId;
  size: 2 | 3 | 4;
  x: number;
  y: number;
  seats: [number, number][];
}

export interface Counter {
  zone: ZoneId;
  uniform: string;
  kitchen: [number, number];
  staff: { x: number; y: number; name: string }[];
}

export interface CampusMap {
  tiles: Uint8Array;
  tables: DiningTable[];
  counters: Counter[];
  zones: Zone[];
  buildings: Building[];
  at: (x: number, y: number) => T;
  blocked: (x: number, y: number) => boolean;
  isSeat: (x: number, y: number) => boolean;
  tableAt: (x: number, y: number) => DiningTable | null;
  zoneAt: (x: number, y: number) => Zone | null;
}

/** Deterministic per-tile noise so the map looks identical for every player. */
export const hash = (x: number, y: number) => {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) >>> 0) % 1000;
};

// =========================================================================
// CENTRALIZED MAP GEOMETRY DEFINITIONS
// =========================================================================

interface BuildingDef {
  id: string;
  label: string;
  category: 'academic' | 'hostel' | 'mess' | 'institutional';
  x: number;
  y: number;
  w: number;
  h: number;
  doors: [number, number][];
}

const BUILDINGS: BuildingDef[] = [
  // West Academic Block (x: 2..16, y: 14..34)
  {
    id: 'vib',
    label: 'VIB',
    category: 'academic',
    x: 2,
    y: 14,
    w: 15,
    h: 21,
    doors: [
      [16, 23],
      [16, 24],
    ],
  },
  // Academic Block below Football Ground (x: 43..60, y: 25..38)
  {
    id: 'nyb',
    label: 'NYB',
    category: 'academic',
    x: 43,
    y: 25,
    w: 18,
    h: 14,
    doors: [
      [51, 25],
      [52, 25],
      [51, 38],
      [52, 38],
    ],
  },
  // Boys Hostel 1 (x: 65..78, y: 8..22)
  {
    id: 'bh1',
    label: 'BH1',
    category: 'hostel',
    x: 65,
    y: 8,
    w: 14,
    h: 15,
    doors: [
      [65, 15],
      [65, 16],
      [71, 22],
      [72, 22],
    ],
  },
  // Campus Mess (x: 65..78, y: 25..38)
  {
    id: 'mess',
    label: 'MESS',
    category: 'mess',
    x: 65,
    y: 25,
    w: 14,
    h: 14,
    doors: [
      [65, 31],
      [65, 32],
      [71, 25],
      [72, 25],
      [71, 38],
      [72, 38],
    ],
  },
  // Boys Hostel 2 (x: 95..111, y: 8..22)
  {
    id: 'bh2',
    label: 'BH2',
    category: 'hostel',
    x: 95,
    y: 8,
    w: 17,
    h: 15,
    doors: [
      [95, 15],
      [95, 16],
      [103, 22],
      [104, 22],
    ],
  },
  // Girls Hostel (x: 100..112, y: 25..38)
  {
    id: 'gh',
    label: 'GH',
    category: 'hostel',
    x: 100,
    y: 25,
    w: 13,
    h: 14,
    doors: [
      [100, 31],
      [100, 32],
      [106, 25],
      [107, 25],
    ],
  },
  // JMCH (Medical College Block - South-West, x: 13..52, y: 46..62)
  {
    id: 'jmch',
    label: 'JMCH',
    category: 'institutional',
    x: 13,
    y: 46,
    w: 40,
    h: 17,
    doors: [
      [32, 46],
      [33, 46],
      [52, 54],
      [52, 55],
    ],
  },
  // Boys Hostel 3 (x: 62..93, y: 68..77)
  {
    id: 'bh3',
    label: 'BH3',
    category: 'hostel',
    x: 62,
    y: 68,
    w: 32,
    h: 10,
    doors: [
      [93, 71],
      [93, 72],
      [77, 68],
      [78, 68],
    ],
  },
];

// Campus Road network segments [x, y, w, h]
const ROAD_SEGMENTS: [number, number, number, number][] = [
  // 1. Main Gate entrance road coming south into Central Lawn ring
  [30, 1, 3, 8],

  // 2. Central Lawn ring road (completely encircling Central Lawn)
  [21, 8, 21, 2], // north side
  [21, 8, 2, 33], // west side
  [21, 39, 21, 2], // south side
  [40, 8, 2, 33], // east side

  // 3. Road to VIB (west) - connects right wall of VIB (x=16) to Central Lawn west road (x=21)
  [16, 23, 6, 2],

  // 4. Upper campus east-west avenue (north of Football, BH1, Basketball, BH2)
  [41, 6, 74, 2],

  // 5. Gate No. 3 road and central north-south spine between Football/NYB and BH1/Mess
  [62, 1, 3, 42],

  // 6. Road between Football Ground and NYB
  [41, 23, 22, 2],

  // 7. Road between BH1 and Mess
  [63, 23, 18, 2],

  // 8. Sports Avenue between BH1/Mess and Basketball/Cricket
  [79, 6, 3, 37],

  // 9. Crossroad between Basketball and Cricket Turf
  [81, 19, 18, 2],

  // 10. Crossroad between BH2 and GH (south of BH2)
  [93, 23, 22, 2],
  [91, 15, 4, 2], // connector to BH2 west door
  [97, 31, 3, 2], // connector to GH west door

  // 11. Eastern perimeter avenue (passes GH, Ground, leads to Gate 16)
  [113, 6, 3, 60],
  [115, 35, 5, 2], // road out to Gate No. 16

  // 12. Main East-West Campus Road (arterial road between Upper Campus and JMCH/Ground)
  [10, 41, 106, 3],

  // Short paths to building doors from Campus Road
  [51, 39, 2, 3], // NYB south door connector
  [71, 39, 2, 3], // Mess south door connector
  [32, 43, 2, 3], // JMCH north door connector

  // 13. Avenue between JMCH and Large Ground
  [53, 43, 4, 23],

  // 14. Road west of JMCH
  [11, 43, 2, 23],

  // 15. Road south of JMCH
  [11, 64, 46, 2],

  // 16. Road south of Large Ground
  [54, 64, 62, 2],

  // 17. Connecting road south from Ground down to BH3
  [98, 64, 2, 9],
  [93, 71, 6, 2], // enters BH3 east door at x=93
];

export const MAP_ZONES: Zone[] = [
  { id: 'maingate', label: 'MAIN GATE', x: 28, y: 0, w: 7, h: 8 },
  { id: 'gate3', label: 'GATE NO. 3', x: 60, y: 0, w: 7, h: 7 },
  { id: 'gate16', label: 'GATE NO. 16', x: 114, y: 33, w: 6, h: 6 },
  { id: 'vib', label: 'VIB', x: 2, y: 14, w: 15, h: 21 },
  { id: 'lawn', label: 'CENTRAL LAWN', x: 21, y: 8, w: 21, h: 33 },
  { id: 'football', label: 'FOOTBALL GROUND', x: 42, y: 7, w: 20, h: 17 },
  { id: 'nyb', label: 'NYB', x: 42, y: 24, w: 20, h: 16 },
  { id: 'bh1', label: 'BH1', x: 64, y: 7, w: 16, h: 17 },
  { id: 'mess', label: 'MESS', x: 64, y: 24, w: 16, h: 16 },
  { id: 'basketball', label: 'BASKETBALL', x: 81, y: 7, w: 13, h: 13 },
  { id: 'bh2', label: 'BH2', x: 94, y: 7, w: 19, h: 17 },
  { id: 'cricket', label: 'CRICKET TURF', x: 81, y: 20, w: 8, h: 20 },
  { id: 'tennis', label: 'TENNIS COURT', x: 89, y: 24, w: 10, h: 16 },
  { id: 'gh', label: 'GH', x: 99, y: 24, w: 15, h: 16 },
  { id: 'jmch', label: 'JMCH', x: 11, y: 44, w: 43, h: 21 },
  { id: 'ground', label: 'GROUND', x: 56, y: 44, w: 58, h: 21 },
  { id: 'bh3', label: 'BH3', x: 60, y: 66, w: 36, h: 13 },
];

export function buildCampus(): CampusMap {
  const tiles = new Uint8Array(W * H).fill(T.Grass);

  const set = (x: number, y: number, t: T) => {
    if (x >= 0 && y >= 0 && x < W && y < H) tiles[y * W + x] = t;
  };

  const rect = (x: number, y: number, w: number, h: number, t: T) => {
    for (let j = y; j < y + h; j++) {
      for (let i = x; i < x + w; i++) {
        set(i, j, t);
      }
    }
  };

  const buildings: Building[] = [];
  const tables: DiningTable[] = [];

  const table = (zone: ZoneId, x: number, y: number, size: 2 | 3 | 4, outdoor = false) => {
    const seats: [number, number][] = ([[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]] as [number, number][]).slice(0, size);
    set(x, y, outdoor ? T.Umbrella : T.Table);
    for (const [sx, sy] of seats) set(sx, sy, outdoor ? T.Beanbag : T.Seat);
    tables.push({ id: `t${tables.length + 1}`, zone, size, x, y, seats });
  };

  // 1. Lay down the complete road network
  for (const [rx, ry, rw, rh] of ROAD_SEGMENTS) {
    rect(rx, ry, rw, rh, T.Path);
  }

  // 2. Construct all buildings
  for (const b of BUILDINGS) {
    rect(b.x, b.y, b.w, b.h, T.Wall);
    rect(b.x + 1, b.y + 1, b.w - 2, b.h - 2, T.Floor);
    for (const [dx, dy] of b.doors) {
      set(dx, dy, T.Floor);
    }
    buildings.push({
      id: b.id,
      label: b.label,
      category: b.category,
      x: b.x,
      y: b.y,
      w: b.w,
      h: b.h,
    });
  }

  // 3. Central Lawn Landscaping (enclosed garden)
  // Walkable pathways, flowerbeds, fountain, park benches, trees
  rect(24, 10, 15, 27, T.Grass);
  rect(30, 10, 3, 27, T.Path); // North-south central garden path
  rect(24, 23, 15, 2, T.Path); // East-west garden path
  rect(29, 21, 5, 5, T.Water); // Central water fountain / pond
  // Floral borders & decorative deck/benches
  for (let y = 12; y <= 35; y += 4) {
    set(26, y, T.Bench);
    set(36, y, T.Bench);
    set(25, y, T.Flower);
    set(37, y, T.Flower);
    set(28, y, T.Tree);
    set(34, y, T.Tree);
  }

  // 4. Football Ground (outdoor sports field)
  rect(43, 8, 18, 15, T.Grass);
  // Pitch outer chalk boundary
  for (let x = 44; x <= 59; x++) {
    set(x, 9, T.FieldLine);
    set(x, 21, T.FieldLine);
  }
  for (let y = 9; y <= 21; y++) {
    set(44, y, T.FieldLine);
    set(59, y, T.FieldLine);
    set(51, y, T.FieldLine); // Halfway line
  }
  // Center circle and penalty spots
  rect(50, 14, 3, 3, T.FieldLine);
  set(51, 15, T.Grass);
  rect(45, 13, 2, 5, T.FieldLine);
  rect(57, 13, 2, 5, T.FieldLine);
  // Goalposts
  set(43, 14, T.Goal);
  set(43, 16, T.Goal);
  set(60, 14, T.Goal);
  set(60, 16, T.Goal);

  // 5. Basketball Court (outdoor sports court)
  rect(83, 8, 9, 11, T.Court);
  // Court boundary
  for (let x = 83; x <= 91; x++) {
    set(x, 8, T.CourtLine);
    set(x, 18, T.CourtLine);
  }
  for (let y = 8; y <= 18; y++) {
    set(83, y, T.CourtLine);
    set(91, y, T.CourtLine);
  }
  // Center line and hoops
  for (let x = 84; x <= 90; x++) set(x, 13, T.CourtLine);
  set(87, 8, T.Goal); // North hoop
  set(87, 18, T.Goal); // South hoop

  // 6. Cricket Turf (narrow outdoor sports turf)
  rect(83, 21, 6, 17, T.Turf);
  // Central clay pitch
  rect(85, 24, 2, 11, T.Pitch);
  set(85, 24, T.FieldLine); // Bowling crease
  set(86, 24, T.FieldLine);
  set(85, 34, T.FieldLine); // Batting crease
  set(86, 34, T.FieldLine);
  set(85, 23, T.Goal); // Wickets north
  set(85, 35, T.Goal); // Wickets south

  // 7. Tennis Court (sports court)
  rect(90, 25, 8, 14, T.Court);
  for (let x = 90; x <= 97; x++) {
    set(x, 25, T.CourtLine);
    set(x, 38, T.CourtLine);
    set(x, 31, T.CourtLine); // Net line
  }
  for (let y = 25; y <= 38; y++) {
    set(90, y, T.CourtLine);
    set(97, y, T.CourtLine);
  }
  set(89, 31, T.Goal); // Net post
  set(98, 31, T.Goal);

  // 8. Large Ground (South-East open area)
  rect(58, 46, 54, 18, T.Grass);
  // Running track along perimeter
  for (let x = 58; x <= 111; x++) {
    set(x, 46, T.Track);
    set(x, 47, T.Track);
    set(x, 62, T.Track);
    set(x, 63, T.Track);
  }
  for (let y = 46; y <= 63; y++) {
    set(58, y, T.Track);
    set(59, y, T.Track);
    set(110, y, T.Track);
    set(111, y, T.Track);
  }
  // Spectator benches and shade trees along periphery
  for (let x = 62; x <= 106; x += 6) {
    set(x, 45, T.Bench);
    set(x + 2, 45, T.Tree);
    set(x, 64, T.Bench);
    set(x + 2, 64, T.Tree);
  }

  // 9. Campus Gates (Gate pillars)
  // Main Gate (North)
  set(29, 2, T.Gate);
  set(29, 3, T.Gate);
  set(33, 2, T.Gate);
  set(33, 3, T.Gate);
  // Gate No. 3 (North)
  set(61, 2, T.Gate);
  set(61, 3, T.Gate);
  set(65, 2, T.Gate);
  set(65, 3, T.Gate);
  // Gate No. 16 (East)
  set(118, 34, T.Gate);
  set(119, 34, T.Gate);
  set(118, 37, T.Gate);
  set(119, 37, T.Gate);

  // 10. Building Interiors & Furnishing
  // VIB Academic Block (Engineering classrooms, lab PCs, desks)
  for (let y = 17; y <= 31; y += 3) {
    for (let x = 5; x <= 13; x += 3) {
      if (x !== 8) {
        set(x, y, T.Desk);
        set(x + 1, y, T.Desk);
      }
    }
  }
  for (let y = 17; y <= 29; y += 3) set(4, y, T.Pc);

  // NYB Academic Block (Classrooms & Lecture rooms)
  for (let y = 27; y <= 35; y += 3) {
    for (let x = 46; x <= 57; x += 3) {
      if (x !== 51 && x !== 52) {
        set(x, y, T.Desk);
        set(x + 1, y, T.Desk);
      }
    }
  }

  // JMCH Institutional Medical College Block
  // Lecture theatre rows, medical research desks, PC terminals, central reception
  for (let y = 49; y <= 59; y += 3) {
    for (let x = 16; x <= 26; x += 3) {
      set(x, y, T.Desk);
      set(x + 1, y, T.Desk);
    }
    for (let x = 38; x <= 48; x += 3) {
      set(x, y, T.Pc);
      set(x + 1, y, T.Desk);
    }
  }
  // Central reception / lobby (away from center walkway)
  rect(28, 56, 6, 1, T.Counter);

  // Hostels: BH1, BH2, BH3, GH Furnishing (Study desks, shelves, rooms)
  const furnishHostel = (bx: number, by: number, bw: number, bh: number) => {
    for (let y = by + 2; y <= by + bh - 3; y += 3) {
      set(bx + 2, y, T.Desk);
      set(bx + bw - 3, y, T.Desk);
    }
    set(bx + Math.floor(bw / 2), by + 3, T.Shelf);
    set(bx + Math.floor(bw / 2), by + bh - 4, T.Shelf);
  };
  furnishHostel(65, 8, 14, 15); // BH1
  furnishHostel(95, 8, 17, 15); // BH2
  furnishHostel(100, 25, 13, 14); // GH
  furnishHostel(62, 68, 32, 10); // BH3

  // 11. Campus Mess Dining Setup & Waiter Tables
  // Food serving counter along north wall of Mess
  rect(67, 27, 8, 1, T.Counter);
  // Dining tables with seating
  table('mess', 68, 31, 4);
  table('mess', 74, 31, 4);
  table('mess', 68, 35, 3);
  table('mess', 74, 35, 2);

  // Central Lawn outdoor seating
  table('lawn', 26, 17, 2, true);
  table('lawn', 36, 17, 2, true);
  table('lawn', 26, 29, 2, true);
  table('lawn', 36, 29, 2, true);

  // 12. Peripheral Nature Pass: Trees and Flowers on Open Grass
  const nearNonGrass = (x: number, y: number) => {
    for (let j = -1; j <= 1; j++) {
      for (let i = -1; i <= 1; i++) {
        const xx = x + i;
        const yy = y + j;
        if (xx >= 0 && yy >= 0 && xx < W && yy < H && tiles[yy * W + xx] !== T.Grass) return true;
      }
    }
    return false;
  };

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (tiles[y * W + x] !== T.Grass) continue;
      const edge = x <= 1 || x >= W - 2 || y <= 1 || y >= H - 2;
      const n = hash(x, y);
      if ((edge && n % 3 !== 0 && !nearNonGrass(x, y)) || (n < 45 && !nearNonGrass(x, y))) {
        set(x, y, T.Tree);
      } else if (n > 940 && !nearNonGrass(x, y)) {
        set(x, y, T.Flower);
      }
    }
  }

  const at = (x: number, y: number): T =>
    x < 0 || y < 0 || x >= W || y >= H ? T.Wall : (tiles[y * W + x] as T);

  const counters: Counter[] = [
    {
      zone: 'mess',
      uniform: '#ff8a3d',
      kitchen: [71, 26],
      staff: [
        { x: 68, y: 26, name: 'RAJU' },
        { x: 72, y: 26, name: 'CHOTU' },
        { x: 74, y: 26, name: 'PAPPU' },
      ],
    },
  ];

  const seatTable = new Map<number, DiningTable>();
  for (const t of tables) {
    for (const [sx, sy] of t.seats) {
      seatTable.set(sy * W + sx, t);
    }
  }

  return {
    tiles,
    tables,
    counters,
    zones: MAP_ZONES,
    buildings,
    at,
    blocked: (x, y) => BLOCKING.has(at(Math.floor(x), Math.floor(y))),
    isSeat: (x, y) => SEATS.has(at(Math.floor(x), Math.floor(y))),
    tableAt: (x, y) => seatTable.get(Math.floor(y) * W + Math.floor(x)) ?? null,
    zoneAt: (x, y) =>
      MAP_ZONES.find((z) => x >= z.x && x < z.x + z.w && y >= z.y && y < z.y + z.h) ?? null,
  };
}

/** Feet hitbox (in tiles) around the player's anchor point. */
const HALF_W = 0.28;
const HEIGHT = 0.3;

export function canStand(map: CampusMap, x: number, y: number): boolean {
  return (
    !map.blocked(x - HALF_W, y - HEIGHT) &&
    !map.blocked(x + HALF_W, y - HEIGHT) &&
    !map.blocked(x - HALF_W, y - 0.01) &&
    !map.blocked(x + HALF_W, y - 0.01)
  );
}

/**
 * Shortest walk over whole tiles (4-way BFS) from a tile to the nearest tile matching `goal`.
 * Returns the tiles to step through, excluding the start; null if none is reachable within `maxSteps`.
 */
export function findPath(
  map: CampusMap,
  from: [number, number],
  goal: (x: number, y: number) => boolean,
  maxSteps = 1000
): [number, number][] | null {
  const key = (x: number, y: number) => y * W + x;
  const prev = new Map<number, number>([[key(...from), -1]]);
  let frontier: [number, number][] = [from];
  for (let step = 0; step < maxSteps && frontier.length; step++) {
    const next: [number, number][] = [];
    for (const [x, y] of frontier) {
      if (goal(x, y) && step > 0) {
        const path: [number, number][] = [];
        for (let k = key(x, y); k !== key(...from); k = prev.get(k)!) {
          path.unshift([k % W, Math.floor(k / W)]);
        }
        return path;
      }
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ] as const) {
        const nx = x + dx;
        const ny = y + dy;
        if (
          nx < 0 ||
          ny < 0 ||
          nx >= W ||
          ny >= H ||
          prev.has(key(nx, ny)) ||
          map.blocked(nx + 0.5, ny + 0.5)
        ) {
          continue;
        }
        prev.set(key(nx, ny), key(x, y));
        next.push([nx, ny]);
      }
    }
    frontier = next;
  }
  return null;
}

/** Where a character stands on a tile: centred, feet near the bottom. */
export const standOn = (x: number, y: number) => ({ x: x + 0.5, y: y + 0.75 });
