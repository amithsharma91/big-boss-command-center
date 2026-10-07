import type { Contestant, HouseStats, Team } from '../types';
import type { ReactNode } from 'react';
import { teamName, teamColor } from '../types';
import { useAuth } from '../auth/AuthContext';
import { Card, Badge, ActionButton, StatTile } from './ui';

function isEvicted(c: Contestant): boolean {
  return c.status === 'EVICTED';
}

function isNominated(c: Contestant): boolean {
  return c.status === 'NOMINATED';
}

function nominateDisabledReason(c: Contestant): string | null {
  if (c.status === 'EVICTED') return 'Evicted';
  if (c.immune) return 'Immune';
  if (c.status === 'NOMINATED') return 'Nominated';
  return null;
}

function rankRing(rank: number): string {
  if (rank === 1) return 'border-[#D4AF37] bg-[#D4AF37]/15';
  if (rank === 2) return 'border-[#A1A1AA]';
  if (rank === 3) return 'border-[#F59E0B]';
  return 'border-[#27272A]';
}

export function Leaderboard(props: { board: Contestant[]; teams: Team[] }) {
  const { board, teams } = props;
  return (
    <Card title="LEADERBOARD" subtitle="Live ranking • active contestants" id="leaderboard">
      {!board || board.length === 0 ? (
        <p className="text-sm text-[#A1A1AA]">No contestants on the leaderboard yet.</p>
      ) : (
        <ol className="flex flex-col gap-2">
          {board.map((c, i) => {
            const rank = i + 1;
            const ring = rankRing(rank);
            const nominated = isNominated(c);
            return (
              <li
                key={c.id}
                className="flex items-center gap-3 rounded-lg border border-[#27272A] bg-[#111113] px-3 py-2"
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-extrabold tabular-nums text-[#FAFAFA] ${ring}`}
                >
                  {rank}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-1.5">
                    <span className="truncate font-semibold text-[#FAFAFA]">{c.name}</span>
                    {c.captain ? <Badge tone="amber">Captain</Badge> : null}
                    {c.immune ? <Badge tone="blue">Immune</Badge> : null}
                    {nominated ? <Badge tone="red">NOMINATED</Badge> : null}
                  </span>
                  <span className="block truncate text-[11px] text-[#A1A1AA]">
                    <span
                      aria-hidden="true"
                      className="mr-1 inline-block h-1.5 w-1.5 rounded-full align-middle"
                      style={{ backgroundColor: teamColor(teams, c.teamId) }}
                    />
                    {teamName(teams, c.teamId)}
                  </span>
                </span>
                <span className="font-extrabold tabular-nums text-[#FAFAFA]">{c.points}</span>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}

type ContestantGridProps = {
  contestants: Contestant[];
  teams: Team[];
  filter?: ReactNode;
  onAdd(id: string, n: number): void;
  onSub(id: string, n: number): void;
  onNominate(id: string): void;
  onRemoveNomination(id: string): void;
  onGrantImmunity(id: string): void;
  onRevokeImmunity(id: string): void;
  onChangeCaptain(id: string): void;
  onEvict(id: string): void;
};

export function ContestantGrid(props: ContestantGridProps) {
  const {
    contestants,
    teams,
    filter,
    onAdd,
    onSub,
    onNominate,
    onRemoveNomination,
    onGrantImmunity,
    onRevokeImmunity,
    onChangeCaptain,
    onEvict,
  } = props;
  const { can } = useAuth();
  const canPoints = can('points.manage');
  const canNominatePerm = can('nominations.manage');
  const canImmunity = can('immunity.manage');
  const canCaptain = can('captain.manage');
  const canEvict = can('eviction.manage');
  const lockNote = (perm: string) => (
    <p className="mt-1 text-[11px] text-[#A1A1AA]">🔒 Requires {perm}</p>
  );

  return (
    <Card
      title="CONTESTANTS"
      subtitle="Points • Captain • Nominate • Immunity • Eviction"
      id="contestants"
      action={filter}
    >
      {contestants.length === 0 ? (
        <p className="text-sm text-[#A1A1AA]">No contestants yet.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {contestants.map((c) => {
            const evicted = isEvicted(c);
            const nominated = isNominated(c);
            void nominateDisabledReason(c);
            return (
              <div
                key={c.id}
                className="rounded-lg border border-[#27272A] bg-[#111113] p-3"
              >
                {evicted ? (
                  <p className="mb-2 rounded-md border border-[#27272A] bg-white/5 px-2 py-1 text-[11px] font-bold tracking-wider text-[#A1A1AA]">
                    EVICTED — ALL ACTIONS LOCKED
                  </p>
                ) : null}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-[#FAFAFA]">{c.name}</div>
                    <div className="truncate text-[11px] font-bold tracking-wider text-[#A1A1AA]">
                      <span
                        aria-hidden="true"
                        className="mr-1 inline-block h-1.5 w-1.5 rounded-full align-middle"
                        style={{ backgroundColor: teamColor(teams, c.teamId) }}
                      />
                      {teamName(teams, c.teamId).toUpperCase()}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-2xl font-extrabold tabular-nums text-[#FAFAFA]">{c.points}</div>
                    <div className="text-[11px] text-[#A1A1AA]">POINTS</div>
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap gap-1">
                  {c.captain ? <Badge tone="amber">Captain</Badge> : null}
                  {c.immune ? <Badge tone="blue">Immune</Badge> : null}
                  {nominated ? <Badge tone="red">Nominated</Badge> : null}
                  {evicted ? <Badge tone="gray">Evicted</Badge> : null}
                </div>

                <div className="mt-3">
                  <div className="mb-1 text-[11px] font-semibold tracking-wide text-[#A1A1AA]">
                    POINTS
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <ActionButton
                      kind="ghost"
                      className="px-2 py-1 text-xs"
                      disabled={evicted || !canPoints}
                      title={canPoints ? undefined : 'Requires points.manage'}
                      onClick={() => onAdd(c.id, 10)}
                    >
                      +10
                    </ActionButton>
                    <ActionButton
                      kind="ghost"
                      className="px-2 py-1 text-xs"
                      disabled={evicted || !canPoints}
                      title={canPoints ? undefined : 'Requires points.manage'}
                      onClick={() => onAdd(c.id, 50)}
                    >
                      +50
                    </ActionButton>
                    <ActionButton
                      kind="ghost"
                      className="px-2 py-1 text-xs"
                      disabled={evicted || !canPoints}
                      title={canPoints ? undefined : 'Requires points.manage'}
                      onClick={() => onSub(c.id, 10)}
                    >
                      -10
                    </ActionButton>
                    <ActionButton
                      kind="ghost"
                      className="px-2 py-1 text-xs"
                      disabled={evicted || !canPoints}
                      title={canPoints ? undefined : 'Requires points.manage'}
                      onClick={() => onSub(c.id, 50)}
                    >
                      -50
                    </ActionButton>
                  </div>
                  {!canPoints ? lockNote('points.manage') : null}
                </div>

                <div className="mt-2">
                  <div className="mb-1 text-[11px] font-semibold tracking-wide text-[#A1A1AA]">
                    NOMINATE
                  </div>
                  {evicted ? null : !canNominatePerm ? (
                    <div>
                      <ActionButton kind="ghost" className="px-2 py-1 text-xs" disabled title="Requires nominations.manage">
                        NOMINATE 🔒
                      </ActionButton>
                      {lockNote('nominations.manage')}
                    </div>
                  ) : nominated ? (
                    <div>
                      <ActionButton
                        kind="ghost"
                        className="px-2 py-1 text-xs"
                        disabled={evicted || !canNominatePerm}
                        title={canNominatePerm ? undefined : 'Requires nominations.manage'}
                        onClick={() => onRemoveNomination(c.id)}
                      >
                        REMOVE NOMINATION
                      </ActionButton>
                      {!canNominatePerm ? lockNote('nominations.manage') : null}
                    </div>
                  ) : c.immune ? (
                    <div>
                      <ActionButton
                        kind="ghost"
                        className="px-2 py-1 text-xs"
                        disabled
                        title="Immune contestants cannot be nominated"
                      >
                        NOMINATE — BLOCKED
                      </ActionButton>
                      <p className="mt-1 text-[11px] text-[#A1A1AA]">Immune — revoke immunity to nominate</p>
                    </div>
                  ) : (
                    <ActionButton
                      kind="primary"
                      className="px-2 py-1 text-xs"
                      disabled={evicted || !canNominatePerm}
                      title={canNominatePerm ? undefined : 'Requires nominations.manage'}
                      onClick={() => onNominate(c.id)}
                    >
                      NOMINATE
                    </ActionButton>
                  )}
                </div>

                <div className="mt-2">
                  <div className="mb-1 text-[11px] font-semibold tracking-wide text-[#A1A1AA]">
                    IMMUNITY
                  </div>
                  {c.immune ? (
                    <ActionButton
                      kind="ghost"
                      className="px-2 py-1 text-xs"
                      disabled={evicted || !canImmunity}
                      title={canImmunity ? undefined : 'Requires immunity.manage'}
                      onClick={() => onRevokeImmunity(c.id)}
                    >
                      REVOKE IMMUNITY
                    </ActionButton>
                  ) : (
                    <ActionButton
                      kind="green"
                      className="px-2 py-1 text-xs"
                      disabled={evicted || !canImmunity}
                      title={canImmunity ? undefined : 'Requires immunity.manage'}
                      onClick={() => onGrantImmunity(c.id)}
                    >
                      GRANT IMMUNITY
                    </ActionButton>
                  )}
                  {!canImmunity ? lockNote('immunity.manage') : null}
                </div>

                <div className="mt-2">
                  <div className="mb-1 text-[11px] font-semibold tracking-wide text-[#A1A1AA]">
                    CAPTAIN
                  </div>
                  {c.captain ? (
                    <Badge tone="amber">Current Captain</Badge>
                  ) : (
                    <ActionButton
                      kind="gold"
                      className="px-2 py-1 text-xs"
                      disabled={evicted || !canCaptain}
                      title={canCaptain ? undefined : 'Requires captain.manage'}
                      onClick={() => onChangeCaptain(c.id)}
                    >
                      MAKE CAPTAIN
                    </ActionButton>
                  )}
                  {!c.captain && !canCaptain ? lockNote('captain.manage') : null}
                </div>

                <div className="mt-2">
                  <div className="mb-1 text-[11px] font-semibold tracking-wide text-[#A1A1AA]">
                    EVICT <span className="font-normal text-[#A1A1AA]">(requires confirmation)</span>
                  </div>
                  <ActionButton
                    kind="danger"
                    className="px-2 py-1 text-xs"
                    disabled={evicted || !canEvict}
                    title={canEvict ? undefined : 'Requires eviction.manage'}
                    onClick={() => {
                      if (!window.confirm('Evict ' + c.name + '? This removes them from the leaderboard.')) return;
                      onEvict(c.id);
                    }}
                  >
                    EVICT
                  </ActionButton>
                  {!canEvict ? lockNote('eviction.manage') : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

export function HouseStats(props: { stats: HouseStats; captainName: string }) {
  const { stats, captainName } = props;
  const top = stats.highestScorer;
  const topName = top ? top.name : '—';
  const topPoints = top ? top.points : null;

  return (
    <section id="house-stats">
      <h2 className="mb-2 text-xs font-bold tracking-widest text-[#A1A1AA]">TOP STATISTICS</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-2">
        <StatTile label="ACTIVE CONTESTANTS" value={stats.active} accent="green" />
        <StatTile label="CAPTAIN" value={captainName} accent="amber" />
        <StatTile
          label="HIGHEST SCORER"
          value={topName}
          accent="amber"
          sub={topPoints !== null ? `${topPoints} pts` : '—'}
        />
        <StatTile label="COMPLETED TASKS" value={`${stats.completedTasks}/${stats.totalTasks}`} accent="blue" />
        <StatTile label="NOMINEES" value={stats.nominated} accent="red" />
        <StatTile label="IMMUNE" value={stats.immune} accent="blue" />
        <StatTile label="EVICTED" value={stats.evicted} accent="gray" />
        <StatTile label="TOTAL POINTS" value={stats.totalPoints} accent="amber" />
      </div>
    </section>
  );
}
