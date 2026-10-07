import { useState } from 'react';
import type { Contestant, Task, Team } from '../types';
import { COLOR_CHOICES, calcStandings, teamName } from '../types';
import { ActionButton, Badge, Card } from './ui';

const inputCls =
  'w-full rounded-lg border border-[#27272A] bg-[#18181B] px-2 py-1.5 text-sm text-[#FAFAFA] placeholder:text-[#52525B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48]';
const rowCls =
  'rounded-lg border border-[#27272A] bg-white/[0.02] px-2 py-1.5';
const labelCls =
  'block text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA]';

function statusTone(status: Contestant['status']): 'green' | 'amber' | 'red' {
  if (status === 'EVICTED') return 'red';
  if (status === 'NOMINATED') return 'amber';
  return 'green';
}

function TeamPanel(props: {
  team: Team;
  teams: Team[];
  contestants: Contestant[];
  onRenameTeam(id: string, name: string): boolean;
  onUpdateTeam(id: string, patch: { description?: string; color?: string }): void;
  onDeleteTeam(id: string): void;
  onMoveMember(contestantId: string, teamId: string | null): void;
}) {
  const { team, teams, contestants, onRenameTeam, onUpdateTeam, onDeleteTeam, onMoveMember } = props;

  const members = contestants.filter((c) => c.teamId === team.id);
  const active = members.filter((c) => c.status !== 'EVICTED');
  const total = active.reduce((s, c) => s + c.points, 0);
  const avg = active.length > 0 ? Math.round(total / active.length) : 0;
  const top = [...active].sort((a, b) => b.points - a.points)[0] ?? null;

  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(team.name);
  const [renameError, setRenameError] = useState('');

  const [descValue, setDescValue] = useState(team.description);
  const [colorValue, setColorValue] = useState(team.color);

  const [checked, setChecked] = useState<string[]>([]);
  const candidates = contestants.filter(
    (c) => (c.teamId ?? null) !== team.id && c.status !== 'EVICTED',
  );

  function toggleChecked(id: string) {
    setChecked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function handleAddMembers() {
    checked.forEach((id) => onMoveMember(id, team.id));
    setChecked([]);
  }

  function handleSaveRename() {
    const v = renameValue.trim();
    if (!v) {
      setRenameError('Name cannot be empty.');
      return;
    }
    const ok = onRenameTeam(team.id, v);
    if (!ok) {
      setRenameError('A team with that name already exists.');
      return;
    }
    setRenameError('');
    setRenaming(false);
  }

  function handleDelete() {
    if (window.confirm(`Disband ${team.name}? Members move to No Team.`)) {
      onDeleteTeam(team.id);
    }
  }

  return (
    <div className={`${rowCls} space-y-2`}>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="inline-block h-3 w-3 shrink-0 rounded-full border border-white/20"
          style={{ backgroundColor: team.color }}
          aria-hidden="true"
        />
        <span className="font-bold text-sm text-[#FAFAFA]">{team.name}</span>
        <span className="text-xs text-[#A1A1AA]">
          {members.length} member{members.length === 1 ? '' : 's'}
        </span>
        <span className="text-xs text-[#A1A1AA]">
          TOTAL <span className="font-bold text-[#FAFAFA]">{total}</span> pts
        </span>
        <span className="text-xs text-[#A1A1AA]">
          AVG <span className="font-bold text-[#FAFAFA]">{avg}</span>
        </span>
        <span className="text-xs text-[#A1A1AA]">
          TOP {top ? `${top.name}·${top.points}` : '—'}
        </span>
        <span className="ml-auto flex gap-1.5">
          {renaming ? null : (
            <ActionButton kind="ghost" onClick={() => { setRenameValue(team.name); setRenameError(''); setRenaming(true); }}>
              RENAME
            </ActionButton>
          )}
          <ActionButton kind="danger" onClick={handleDelete}>
            DELETE TEAM
          </ActionButton>
        </span>
      </div>

      {team.description ? (
        <p className="text-xs text-[#A1A1AA]">{team.description}</p>
      ) : null}

      {renaming ? (
        <div className="flex flex-wrap items-center gap-2">
          <input
            className={inputCls}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            aria-label={`Rename ${team.name}`}
            placeholder="Team name"
          />
          <ActionButton kind="primary" onClick={handleSaveRename}>
            SAVE
          </ActionButton>
          <ActionButton kind="ghost" onClick={() => { setRenaming(false); setRenameError(''); }}>
            CANCEL
          </ActionButton>
        </div>
      ) : null}
      {renameError ? <p className="text-xs text-[#FB7185]">{renameError}</p> : null}

      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[160px] flex-1">
          <label className={labelCls} htmlFor={`desc-${team.id}`}>Description</label>
          <input
            id={`desc-${team.id}`}
            className={inputCls}
            value={descValue}
            onChange={(e) => setDescValue(e.target.value)}
            placeholder="Description"
          />
        </div>
        <div>
          <label className={labelCls} htmlFor={`color-${team.id}`}>Accent</label>
          <select
            id={`color-${team.id}`}
            className={inputCls}
            value={colorValue}
            onChange={(e) => setColorValue(e.target.value)}
          >
            {COLOR_CHOICES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <ActionButton kind="ghost" onClick={() => onUpdateTeam(team.id, { description: descValue, color: colorValue })}>
          SAVE
        </ActionButton>
      </div>

      <div className="space-y-1">
        {members.length === 0 ? (
          <p className="text-xs text-[#A1A1AA]">No members yet.</p>
        ) : (
          members.map((m) => {
            const evicted = m.status === 'EVICTED';
            return (
              <div key={m.id} className="flex items-center gap-2 rounded-md border border-[#27272A] bg-[#18181B] px-2 py-1">
                <span className="min-w-0 flex-1 truncate text-xs text-[#FAFAFA]">{m.name}</span>
                <span className="text-xs text-[#A1A1AA]">{m.points} pts</span>
                <Badge tone={statusTone(m.status)}>{m.status}</Badge>
                <ActionButton
                  kind="ghost"
                  onClick={() => onMoveMember(m.id, null)}
                  disabled={evicted}
                  title={evicted ? 'Evicted members cannot be removed' : `Remove ${m.name} from ${team.name}`}
                >
                  REMOVE
                </ActionButton>
              </div>
            );
          })
        )}
      </div>

      {candidates.length > 0 ? (
        <div className="space-y-1">
          <p className={labelCls}>Add members</p>
          <div className="max-h-32 space-y-1 overflow-y-auto">
            {candidates.map((c) => (
              <label key={c.id} className="flex cursor-pointer items-center gap-2 text-xs text-[#FAFAFA]">
                <input
                  type="checkbox"
                  checked={checked.includes(c.id)}
                  onChange={() => toggleChecked(c.id)}
                  className="accent-[#E11D48]"
                />
                <span className="min-w-0 flex-1 truncate">{c.name}</span>
                <span className="text-[#A1A1AA]">{teamName(teams, c.teamId)}</span>
              </label>
            ))}
          </div>
          <ActionButton kind="ghost" onClick={handleAddMembers} disabled={checked.length === 0}>
            ADD TO TEAM
          </ActionButton>
        </div>
      ) : null}
    </div>
  );
}

export function TeamManager(props: {
  teams: Team[];
  contestants: Contestant[];
  onCreateTeam(name: string, description: string, color: string): boolean;
  onRenameTeam(id: string, name: string): boolean;
  onUpdateTeam(id: string, patch: { description?: string; color?: string }): void;
  onDeleteTeam(id: string): void;
  onMoveMember(contestantId: string, teamId: string | null): void;
  onAddContestant(name: string, teamId: string | null, points: number): boolean;
}) {
  const { teams, contestants, onCreateTeam, onRenameTeam, onUpdateTeam, onDeleteTeam, onMoveMember, onAddContestant } = props;

  const [createName, setCreateName] = useState('');
  const [createDesc, setCreateDesc] = useState('');
  const [createColor, setCreateColor] = useState(COLOR_CHOICES[0].value);
  const [createError, setCreateError] = useState('');

  const [ncName, setNcName] = useState('');
  const [ncTeam, setNcTeam] = useState('NONE');
  const [ncPoints, setNcPoints] = useState(0);
  const [ncError, setNcError] = useState('');

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = createName.trim();
    if (!name) {
      setCreateError('Team name cannot be empty.');
      return;
    }
    const ok = onCreateTeam(name, createDesc.trim(), createColor);
    if (!ok) {
      setCreateError('A team with that name already exists.');
      return;
    }
    setCreateError('');
    setCreateName('');
    setCreateDesc('');
    setCreateColor(COLOR_CHOICES[0].value);
  }

  function handleAddContestant(e: React.FormEvent) {
    e.preventDefault();
    const name = ncName.trim();
    if (!name) {
      setNcError('Contestant name cannot be empty.');
      return;
    }
    const teamId = ncTeam === 'NONE' ? null : ncTeam;
    const ok = onAddContestant(name, teamId, Number.isFinite(ncPoints) ? ncPoints : 0);
    if (!ok) {
      setNcError('A contestant with that name already exists.');
      return;
    }
    setNcError('');
    setNcName('');
    setNcTeam('NONE');
    setNcPoints(0);
  }

  return (
    <Card title="TEAM MANAGEMENT" subtitle="Create • Rename • Staff • Disband" id="teams">
      <form onSubmit={handleCreate} className="space-y-2">
        <div className="grid gap-2 sm:grid-cols-3">
          <div>
            <label className={labelCls} htmlFor="create-team-name">Team Name</label>
            <input
              id="create-team-name"
              className={inputCls}
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="Team name"
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="create-team-desc">Description</label>
            <input
              id="create-team-desc"
              className={inputCls}
              value={createDesc}
              onChange={(e) => setCreateDesc(e.target.value)}
              placeholder="Description"
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="create-team-color">Accent</label>
            <select
              id="create-team-color"
              className={inputCls}
              value={createColor}
              onChange={(e) => setCreateColor(e.target.value)}
            >
              {COLOR_CHOICES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
        <ActionButton kind="primary" type="submit">
          CREATE TEAM
        </ActionButton>
        {createError ? <p className="text-xs text-[#FB7185]">{createError}</p> : null}
      </form>

      <div className="mt-4 space-y-2">
        {teams.map((t) => (
          <TeamPanel
            key={t.id}
            team={t}
            teams={teams}
            contestants={contestants}
            onRenameTeam={onRenameTeam}
            onUpdateTeam={onUpdateTeam}
            onDeleteTeam={onDeleteTeam}
            onMoveMember={onMoveMember}
          />
        ))}
      </div>
      <p className="mt-2 text-[11px] text-[#A1A1AA]">
        Disbanding a team never deletes members — they move to No Team.
      </p>

      <form onSubmit={handleAddContestant} className="mt-4 space-y-2 border-t border-[#27272A] pt-3">
        <p className={labelCls}>Add contestant</p>
        <div className="grid gap-2 sm:grid-cols-3">
          <div>
            <label className={labelCls} htmlFor="nc-name">Name</label>
            <input
              id="nc-name"
              className={inputCls}
              value={ncName}
              onChange={(e) => setNcName(e.target.value)}
              placeholder="Contestant name"
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="nc-team">Team</label>
            <select
              id="nc-team"
              className={inputCls}
              value={ncTeam}
              onChange={(e) => setNcTeam(e.target.value)}
            >
              <option value="NONE">No Team</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="nc-points">Starting Points</label>
            <input
              id="nc-points"
              type="number"
              className={inputCls}
              value={ncPoints}
              onChange={(e) => setNcPoints(Number(e.target.value))}
            />
          </div>
        </div>
        <ActionButton kind="primary" type="submit">
          ADD CONTESTANT
        </ActionButton>
        {ncError ? <p className="text-xs text-[#FB7185]">{ncError}</p> : null}
      </form>
    </Card>
  );
}

export function TeamStandings(props: { teams: Team[]; contestants: Contestant[]; tasks: Task[] }) {
  const { teams, contestants, tasks } = props;
  const rows = calcStandings(teams, contestants, tasks);

  return (
    <Card title="TEAM STANDINGS" subtitle="Active member points" id="team-standings">
      {rows.length === 0 ? (
        <p className="text-xs text-[#A1A1AA]">No teams yet.</p>
      ) : (
        <ol className="space-y-1">
          {rows.map((s, i) => (
            <li
              key={s.teamId ?? 'none'}
              className={`flex items-center gap-2 rounded-lg border border-[#27272A] bg-white/[0.02] px-2 py-1.5`}
            >
              <span className="w-6 shrink-0 text-xs font-bold text-[#A1A1AA]">{i + 1}</span>
              <span
                className="inline-block h-3 w-3 shrink-0 rounded-full border border-white/20"
                style={{ backgroundColor: s.color }}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1 truncate text-sm text-[#FAFAFA]">{s.name}</span>
              <span className="shrink-0 text-xs text-[#A1A1AA]">
                {s.members.length} member{s.members.length === 1 ? '' : 's'}
              </span>
              <span className="shrink-0 text-sm font-bold text-[#FAFAFA]">{s.totalPoints} pts</span>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

export function TeamFilter(props: { teams: Team[]; value: string; onChange(v: string): void }) {
  const { teams, value, onChange } = props;
  return (
    <div>
      <label className={labelCls} htmlFor="team-filter">Team</label>
      <select
        id="team-filter"
        aria-label="Filter by team"
        className={inputCls}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="ALL">ALL TEAMS</option>
        {teams.map((t) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
        <option value="NONE">NO TEAM</option>
      </select>
    </div>
  );
}
