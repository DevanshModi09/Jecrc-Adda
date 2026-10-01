import { Link } from 'react-router';
import { useFreeRooms } from '../../hooks/queries';
import { useNow } from '../../hooks/useNow';
import { realtime } from '../../lib/realtime';
import { GAME_NAMES, type GameKind, type PublicUser, type WorldPlayer } from '@adda/shared';
import { games } from '../../stores/games';
import type { Seating } from './engine';
import type { Zone, ZoneId } from './map';

// Mess / café menus. Ordering says it out loud and server brings it to your table.
const MENUS: Partial<Record<ZoneId, { blurb: string; items: [string, number, string][] }>> = {
  mess: {
    blurb: 'Campus Mess. Sit down at a table and the waiter serves your order.',
    items: [
      ['Special Veg Thali', 60, '🍱'],
      ['Rajma Chawal', 50, '🍛'],
      ['Aloo Paratha', 35, '🥞'],
      ['Masala Chai', 10, '☕'],
      ['Maggi Bowl', 40, '🍜'],
      ['Cold Coffee', 35, '🧋'],
    ],
  },
  lawn: {
    blurb: 'Central Lawn. Shaded grass, open air, and fresh refreshments.',
    items: [
      ['Nimbu Pani', 20, '🍋'],
      ['Cold Coffee', 35, '🧋'],
      ['Cutting Chai', 10, '☕'],
      ['Samosa', 15, '🥟'],
    ],
  },
};

const HANGOUTS: Partial<Record<ZoneId, { blurb: string; lines: [string, string][] }>> = {
  lawn: {
    blurb: 'Central Lawn. Green garden space in the heart of campus.',
    lines: [
      ['START A JAM', 'who has a guitar? let’s jam on Central Lawn 🎸'],
      ['STUDY GROUP', 'revising lecture notes in the sun 📚'],
      ['CHILL VIBES', 'relaxing by the fountain ⛲ come sit'],
    ],
  },
  bh1: {
    blurb: 'Boys Hostel 1. Rooms, corridors and late night debates.',
    lines: [
      ['ROOM 204', 'anyone awake in BH1? chai trip downstairs ☕'],
      ['EXAM PREP', 'discussing tomorrow’s lab viva 📝'],
      ['FIFA MATCH', 'BH1 common room FIFA tournament 🎮'],
    ],
  },
  bh2: {
    blurb: 'Boys Hostel 2. Upper campus hostel beside the courts.',
    lines: [
      ['HOOPS', 'who is down for basketball downstairs? 🏀'],
      ['ROOM 312', 'study session in BH2 corridor 📖'],
      ['FOOD RUN', 'heading to the mess for dinner 🍛'],
    ],
  },
  bh3: {
    blurb: 'Boys Hostel 3. South campus hostel below the Ground.',
    lines: [
      ['GROUND RUN', 'morning laps on the track 🏃‍♂️'],
      ['COMMON ROOM', 'chilling in BH3 common room 🛋️'],
      ['NIGHT WALK', 'heading up to Main Gate for fresh air 🌙'],
    ],
  },
  gh: {
    blurb: 'Girls Hostel. East campus hostel beside the tennis court.',
    lines: [
      ['COMMON ROOM', 'movie night in the common room 🍿'],
      ['TENNIS MATCH', 'tennis practice outside court 🎾'],
      ['CHAI TIME', 'tea break between classes 🫖'],
    ],
  },
};

const sayNearby = (text: string) => realtime.send({ type: 'world:say', text });

interface Props {
  zone: Zone;
  seating: Seating | null;
  players: WorldPlayer[];
  me: PublicUser;
  onSit: () => void;
}

