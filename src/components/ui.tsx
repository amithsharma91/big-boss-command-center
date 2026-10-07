import type { ReactNode } from 'react';

type BadgeTone = 'red' | 'amber' | 'green' | 'gray' | 'blue' | 'purple';

type StatAccent = 'red' | 'amber' | 'green' | 'blue' | 'gray';

type ButtonKind = 'primary' | 'danger' | 'ghost' | 'gold' | 'green';

const badgeTones: Record<BadgeTone, string> = {
  red: 'bg-[#E11D48]/15 text-[#FDA4AF] border-[#E11D48]/40',
  amber: 'bg-[#D4AF37]/15 text-[#F5E6C8] border-[#D4AF37]/40',
  green: 'bg-[#22C55E]/15 text-[#86EFAC] border-[#22C55E]/40',
  gray: 'bg-white/5 text-[#A1A1AA] border-[#27272A]',
  blue: 'bg-[#3B82F6]/15 text-[#93C5FD] border-[#3B82F6]/40',
  purple: 'bg-[#8B5CF6]/15 text-[#C4B5FD] border-[#8B5CF6]/40',
};

const statAccents: Record<StatAccent, string> = {
  red: 'text-[#FB7185]',
  amber: 'text-[#D4AF37]',
  green: 'text-[#4ADE80]',
  blue: 'text-[#93C5FD]',
  gray: 'text-[#FAFAFA]',
};

const buttonKinds: Record<ButtonKind, string> = {
  primary: 'bg-[#E11D48] hover:bg-[#FB3158] text-white border border-transparent',
  danger: 'bg-[#E11D48]/10 border border-[#E11D48]/40 text-[#FDA4AF] hover:bg-[#E11D48]/20',
  ghost: 'bg-white/5 border border-[#27272A] text-[#FAFAFA] hover:bg-white/10',
  gold: 'bg-[#D4AF37] hover:bg-[#F5E6C8] text-black border border-transparent font-bold',
  green: 'bg-[#22C55E] hover:bg-[#4ADE80] text-white border border-transparent',
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
    <section id={id} className={`rounded-xl border border-[#27272A] bg-[#111113] p-4 ${className}`}>
      {showHeader ? (
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title !== undefined ? (
              <h2 className="uppercase tracking-widest text-sm font-bold text-[#FAFAFA]">{title}</h2>
            ) : null}
            {subtitle !== undefined ? (
              <p className="mt-0.5 text-xs text-[#A1A1AA]">{subtitle}</p>
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
    <div className="bg-[#111113] border border-[#27272A] rounded-lg p-3 min-w-0">
      <div className="uppercase text-[10px] tracking-widest text-[#A1A1AA]">{label}</div>
      <div className={`mt-1 font-extrabold text-xl truncate ${statAccents[accent]}`}>{value}</div>
      {sub !== undefined ? <div className="mt-1 text-[11px] text-[#A1A1AA]">{sub}</div> : null}
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
      className={`min-h-[32px] text-xs font-semibold px-2.5 py-1.5 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B] ${buttonKinds[kind]} ${className}`}
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
    <header className="sticky top-0 z-20 backdrop-blur bg-[#09090B]/90 border-b border-[#27272A]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="rounded-full bg-[#E11D48] border border-white/10 w-9 h-9 grid place-items-center font-black text-sm text-white">
            BB
          </div>
          <div className="min-w-0">
            <h1 className="font-black tracking-widest text-lg text-[#FAFAFA] leading-tight truncate">
              BIG BOSS COMMAND CENTER
            </h1>
            <p className="text-[11px] text-[#A1A1AA] tracking-widest">
              ROUND 01 • HOUSE OPERATIONS
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-x-4 gap-y-2">
          <nav aria-label="Sections" className="hidden items-center gap-3 text-[11px] font-semibold tracking-wider text-[#A1A1AA] lg:flex">
            <a className="transition hover:text-[#FAFAFA]" href="#leaderboard">LEADERBOARD</a>
            <a className="transition hover:text-[#FAFAFA]" href="#command">COMMAND</a>
            <a className="transition hover:text-[#FAFAFA]" href="#contestants">CONTESTANTS</a>
            <a className="transition hover:text-[#FAFAFA]" href="#teams">TEAMS</a>
            <a className="transition hover:text-[#FAFAFA]" href="#tasks">TASKS</a>
            <a className="transition hover:text-[#FAFAFA]" href="#task-timer">TIMER</a>
            <a className="transition hover:text-[#FAFAFA]" href="#danger-zone">DANGER ZONE</a>
            <a className="transition hover:text-[#FAFAFA]" href="#announcement">ANNOUNCE</a>
            <a className="transition hover:text-[#FAFAFA]" href="#events">ACTIVITY</a>
          </nav>
          <span className="flex items-center gap-2">
            <span className="live-dot inline-block h-2 w-2 rounded-full bg-[#E11D48]" />
            <span className="text-[#FB7185] font-bold text-xs tracking-widest">LIVE</span>
          </span>
          <span className="text-xs text-[#A1A1AA]">
            <span className="font-bold text-[#FAFAFA]">{activeCount}</span> active
          </span>
          <ActionButton kind="ghost" onClick={handleReset} title="Reset all house state">
            RESET HOUSE
          </ActionButton>
        </div>
      </div>
    </header>
  );
}
