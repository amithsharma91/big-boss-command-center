import type { ReactNode } from 'react';

type BadgeTone = 'red' | 'amber' | 'green' | 'gray' | 'blue' | 'purple';

type StatAccent = 'red' | 'amber' | 'green' | 'blue' | 'gray';

type ButtonKind = 'primary' | 'danger' | 'ghost' | 'gold' | 'green';

const badgeTones: Record<BadgeTone, string> = {
  red: 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]',
  amber: 'bg-[#F7F0D0] text-[#B08D22] border-[#EADFAE]',
  green: 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]',
  gray: 'bg-[#F4F4F5] text-[#71717A] border-[#E4E4E7]',
  blue: 'bg-[#F4F4F5] text-[#52525B] border-[#E4E4E7]',
  purple: 'bg-[#F4F4F5] text-[#71717A] border-[#E4E4E7]',
};

const statAccents: Record<StatAccent, string> = {
  red: 'text-[#DC2626]',
  amber: 'text-[#B08D22]',
  green: 'text-[#15803D]',
  blue: 'text-[#52525B]',
  gray: 'text-[#18181B]',
};

const buttonKinds: Record<ButtonKind, string> = {
  primary: 'bg-[#D92D20] hover:bg-[#B42318] text-white border border-transparent',
  danger: 'bg-white border border-[#FECACA] text-[#DC2626] hover:bg-[#FEF2F2]',
  ghost: 'bg-white border border-[#E4E4E7] text-[#52525B] hover:bg-[#F7F7F5]',
  gold: 'bg-[#B08D22] hover:bg-[#97791D] text-white border border-transparent',
  green: 'bg-[#15803D] hover:bg-[#166534] text-white border border-transparent',
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
    <section id={id} className={`rounded-xl border border-[#E4E4E7] bg-white p-4 shadow-sm ${className}`}>
      {showHeader ? (
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title !== undefined ? (
              <h2 className="uppercase tracking-widest text-sm font-bold text-[#71717A]">{title}</h2>
            ) : null}
            {subtitle !== undefined ? (
              <p className="mt-0.5 text-xs text-[#71717A]">{subtitle}</p>
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
    <div className="bg-white border border-[#E4E4E7] rounded-lg p-3 min-w-0">
      <div className="uppercase text-[10px] tracking-widest text-[#71717A]">{label}</div>
      <div className={`mt-1 font-extrabold text-xl truncate ${statAccents[accent]}`}>{value}</div>
      {sub !== undefined ? <div className="mt-1 text-[11px] text-[#71717A]">{sub}</div> : null}
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
      className={`min-h-[32px] text-xs font-semibold px-2.5 py-1.5 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D92D20] focus-visible:ring-offset-2 ${buttonKinds[kind]} ${className}`}
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
    <header className="sticky top-0 z-20 backdrop-blur bg-white/90 border-b border-[#E4E4E7]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="rounded-full bg-[#D92D20] w-9 h-9 grid place-items-center font-black text-sm text-white">
            BB
          </div>
          <div className="min-w-0">
            <h1 className="font-black tracking-widest text-lg text-[#18181B] leading-tight truncate">
              BIG BOSS COMMAND CENTER
            </h1>
            <p className="text-[11px] text-[#71717A] tracking-widest">
              ROUND 01 • BUILD &amp; SYSTEMS CHALLENGE
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-x-4 gap-y-2">
          <nav aria-label="Sections" className="hidden items-center gap-3 text-[11px] font-semibold tracking-wider text-[#71717A] lg:flex">
            <a className="transition hover:text-[#18181B]" href="#leaderboard">LEADERBOARD</a>
            <a className="transition hover:text-[#18181B]" href="#contestants">CONTESTANTS</a>
            <a className="transition hover:text-[#18181B]" href="#tasks">TASKS</a>
            <a className="transition hover:text-[#18181B]" href="#task-timer">TIMER</a>
            <a className="transition hover:text-[#18181B]" href="#danger-zone">DANGER ZONE</a>
            <a className="transition hover:text-[#18181B]" href="#announcement">ANNOUNCE</a>
          </nav>
          <span className="flex items-center gap-2">
            <span className="live-dot inline-block h-2 w-2 rounded-full bg-[#D92D20]" />
            <span className="text-[#D92D20] font-bold text-xs tracking-widest">LIVE</span>
          </span>
          <span className="text-xs text-[#71717A]">
            <span className="font-bold text-[#18181B]">{activeCount}</span> active
          </span>
          <ActionButton kind="ghost" onClick={handleReset} title="Reset all house state">
            RESET HOUSE
          </ActionButton>
        </div>
      </div>
    </header>
  );
}