export function ZonePanel({ zone, seating, players, me, onSit }: Props) {
  return (
    <section className="panel panel--cyan campus__zone" aria-live="polite">
      <h2 className="panel__title">{zone.label}</h2>
      {zone.id === 'vib' || zone.id === 'nyb' ? (
        <BuildingRooms building={zone.id.toUpperCase()} />
      ) : zone.id === 'jmch' ? (
        <JMCHPanel />
      ) : zone.id === 'mess' ? (
        <Cafe menu={MENUS.mess!} seating={seating} onSit={onSit} />
      ) : zone.id === 'football' ||
        zone.id === 'basketball' ||
        zone.id === 'cricket' ||
        zone.id === 'tennis' ||
        zone.id === 'ground' ? (
        <SportsPanel zoneId={zone.id} players={players.filter((p) => p.id !== me.id)} />
      ) : HANGOUTS[zone.id] ? (
        <Hangout spot={HANGOUTS[zone.id]!} />
      ) : zone.id === 'maingate' || zone.id === 'gate3' || zone.id === 'gate16' ? (
        <GatePanel zoneId={zone.id} label={zone.label} />
      ) : (
        <p className="muted">Welcome to JECRC Campus. Walk into academic blocks to view free rooms, visit the mess to dine, or challenge students on the sports grounds.</p>
      )}
    </section>
  );
}

function BuildingRooms({ building }: { building: string }) {
  const now = useNow(30_000);
  const { data } = useFreeRooms(now);
  const isVib = building === 'VIB';
  return (
    <>
      <p className="dim" style={{ marginBottom: 6 }}>
        {isVib ? 'Engineering Block. Classes, labs and lecture rooms.' : 'Academic Block. Classes and lecture rooms.'}
      </p>
      {!data ? (
        <p className="muted">SCANNING ROOMS…</p>
      ) : (
        <>
          <p className="muted">
            {data.period ? `FREE IN ${data.period.start}–${data.period.end}` : 'NO CLASSES RUNNING'} · {data.free.filter((r) => r.startsWith(building)).length} ROOMS
          </p>
          <div className="free__rooms campus__rooms">
            {data.free
              .filter((r) => r.startsWith(building))
              .slice(0, 14)
              .map((r) => (
                <span key={r} className="free__room">
                  {r.replace(`${building} `, '')}
                </span>
              ))}
          </div>
        </>
      )}
      <Link to="/timetable" className="px-xs">
        OPEN TIMETABLE ▶
      </Link>
    </>
  );
}

