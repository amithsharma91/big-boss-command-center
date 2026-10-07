import { useEffect, useMemo, useState } from 'react';
import type { Announcement, Contestant, EventLog, EventType, HouseStats, Task, Team } from './types';
import { seedAnnouncements, seedContestants, seedEvents, seedTasks, seedTeams } from './seed';

const STORAGE_KEY = 'bigboss-v1';
const MAX_EVENTS = 60;

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function makeEvent(type: EventType, message: string): EventLog {
  return {
    id: makeId('e'),
    message,
    timestamp: new Date().toLocaleTimeString('en-GB'),
    type,
  };
}

function pushTo(events: EventLog[], type: EventType, message: string): EventLog[] {
  return [makeEvent(type, message), ...events].slice(0, MAX_EVENTS);
}

export function canNominate(c: Contestant): { ok: boolean; reason: string } {
  if (c.status === 'EVICTED') return { ok: false, reason: 'Evicted' };
  if (c.immune) return { ok: false, reason: 'Immune — cannot nominate' };
  if (c.status === 'NOMINATED') return { ok: false, reason: 'Already nominated' };
  return { ok: true, reason: 'Eligible' };
}

/* ---------- validation ---------- */

function isContestant(c: unknown): c is Contestant {
  if (typeof c !== 'object' || c === null) return false;
  const o = c as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.name === 'string' &&
    (typeof o.teamId === 'string' || o.teamId === null || typeof o.team === 'string') &&
    typeof o.points === 'number' &&
    Number.isFinite(o.points) &&
    (o.status === 'ACTIVE' || o.status === 'NOMINATED' || o.status === 'EVICTED') &&
    typeof o.immune === 'boolean' &&
    typeof o.captain === 'boolean'
  );
}

function isTeam(t: unknown): t is Team {
  if (typeof t !== 'object' || t === null) return false;
  const o = t as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.name === 'string' &&
    typeof o.description === 'string' &&
    typeof o.color === 'string' &&
    typeof o.createdAt === 'string'
  );
}

function isTask(t: unknown): t is Task {
  if (typeof t !== 'object' || t === null) return false;
  const o = t as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.title === 'string' &&
    (typeof o.assignedTo === 'string' || o.assignedTo === null) &&
    typeof o.completed === 'boolean'
  );
}

function normalizeTask(t: Task): Task {
  return {
    id: t.id,
    title: t.title,
    description: typeof (t as Partial<Task>).description === 'string' ? (t as Partial<Task>).description as string : '',
    assignedTo: t.assignedTo,
    completed: t.completed,
    reward:
      typeof (t as Partial<Task>).reward === 'number' && Number.isFinite((t as Partial<Task>).reward as number)
        ? Math.max(0, Math.floor((t as Partial<Task>).reward as number))
        : 0,
    rewarded: (t as Partial<Task>).rewarded === true,
  };
}

function isAnnouncement(a: unknown): a is Announcement {
  if (typeof a !== 'object' || a === null) return false;
  const o = a as Record<string, unknown>;
  return typeof o.id === 'string' && typeof o.text === 'string' && typeof o.createdAt === 'string';
}

function isEvent(e: unknown): e is EventLog {
  if (typeof e !== 'object' || e === null) return false;
  const o = e as Record<string, unknown>;
  return typeof o.id === 'string' && typeof o.message === 'string' && typeof o.timestamp === 'string';
}

interface PersistedState {
  contestants: Contestant[];
  teams: Team[];
  tasks: Task[];
  announcements: Announcement[];
  events: EventLog[];
}

