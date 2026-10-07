import type { ReactNode } from 'react';

type BadgeTone = 'red' | 'amber' | 'green' | 'gray' | 'blue' | 'purple';

type StatAccent = 'red' | 'amber' | 'green' | 'blue' | 'gray';

type ButtonKind = 'primary' | 'danger' | 'ghost' | 'gold' | 'green';

const badgeTones: Record<BadgeTone, string> = {
  red: 'bg-red-600/20 text-red-400 border-red-600/40',
  amber: 'bg-amber-400/15 text-amber-300 border-amber-400/40',
  green: 'bg-green-500/15 text-green-400 border-green-500/40',
  gray: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/40',
  blue: 'bg-blue-500/15 text-blue-300 border-blue-500/40',
  purple: 'bg-purple-500/15 text-purple-300 border-purple-500/40',
};

const statAccents: Record<StatAccent, string> = {
  red: 'text-red-400',
  amber: 'text-amber-300',
  green: 'text-green-400',
  blue: 'text-blue-300',
  gray: 'text-zinc-100',
};

const buttonKinds: Record<ButtonKind, string> = {
  primary: 'bg-red-600 hover:bg-red-500 text-white border border-transparent',
  danger: 'bg-red-950 border border-red-700 text-red-300 hover:bg-red-900',
  ghost: 'bg-white/5 border border-white/10 text-zinc-200 hover:bg-white/10',
  gold: 'bg-amber-400 text-black hover:bg-amber-300 border border-transparent font-bold',
  green: 'bg-green-600 hover:bg-green-500 text-white border border-transparent',
};

export function Card(props: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const { title, subtitle, action, children, className = '', id } = props;
  const showHeader = title !== undefined || subtitle !== undefined || action !== undefined;
  return (
    <section id={id} className={`rounded-xl border border-white/10 bg-[#101018] p-4 ${className}`}>
      {showHeader ? (
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title !== undefined ? (
              <h2 className="uppercase tracking-widest text-sm font-bold text-zinc-100">{title}</h2>
            ) : null}
            {subtitle !== undefined ? (
              <p className="mt-0.5 text-xs text-zinc-400">{subtitle}</p>
            ) : null}
          </div>
          {action !== undefined ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function Badge(props: { tone: BadgeTone; children: ReactNode; className?: string }) {
  const { tone, children, className = '' } = props;
  return (
    <span
      className={`inline-flex items-center gap-1 border px-2 py-0.5 rounded-full uppercase text-[10px] font-bold tracking-wider ${badgeTones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function StatTile(props: {
  label: string;
  value: string | number;
  accent?: StatAccent;
  sub?: string;
}) {
  const { label, value, accent = 'gray', sub } = props;
  return (
    <div className="bg-[#14141c] border border-white/10 rounded-lg p-3">
      <div className="uppercase text-[10px] tracking-widest text-zinc-400">{label}</div>
      <div className={`mt-1 font-extrabold text-xl ${statAccents[accent]}`}>{value}</div>
      {sub !== undefined ? <div className="mt-1 text-[11px] text-zinc-500">{sub}</div> : null}
    </div>
  );
}

export function ActionButton(props: {
  children: ReactNode;
  onClick?: () => void;
  kind?: ButtonKind;
  disabled?: boolean;
  title?: string;
  className?: string;
  type?: 'button' | 'submit';
}) {
  const {
    children,
    onClick,
    kind = 'primary',
    disabled = false,
    title,
    className = '',
    type = 'button',
  } = props;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`min-h-[32px] text-xs font-semibold px-2.5 py-1.5 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed ${buttonKinds[kind]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Header(props: { onReset: () => void; activeCount: number }) {
  const { onReset, activeCount } = props;

  function handleReset() {
    if (window.confirm('Reset the house? This will clear all game state.')) {
      onReset();
    }
  }

  return (
    <header className="sticky top-0 z-20 backdrop-blur bg-[#07070c]/90 border-b border-white/10">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="rounded-full bg-red-600 border border-white/10 w-9 h-9 grid place-items-center font-black text-sm text-white">
            BB
          </div>
          <div className="min-w-0">
            <h1 className="font-black tracking-widest text-lg text-white leading-tight truncate">
              BIG BOSS COMMAND CENTER
            </h1>
            <p className="text-[11px] text-zinc-500 tracking-widest">
              ROUND 01 • BUILD &amp; SYSTEMS CHALLENGE
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-x-4 gap-y-2">
          <nav aria-label="Sections" className="hidden items-center gap-3 text-[11px] font-semibold tracking-wider text-zinc-400 lg:flex">
            <a className="transition hover:text-zinc-100" href="#leaderboard">LEADERBOARD</a>
            <a className="transition hover:text-zinc-100" href="#contestants">CONTESTANTS</a>
            <a className="transition hover:text-zinc-100" href="#tasks">TASKS</a>
            <a className="transition hover:text-zinc-100" href="#task-timer">TIMER</a>
            <a className="transition hover:text-zinc-100" href="#danger-zone">DANGER ZONE</a>
            <a className="transition hover:text-zinc-100" href="#announcement">ANNOUNCE</a>
          </nav>
          <span className="flex items-center gap-2">
            <span className="live-dot inline-block h-2 w-2 rounded-full bg-red-500" />
            <span className="text-red-400 font-bold text-xs tracking-widest">LIVE</span>
          </span>
          <span className="text-xs text-zinc-400">
            <span className="font-bold text-zinc-100">{activeCount}</span> active
          </span>
          <ActionButton kind="ghost" onClick={handleReset} title="Reset all house state">
            RESET HOUSE
          </ActionButton>
        </div>
      </div>
    </header>
  );
}