function JMCHPanel() {
  return (
    <>
      <p className="dim" style={{ marginBottom: 8 }}>
        Medical College area at JECRC University. Lecture theatres, labs, and healthcare research facilities.
      </p>
      <div className="stack" style={{ gap: 8 }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span className="c-cyan">STATUS</span>
          <span className="c-green">ACTIVE CAMPUS</span>
        </div>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span className="muted">FACILITIES</span>
          <span>ANATOMY LAB · LECTURE HALLS</span>
        </div>
        <Link to="/timetable" className="px-xs" style={{ marginTop: 4 }}>
          VIEW MEDICAL TIMETABLE ▶
        </Link>
      </div>
    </>
  );
}

function Cafe({ menu, seating, onSit }: { menu: NonNullable<(typeof MENUS)[ZoneId]>; seating: Seating | null; onSit: () => void }) {
  const order = (item: string, emoji: string) => {
    sayNearby(`one ${item.toLowerCase()} please ${emoji}`);
    if (seating) realtime.send({ type: 'world:serve', tableId: seating.table.id, item: emoji });
  };
  return (
    <>
      {seating ? (
        <div className="campus__table">
          <p className="c-green">
            TABLE FOR {seating.table.size} · {seating.mates.length + 1}/{seating.table.size} SEATED
          </p>
          <p className="muted">
            {seating.mates.length ? `WITH ${seating.mates.map((m) => m.name.split(' ')[0]!.toUpperCase()).join(', ')}` : 'Just you. Call your friends over!'}
          </p>
          <button type="button" className="campus__order line" onClick={() => sayNearby('cheers! 🥂')}>
            <span className="upper">🥂 Cheers</span>
            <span className="c-cyan">SAY ▶</span>
          </button>
        </div>
      ) : (
        <>
          <p className="muted">{menu.blurb}</p>
          <button type="button" className="btn btn--sm btn--block campus__sit" onClick={onSit}>
            🪑 SIT AT A TABLE (E)
          </button>
        </>
      )}
      <p className="px-xs c-cyan campus__menu-head">{seating ? 'ORDER TO YOUR TABLE' : 'MENU · SIT DOWN AND THE WAITER BRINGS IT'}</p>
      {menu.items.map(([item, price, emoji]) => (
        <button key={item} type="button" className="line campus__order" onClick={() => order(item, emoji)}>
          <span className="upper">
            {emoji} {item}
          </span>
          <span className="c-yellow">₹{price} ORDER ▶</span>
        </button>
      ))}
    </>
  );
}

const GAME_KINDS: GameKind[] = ['ttt', 'c4', 'rps'];

function SportsPanel({ zoneId, players }: { zoneId: ZoneId; players: WorldPlayer[] }) {
  const descriptions: Record<string, string> = {
    football: 'Outdoor sports field. Goalposts and grass pitch ready for a match.',
    basketball: 'Acrylic outdoor basketball court with hoops and key lines.',
    cricket: 'Synthetic cricket turf with central batting pitch.',
    tennis: 'Standard tennis court with center net markings.',
    ground: 'Major campus open ground ringed by a running track.',
  };

  return (
    <>
      <p className="muted" style={{ marginBottom: 10 }}>
        {descriptions[zoneId] ?? 'Campus sports area.'}
      </p>
      <p className="px-xs c-yellow" style={{ marginBottom: 6 }}>
        CHALLENGE PLAYERS NEARBY
      </p>
      {players.length ? (
        players.slice(0, 5).map((p) => (
          <div key={p.id} className="campus__challenger">
            <span className="upper truncate" style={{ color: p.color }}>
              {p.name}
            </span>
            <span className="row">
              {GAME_KINDS.map((k) => (
                <button key={k} type="button" className="chip" onClick={() => games.challenge(p.id, k)} title={`Challenge to ${GAME_NAMES[k]}`}>
                  {k === 'ttt' ? 'XOXO' : k === 'c4' ? 'C4' : 'RPS'}
                </button>
              ))}
            </span>
          </div>
        ))
      ) : (
        <p className="dim">No other players nearby right now. Bring your squad here!</p>
      )}
      <div style={{ marginTop: 10 }}>
        <button
          type="button"
          className="line campus__order"
          onClick={() => sayNearby(zoneId === 'football' ? 'goal! ⚽' : zoneId === 'basketball' ? 'swish! 🏀' : zoneId === 'cricket' ? 'sixer! 🏏' : 'match point! 🎾')}
        >
          <span className="upper">📢 Shout cheer</span>
          <span className="c-cyan">SAY ▶</span>
        </button>
      </div>
    </>
  );
}

function Hangout({ spot }: { spot: NonNullable<(typeof HANGOUTS)[ZoneId]> }) {
  return (
    <>
      <p className="muted">{spot.blurb}</p>
      {spot.lines.map(([label, text]) => (
        <button key={label} type="button" className="line campus__order" onClick={() => sayNearby(text)}>
          <span className="upper">{label}</span>
          <span className="c-cyan">SAY ▶</span>
        </button>
      ))}
    </>
  );
}

function GatePanel({ zoneId, label }: { zoneId: ZoneId; label: string }) {
  const directions: Record<string, string> = {
    maingate: 'Primary campus entrance on the north. Follow the road south toward Central Lawn, VIB on the west, and academic blocks to the east.',
    gate3: 'North gate near BH1 and Football Ground. Provides quick access to the central hostel cluster and Mess.',
    gate16: 'Eastern campus gate along the perimeter road beside the Girls Hostel (GH) and Large Ground.',
  };
  return (
    <>
      <p className="muted">{directions[zoneId] ?? 'Campus gate.'}</p>
      <div style={{ marginTop: 10 }}>
        <button type="button" className="line campus__order" onClick={() => sayNearby(`Arrived at ${label}! 👋`)}>
          <span className="upper">📢 Announce arrival</span>
          <span className="c-yellow">SAY ▶</span>
        </button>
      </div>
    </>
  );
}
