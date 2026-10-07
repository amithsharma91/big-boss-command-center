import { useState } from 'react';
import type { Announcement, Contestant, EventLog } from '../types';
import { ActionButton, Badge, Card } from './ui';

type CommandAction = 'add' | 'sub' | 'nominate' | 'immunity' | 'captain' | 'evict';

export function CommandPanel(props: {
  contestants: Contestant[];
  onAdd(id: string, n: number): void;
  onSub(id: string, n: number): void;
  onNominate(id: string): void;
  onGrantImmunity(id: string): void;
  onChangeCaptain(id: string): void;
  onEvict(id: string): void;
}) {
  const { contestants, onAdd, onSub, onNominate, onGrantImmunity, onChangeCaptain, onEvict } = props;
  const active = contestants.filter((c) => c.status !== 'EVICTED');
  const [selectedId, setSelectedId] = useState('');
  const [action, setAction] = useState<CommandAction>('add');
  const [value, setValue] = useState(50);
  const [message, setMessage] = useState('Select contestant + action, then EXECUTE');

  const showValue = action === 'add' || action === 'sub';

  function handleExecute(): void {
    if (!selectedId) {
      setMessage('Select a contestant');
      return;
    }
    const target = contestants.find((c) => c.id === selectedId);
    if (!target) {
      setMessage('Select a contestant');
      return;
    }
    if (target.status === 'EVICTED') {
      setMessage(`${target.name} is evicted — action blocked`);
      return;
    }
    switch (action) {
      case 'add': {
        const n = Math.floor(Number(value));
        if (!Number.isFinite(n) || n <= 0) {
          setMessage('Enter a valid point value');
          return;
        }
        onAdd(target.id, n);
        setMessage(`Executed: +${n} → ${target.name}`);
        return;
      }
      case 'sub': {
        const n = Math.floor(Number(value));
        if (!Number.isFinite(n) || n <= 0) {
          setMessage('Enter a valid point value');
          return;
        }
        onSub(target.id, n);
        setMessage(`Executed: -${n} → ${target.name}`);
        return;
      }
      case 'nominate': {
        if (target.immune) {
          setMessage(`${target.name} is immune — nomination blocked`);
          return;
        }
        if (target.status === 'NOMINATED') {
          setMessage(`${target.name} is already nominated`);
          return;
        }
        onNominate(target.id);
        setMessage(`Executed: ${target.name} nominated`);
        return;
      }
      case 'immunity': {
        if (target.immune) {
          setMessage(`${target.name} already has immunity`);
          return;
        }
        onGrantImmunity(target.id);
        setMessage(`Executed: ${target.name} granted immunity`);
        return;
      }
      case 'captain': {
        if (target.captain) {
          setMessage(`${target.name} is already Captain`);
          return;
        }
        onChangeCaptain(target.id);
        setMessage(`Executed: ${target.name} is now Captain`);
        return;
      }
      case 'evict': {
        if (!window.confirm(`Evict ${target.name} from the house?`)) {
          setMessage(`Eviction cancelled for ${target.name}`);
          return;
        }
        onEvict(target.id);
        setMessage(`Executed: ${target.name} evicted`);
        return;
      }
    }
  }

  return (
    <Card title="BIG BOSS COMMAND" subtitle="Points • Nominate • Immunity • Captain • Evict" id="command">
      <div className="space-y-2">
        <label className="block">
          <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[#71717A]">
            Contestant
          </span>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            aria-label="Contestant"
            className="w-full rounded-lg border border-[#E4E4E7] bg-white px-2 py-1.5 text-xs text-[#18181B]"
          >
            <option value="">Select contestant…</option>
            {active.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} • {c.team} • {c.points} pts
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[#71717A]">
            Action
          </span>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value as CommandAction)}
            aria-label="Action"
            className="w-full rounded-lg border border-[#E4E4E7] bg-white px-2 py-1.5 text-xs text-[#18181B]"
          >
            <option value="add">+ Points</option>
            <option value="sub">− Points</option>
            <option value="nominate">Nominate</option>
            <option value="immunity">Grant immunity</option>
            <option value="captain">Make Captain</option>
            <option value="evict">Evict</option>
          </select>
        </label>
        {showValue ? (
          <label className="block">
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[#71717A]">
              Value
            </span>
            <input
              type="number"
              min={1}
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              aria-label="Value"
              className="w-full rounded-lg border border-[#E4E4E7] bg-white px-2 py-1.5 text-xs text-[#18181B]"
            />
          </label>
        ) : null}
        <ActionButton kind="primary" onClick={handleExecute} className="w-full py-2.5 text-sm font-bold tracking-widest">
          EXECUTE
        </ActionButton>
        <p aria-live="polite" className="min-h-4 text-xs text-[#71717A]">
          {message}
        </p>
      </div>
    </Card>
  );
}

export function DangerZone(props: {
  nominees: Contestant[];
  onEvict(id: string): void;
  onRemoveNomination(id: string): void;
}) {
  const { nominees, onEvict, onRemoveNomination } = props;

  function handleEvict(c: Contestant): void {
    if (window.confirm(`Evict ${c.name} from the house?`)) {
      onEvict(c.id);
    }
  }

  return (
    <Card
      title={`DANGER ZONE (${nominees.length})`}
      subtitle="Active nominees face eviction"
      id="danger-zone"
      className="border-[#FECACA]"
    >
      {nominees.length === 0 ? (
        <p className="text-xs text-[#71717A]">No nominees. The house is safe… for now.</p>
      ) : (
        <div className="space-y-2">
          {nominees.map((c) => (
            <div
              key={c.id}
              className="flex flex-wrap items-center gap-2 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-2 py-1.5"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-bold text-[#18181B]">{c.name}</div>
                <div className="text-[11px] text-[#71717A]">
                  {c.team} • {c.points} pts
                </div>
              </div>
              <Badge tone="red">Nominated</Badge>
              <div className="flex flex-wrap items-center gap-1.5">
                <ActionButton kind="ghost" onClick={() => onRemoveNomination(c.id)} title={`Remove nomination for ${c.name}`}>
                  REMOVE NOMINATION
                </ActionButton>
                <ActionButton kind="danger" onClick={() => handleEvict(c)} title={`Evict ${c.name}`}>
                  EVICT
                </ActionButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export function AnnouncementBar(props: {
  announcements: Announcement[];
  onAnnounce(text: string): void;
}) {
  const { announcements, onAnnounce } = props;
  const [text, setText] = useState('');
  const latest = announcements.length > 0 ? announcements[0] : null;
  const recent = announcements.slice(0, 3);

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault();
    if (!text.trim()) return;
    onAnnounce(text);
    setText('');
  }

  return (
    <Card title="BIG BOSS ANNOUNCEMENT" subtitle="Broadcast to the house" id="announcement">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <label htmlFor="announcement-input" className="text-[10px] font-bold uppercase tracking-widest text-[#71717A]">
          Message to house
        </label>
        <div className="flex gap-2">
          <input
            id="announcement-input"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Speak, Big Boss…"
            aria-label="Announcement text"
            className="min-w-0 flex-1 rounded-lg border border-[#E4E4E7] bg-white px-2 py-1.5 text-xs text-[#18181B] placeholder:text-[#A1A1AA]"
          />
          <ActionButton kind="primary" type="submit">
            ANNOUNCE
          </ActionButton>
        </div>
      </form>
      <div className="mt-3">
        <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#71717A]">
          Latest ({announcements.length})
        </div>
        {latest ? (
          <p className="border-l-4 border-[#D92D20] bg-[#FCFCFB] px-3 py-2 text-sm font-semibold text-[#18181B]">
            {latest.text}
          </p>
        ) : (
          <p className="text-xs text-[#71717A]">No announcements yet.</p>
        )}
      </div>
      {recent.length > 0 ? (
        <div className="mt-2">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#71717A]">
            House history
          </div>
          <ul className="space-y-1.5">
          {recent.map((a) => (
            <li key={a.id} className="rounded-lg border border-[#E4E4E7] bg-[#FCFCFB] px-2 py-1.5">
              <p className="text-xs text-[#3F3F46]">{a.text}</p>
              <p className="mt-0.5 text-[10px] text-[#A1A1AA]">{a.createdAt}</p>
            </li>
          ))}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}

const eventDot: Record<EventLog['type'], string> = {
  points: 'bg-[#D92D20]',
  captain: 'bg-[#B08D22]',
  nominate: 'bg-[#B45309]',
  immunity: 'bg-[#52525B]',
  evict: 'bg-[#DC2626]',
  task: 'bg-[#15803D]',
  announce: 'bg-[#D92D20]',
  system: 'bg-[#A1A1AA]',
};

export function EventFeed(props: { events: EventLog[] }) {
  const { events } = props;
  return (
    <Card title="EVENT FEED" subtitle="Live house activity" id="events">
      {events.length === 0 ? (
        <p className="text-xs text-[#71717A]">No activity yet.</p>
      ) : (
        <div className="slim-scroll max-h-72 space-y-1.5 overflow-y-auto pr-1">
          {events.map((e) => (
            <div
              key={e.id}
              className="feed-item flex items-start gap-2 rounded border border-[#E4E4E7] bg-[#FCFCFB] px-2 py-1"
            >
              <span aria-hidden="true" className={`rounded-full h-2 w-2 mt-1.5 shrink-0 ${eventDot[e.type] ?? 'bg-[#A1A1AA]'}`} />
              <div className="min-w-0 flex-1">
                <div className="mono font-mono text-[10px] text-[#A1A1AA]">{e.timestamp}</div>
                <div className="text-xs text-[#3F3F46]">{e.message}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