function slugTeam(name: string): string {
  return 'team-' + name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** Normalize old saves: `team: "Alpha"` string -> teamId, missing teams -> seeds. */
function migrate(
  rawContestants: unknown[],
  rawTeams: unknown,
): { contestants: Contestant[]; teams: Team[] } {
  const teams: Team[] =
    Array.isArray(rawTeams) && rawTeams.length > 0 && rawTeams.every(isTeam)
      ? (rawTeams as Team[])
      : seedTeams();
  const byName = new Map(teams.map((t) => [t.name.toLowerCase(), t.id]));
  const byId = new Set(teams.map((t) => t.id));
  const contestants = (rawContestants as (Contestant & { team?: unknown })[]).map((c) => {
    let teamId: string | null = typeof c.teamId === 'string' || c.teamId === null ? c.teamId : null;
    if (teamId === null && typeof c.team === 'string') {
      teamId = byName.get(c.team.toLowerCase()) ?? null;
    }
    if (teamId !== null && !byId.has(teamId)) teamId = null;
    const { team: _legacy, ...rest } = c;
    void _legacy;
    return { ...rest, teamId };
  });
  // Guarantee at most one captain among active contestants.
  let seenCaptain = false;
  for (const c of contestants) {
    if (c.captain && c.status !== 'EVICTED' && !seenCaptain) {
      seenCaptain = true;
    } else if (c.captain && seenCaptain) {
      c.captain = false;
    }
  }
  return { contestants, teams };
}

function loadInitial(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedState>;
      if (
        Array.isArray(parsed.contestants) &&
        parsed.contestants.length > 0 &&
        parsed.contestants.every(isContestant) &&
        Array.isArray(parsed.tasks) &&
        parsed.tasks.every(isTask) &&
        Array.isArray(parsed.announcements) &&
        parsed.announcements.every(isAnnouncement) &&
        Array.isArray(parsed.events) &&
        parsed.events.every(isEvent)
      ) {
        const { contestants, teams } = migrate(
          parsed.contestants,
          (parsed as { teams?: unknown }).teams,
        );
        return {
          contestants,
          teams,
          tasks: (parsed.tasks as Task[]).map(normalizeTask),
          announcements: parsed.announcements,
          events: parsed.events,
        };
      }
    }
  } catch {
    // fall through to seeds
  }
  return {
    contestants: seedContestants(),
    teams: seedTeams(),
    tasks: seedTasks(),
    announcements: seedAnnouncements(),
    events: seedEvents(),
  };
}

