import type { Announcement } from '../types';

/**
 * Permanent Big Boss broadcast strip, rendered directly below the header.
 * Visual only — never speaks, plays audio, or triggers speech synthesis.
 */
export function BroadcastBar(props: { announcement: Announcement | null; count: number }) {
  const { announcement, count } = props;
  if (!announcement) return null;
  return (
    <section
      aria-label="Big Boss announcement"
      aria-live="polite"
      className="broadcast-appear rounded-xl border border-[#27272A] bg-[#111113]"
    >
      <div className="border-l-4 border-[#E11D48] px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#E11D48]">
            Big Boss Announcement
          </h2>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA]">
            Big Boss
          </span>
        </div>
        <p className="mt-1 text-sm font-semibold leading-snug text-[#FAFAFA] md:text-base">
          &ldquo;{announcement.text}&rdquo;
        </p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[#A1A1AA]">
          {announcement.createdAt}
          {count > 1 ? ` • ${count} broadcasts` : ''}
        </p>
      </div>
    </section>
  );
}
