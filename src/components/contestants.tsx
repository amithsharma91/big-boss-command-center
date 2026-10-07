import type { Contestant, HouseStats } from '../types';
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
  if (rank === 1) return 'border-amber-400 bg-amber-400/10';
  if (rank === 2) return 'border-zinc-300';
  if (rank === 3) return 'border-orange-500';
  return 'border-zinc-800';
}

export function Leaderboard(props: { board: Contestant[] }) {
  const { board } = props;
  return (
    <Card title="LEADERBOARD" subtitle="Live ranking • active contestants" id="leaderboard">
      {!board || board.length === 0 ? (
        <p className="text-sm text-zinc-500">No contestants on the leaderboard yet.</p>
      ) : (
        <ol className="flex flex-col gap-2">
          {board.map((c, i) => {
            const rank = i + 1;
            const ring = rankRing(rank);
            const nominated = isNominated(c);
            return (
              <li
                key={c.id}
                className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2"
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-extrabold tabular-nums ${ring}`}
                >
                  {rank}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-1.5">
                    <span className="font-semibold">{c.name}</span>
                    {c.captain ? <span title="Captain">👑</span> : null}
                    {c.immune ? <span title="Immune">🛡</span> : null}
                    {nominated ? <Badge tone="red">NOMINATED</Badge> : null}
                  </span>
                  <span className="block truncate text-[11px] text-zinc-500">{c.team}</span>
                </span>
                <span className="font-extrabold tabular-nums">{c.points}</span>
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
    onAdd,
    onSub,
    onNominate,
    onRemoveNomination,
    onGrantImmunity,
    onRevokeImmunity,
    onChangeCaptain,
    onEvict,
  } = props;

  return (
    <Card
      title="CONTESTANTS"
      subtitle="Points • Captain • Nominate • Immunity • Eviction"
      id="contestants"
    >
      {contestants.length === 0 ? (
        <p className="text-sm text-zinc-500">No contestants yet.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {contestants.map((c) => {
            const evicted = isEvicted(c);
            const nominated = isNominated(c);
            void nominateDisabledReason(c);
            return (
              <div
                key={c.id}
                className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{c.name}</div>
                    <div className="truncate text-[11px] text-zinc-500">{c.team}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-2xl font-extrabold tabular-nums">{c.points}</div>
                    <div className="text-[11px] text-zinc-500">POINTS</div>
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap gap-1">
                  {c.captain ? <Badge tone="amber">👑 CAPTAIN</Badge> : null}
                  {c.immune ? <Badge tone="blue">🛡 IMMUNE</Badge> : null}
                  {nominated ? <Badge tone="red">⚠ NOMINATED</Badge> : null}
                  {evicted ? <Badge tone="gray">EVICTED</Badge> : null}
                </div>

                <div className="mt-3">
                  <div className="mb-1 text-[11px] font-semibold tracking-wide text-zinc-500">
                    POINTS
                  </div>
                  {evicted ? (
                    <p className="mb-1 text-[11px] text-zinc-500">Evicted — actions locked</p>
                  ) : null}
                  <div className="flex flex-wrap gap-1">
                    <ActionButton
                      kind="ghost"
                      className="px-2 py-1 text-xs"
                      disabled={evicted}
                      onClick={() => onAdd(c.id, 10)}
                    >
                      +10
                    </ActionButton>
                    <ActionButton
                      kind="ghost"
                      className="px-2 py-1 text-xs"
                      disabled={evicted}
                      onClick={() => onAdd(c.id, 50)}
                    >
                      +50
                    </ActionButton>
                    <ActionButton
                      kind="ghost"
                      className="px-2 py-1 text-xs"
                      disabled={evicted}
                      onClick={() => onSub(c.id, 10)}
                    >
                      -10
                    </ActionButton>
                    <ActionButton
                      kind="ghost"
                      className="px-2 py-1 text-xs"
                      disabled={evicted}
                      onClick={() => onSub(c.id, 50)}
                    >
                      -50
                    </ActionButton>
                  </div>
                </div>

                <div className="mt-2">
                  <div className="mb-1 text-[11px] font-semibold tracking-wide text-zinc-500">
                    NOMINATE
                  </div>
                  {evicted ? null : nominated ? (
                    <ActionButton
                      kind="gold"
                      className="px-2 py-1 text-xs"
                      disabled={evicted}
                      onClick={() => onRemoveNomination(c.id)}
                    >
                      REMOVE NOMINATION
                    </ActionButton>
                  ) : c.immune ? (
                    <ActionButton
                      kind="ghost"
                      className="px-2 py-1 text-xs"
                      disabled
                      title="Immune contestants cannot be nominated"
                    >
                      NOMINATE 🔒
                    </ActionButton>
                  ) : (
                    <ActionButton
                      kind="primary"
                      className="px-2 py-1 text-xs"
                      disabled={evicted}
                      onClick={() => onNominate(c.id)}
                    >
                      ⚠ NOMINATE
                    </ActionButton>
                  )}
                </div>

                <div className="mt-2">
                  <div className="mb-1 text-[11px] font-semibold tracking-wide text-zinc-500">
                    IMMUNITY
                  </div>
                  {c.immune ? (
                    <ActionButton
                      kind="ghost"
                      className="px-2 py-1 text-xs"
                      disabled={evicted}
                      onClick={() => onRevokeImmunity(c.id)}
                    >
                      REVOKE IMMUNITY
                    </ActionButton>
                  ) : (
                    <ActionButton
                      kind="green"
                      className="px-2 py-1 text-xs"
                      disabled={evicted}
                      onClick={() => onGrantImmunity(c.id)}
                    >
                      GRANT 🛡
                    </ActionButton>
                  )}
                </div>

                <div className="mt-2">
                  <div className="mb-1 text-[11px] font-semibold tracking-wide text-zinc-500">
                    CAPTAIN
                  </div>
                  {c.captain ? (
                    <Badge tone="amber">👑 CURRENT CAPTAIN</Badge>
                  ) : (
                    <ActionButton
                      kind="gold"
                      className="px-2 py-1 text-xs"
                      disabled={evicted}
                      onClick={() => onChangeCaptain(c.id)}
                    >
                      MAKE CAPTAIN
                    </ActionButton>
                  )}
                </div>

                <div className="mt-2">
                  <div className="mb-1 text-[11px] font-semibold tracking-wide text-zinc-500">
                    EVICT
                  </div>
                  <ActionButton
                    kind="danger"
                    className="px-2 py-1 text-xs"
                    disabled={evicted}
                    onClick={() => {
                      if (!window.confirm('Evict ' + c.name + '? This removes them from the leaderboard.')) return;
                      onEvict(c.id);
                    }}
                  >
                    EVICT
                  </ActionButton>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

export function HouseStats(props: { stats: HouseStats }) {
  const { stats } = props;
  const top = stats.highestScorer;
  const topName = top ? top.name : '—';
  const topPoints = top ? top.points : null;

  return (
    <section id="house-stats">
      <h2 className="mb-2 text-xs font-bold tracking-widest text-zinc-500">TOP STATISTICS</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2">
        <StatTile label="ACTIVE CONTESTANTS" value={stats.active} accent="green" />
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