export function useHouse() {
  const [initial] = useState<PersistedState>(loadInitial);
  const [contestants, setContestants] = useState<Contestant[]>(initial.contestants);
  const [teams, setTeams] = useState<Team[]>(initial.teams);
  const [tasks, setTasks] = useState<Task[]>(initial.tasks);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initial.announcements);
  const [events, setEvents] = useState<EventLog[]>(initial.events);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ contestants, teams, tasks, announcements, events }),
      );
    } catch {
      // storage unavailable — ignore
    }
  }, [contestants, teams, tasks, announcements, events]);

  /* ---------- points ---------- */

  const addPoints = (id: string, amount: number): void => {
    if (!Number.isFinite(amount) || amount <= 0) return;
    const target = contestants.find((c) => c.id === id);
    if (!target || target.status === 'EVICTED') return;
    setContestants((prev) =>
      prev.map((c) => (c.id === id ? { ...c, points: Math.max(0, c.points + amount) } : c)),
    );
    setEvents((prev) => pushTo(prev, 'points', `+${amount} points → ${target.name}`));
  };

  const subtractPoints = (id: string, amount: number): void => {
    if (!Number.isFinite(amount) || amount <= 0) return;
    const target = contestants.find((c) => c.id === id);
    if (!target || target.status === 'EVICTED') return;
    setContestants((prev) =>
      prev.map((c) => (c.id === id ? { ...c, points: Math.max(0, c.points - amount) } : c)),
    );
    setEvents((prev) => pushTo(prev, 'points', `-${amount} points → ${target.name}`));
  };

  /* ---------- captain ---------- */

  const changeCaptain = (id: string): void => {
    const target = contestants.find((c) => c.id === id);
    if (!target || target.status === 'EVICTED') return;
    setContestants((prev) => prev.map((c) => ({ ...c, captain: c.id === id })));
    setEvents((prev) => pushTo(prev, 'captain', `${target.name} became Captain`));
  };

  /* ---------- immunity ---------- */

  const grantImmunity = (id: string): void => {
    const target = contestants.find((c) => c.id === id);
    if (!target || target.status === 'EVICTED') return;
    setContestants((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, immune: true, status: c.status === 'NOMINATED' ? 'ACTIVE' : c.status }
          : c,
      ),
    );
    setEvents((prev) => pushTo(prev, 'immunity', `${target.name} granted immunity`));
  };

  const revokeImmunity = (id: string): void => {
    const target = contestants.find((c) => c.id === id);
    if (!target || target.status === 'EVICTED') return;
    setContestants((prev) => prev.map((c) => (c.id === id ? { ...c, immune: false } : c)));
    setEvents((prev) => pushTo(prev, 'immunity', `${target.name} immunity revoked`));
  };

  /* ---------- nominations ---------- */

  const nominate = (id: string): void => {
    const target = contestants.find((c) => c.id === id);
    if (!target) return;
    if (!canNominate(target).ok) return;
    setContestants((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'NOMINATED' } : c)));
    setEvents((prev) => pushTo(prev, 'nominate', `${target.name} nominated`));
  };

  const removeNomination = (id: string): void => {
    const target = contestants.find((c) => c.id === id);
    if (!target || target.status !== 'NOMINATED') return;
    setContestants((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'ACTIVE' } : c)));
    setEvents((prev) => pushTo(prev, 'nominate', `${target.name} nomination removed`));
  };

  /* ---------- eviction ---------- */

  const evict = (id: string): void => {
    const target = contestants.find((c) => c.id === id);
    if (!target || target.status === 'EVICTED') return;
    setContestants((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: 'EVICTED', captain: false, immune: false } : c,
      ),
    );
    setTasks((prev) =>
      prev.map((t) => (t.assignedTo === id ? { ...t, assignedTo: null } : t)),
    );
    setEvents((prev) => pushTo(prev, 'evict', `${target.name} EVICTED from the house`));
  };

  /* ---------- teams ---------- */

  const teamNameInUse = (name: string, exceptId?: string): boolean =>
    teams.some((t) => t.id !== exceptId && t.name.toLowerCase() === name.trim().toLowerCase());

  const createTeam = (name: string, description: string, color: string): Team | null => {
    const clean = name.trim();
    if (!clean) return null;
    if (teamNameInUse(clean)) return null;
    const team: Team = {
      id: slugTeam(clean) || makeId('team'),
      name: clean,
      description: description.trim(),
      color,
      createdAt: new Date().toLocaleString(),
    };
    const finalId = teams.some((t) => t.id === team.id) ? makeId('team') : team.id;
    const created = { ...team, id: finalId };
    setTeams((prev) => [...prev, created]);
    setEvents((prev) => pushTo(prev, 'team', `Team "${clean}" created`));
    return created;
  };

  const renameTeam = (id: string, name: string): boolean => {
    const clean = name.trim();
    if (!clean || teamNameInUse(clean, id)) return false;
    const target = teams.find((t) => t.id === id);
    if (!target) return false;
    setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, name: clean } : t)));
    setEvents((prev) => pushTo(prev, 'team', `Team "${target.name}" renamed to "${clean}"`));
    return true;
  };

  const updateTeam = (id: string, patch: { description?: string; color?: string }): void => {
    const target = teams.find((t) => t.id === id);
    if (!target) return;
    setTeams((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              description: patch.description !== undefined ? patch.description.trim() : t.description,
              color: patch.color ?? t.color,
            }
          : t,
      ),
    );
    setEvents((prev) => pushTo(prev, 'team', `Team "${target.name}" updated`));
  };

  const deleteTeam = (id: string): void => {
    const target = teams.find((t) => t.id === id);
    if (!target) return;
    setTeams((prev) => prev.filter((t) => t.id !== id));
    setContestants((prev) => prev.map((c) => (c.teamId === id ? { ...c, teamId: null } : c)));
    setEvents((prev) => pushTo(prev, 'team', `Team "${target.name}" disbanded — members moved to No Team`));
  };

  const moveMember = (contestantId: string, teamId: string | null): void => {
    const target = contestants.find((c) => c.id === contestantId);
    if (!target || target.status === 'EVICTED') return;
    if (teamId !== null && !teams.some((t) => t.id === teamId)) return;
    if ((target.teamId ?? null) === teamId) return;
    const from = target.teamId ? teams.find((t) => t.id === target.teamId)?.name ?? 'No Team' : 'No Team';
    const to = teamId ? teams.find((t) => t.id === teamId)?.name ?? 'No Team' : 'No Team';
    setContestants((prev) => prev.map((c) => (c.id === contestantId ? { ...c, teamId } : c)));
    setEvents((prev) => pushTo(prev, 'team', `${target.name} moved from ${from} to ${to}`));
  };

  const addContestant = (name: string, teamId: string | null, points: number): Contestant | null => {
    const clean = name.trim();
    if (!clean) return null;
    if (contestants.some((c) => c.name.toLowerCase() === clean.toLowerCase())) return null;
    if (teamId !== null && !teams.some((t) => t.id === teamId)) return null;
    const safePoints = Number.isFinite(points) ? Math.max(0, Math.floor(points)) : 0;
    const base = clean.toLowerCase().replace(/[^a-z0-9]+/g, '');
    let id = base || makeId('c');
    if (contestants.some((c) => c.id === id)) id = makeId('c');
    const created: Contestant = {
      id,
      name: clean,
      teamId,
      points: safePoints,
      status: 'ACTIVE',
      immune: false,
      captain: false,
    };
    setContestants((prev) => [...prev, created]);
    setEvents((prev) => pushTo(prev, 'system', `${clean} entered the house`));
    return created;
  };

  /* ---------- tasks ---------- */

  const createTask = (
    title: string,
    description: string,
    assignedTo: string | null,
    reward: number,
  ): Task | null => {
    const clean = title.trim();
    if (!clean) return null;
    if (assignedTo !== null) {
      const assignee = contestants.find((c) => c.id === assignedTo);
      if (!assignee || assignee.status === 'EVICTED') return null;
    }
    const task: Task = {
      id: makeId('t'),
      title: clean,
      description: description.trim(),
      assignedTo,
      completed: false,
      reward: Number.isFinite(reward) ? Math.max(0, Math.floor(reward)) : 0,
      rewarded: false,
    };
    setTasks((prev) => [...prev, task]);
    const who = assignedTo ? contestants.find((c) => c.id === assignedTo)?.name ?? '' : null;
    setEvents((prev) =>
      pushTo(prev, 'task', who ? `Task "${clean}" created, assigned to ${who}` : `Task "${clean}" created`),
    );
    return task;
  };

  const updateTask = (id: string, patch: { title?: string; description?: string; reward?: number }): boolean => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return false;
    if (patch.title !== undefined && !patch.title.trim()) return false;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              title: patch.title !== undefined ? patch.title.trim() : t.title,
              description: patch.description !== undefined ? patch.description.trim() : t.description,
              reward:
                patch.reward !== undefined && Number.isFinite(patch.reward)
                  ? Math.max(0, Math.floor(patch.reward))
                  : t.reward,
            }
          : t,
      ),
    );
    setEvents((prev) => pushTo(prev, 'task', `Task "${task.title}" updated`));
    return true;
  };

  const deleteTask = (id: string): void => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setEvents((prev) => pushTo(prev, 'task', `Task "${task.title}" deleted`));
  };

  const assignTask = (taskId: string, contestantId: string | null): void => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    if (contestantId !== null) {
      const assignee = contestants.find((c) => c.id === contestantId);
      if (!assignee || assignee.status === 'EVICTED') return;
      const from = task.assignedTo ? contestants.find((c) => c.id === task.assignedTo)?.name : null;
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, assignedTo: contestantId } : t)));
      setEvents((prev) =>
        pushTo(
          prev,
          'task',
          from && from !== assignee.name
            ? `Task "${task.title}" reassigned from ${from} to ${assignee.name}`
            : `Task "${task.title}" assigned to ${assignee.name}`,
        ),
      );
    } else {
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, assignedTo: null } : t)));
      setEvents((prev) => pushTo(prev, 'task', `Task "${task.title}" unassigned`));
    }
  };

  const toggleTask = (taskId: string): void => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const next = !task.completed;
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, completed: next } : t)));
    setEvents((prev) =>
      pushTo(prev, 'task', next ? `Task "${task.title}" completed` : `Task "${task.title}" reopened`),
    );
  };

  /** Explicit one-time reward payout for a completed task. Never automatic. */
  const awardTaskReward = (taskId: string): void => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || !task.completed || task.rewarded || task.reward <= 0) return;
    const assignee = task.assignedTo ? contestants.find((c) => c.id === task.assignedTo) : undefined;
    if (!assignee || assignee.status === 'EVICTED') return;
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, rewarded: true } : t)));
    setContestants((prev) =>
      prev.map((c) => (c.id === assignee.id ? { ...c, points: c.points + task.reward } : c)),
    );
    setEvents((prev) =>
      pushTo(prev, 'points', `${assignee.name} completed "${task.title}" +${task.reward} points`),
    );
  };

  /* ---------- announcements ---------- */

  const makeAnnouncement = (text: string): void => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const announcement: Announcement = {
      id: makeId('a'),
      text: trimmed,
      createdAt: new Date().toLocaleString(),
    };
    setAnnouncements((prev) => [announcement, ...prev]);
    const truncated = trimmed.length > 60 ? `${trimmed.slice(0, 60)}…` : trimmed;
    setEvents((prev) => pushTo(prev, 'announce', `Announcement: ${truncated}`));
  };

  const resetAll = (): void => {
    setContestants(seedContestants());
    setTeams(seedTeams());
    setTasks(seedTasks());
    setAnnouncements(seedAnnouncements());
    setEvents([makeEvent('system', 'House reset to initial state'), ...seedEvents()].slice(0, MAX_EVENTS));
  };

  /* ---------- derived ---------- */

  const leaderboard = useMemo<Contestant[]>(
    () => contestants.filter((c) => c.status !== 'EVICTED').sort((a, b) => b.points - a.points),
    [contestants],
  );

  const stats = useMemo<HouseStats>(() => {
    const activeList = contestants.filter((c) => c.status !== 'EVICTED');
    return {
      active: activeList.length,
      nominated: contestants.filter((c) => c.status === 'NOMINATED').length,
      immune: contestants.filter((c) => c.immune && c.status !== 'EVICTED').length,
      evicted: contestants.filter((c) => c.status === 'EVICTED').length,
      completedTasks: tasks.filter((t) => t.completed).length,
      totalTasks: tasks.length,
      totalPoints: activeList.reduce((sum, c) => sum + c.points, 0),
      highestScorer: leaderboard[0] ?? null,
    };
  }, [contestants, tasks, leaderboard]);

  return {
    contestants,
    teams,
    tasks,
    announcements,
    events,
    leaderboard,
    stats,
    addPoints,
    subtractPoints,
    changeCaptain,
    grantImmunity,
    revokeImmunity,
    nominate,
    removeNomination,
    evict,
    createTeam,
    renameTeam,
    updateTeam,
    deleteTeam,
    moveMember,
    addContestant,
    createTask,
    updateTask,
    deleteTask,
    assignTask,
    toggleTask,
    awardTaskReward,
    makeAnnouncement,
    resetAll,
  };
}

export type HouseApi = ReturnType<typeof useHouse>;
