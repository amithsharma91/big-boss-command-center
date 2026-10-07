import { useEffect, useMemo, useState } from 'react';
import type { Announcement, Contestant, EventLog, EventType, HouseStats, Task } from './types';
import { seedAnnouncements, seedContestants, seedEvents, seedTasks } from './seed';

const STORAGE_KEY = 'bigboss-v1';
const MAX_EVENTS = 60;

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function makeEvent(type: EventType, message: string): EventLog {
  return {
    id: makeId(),
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

interface PersistedState {
  contestants: Contestant[];
  tasks: Task[];
  announcements: Announcement[];
  events: EventLog[];
}

function loadInitial(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedState>;
      if (
        Array.isArray(parsed.contestants) &&
        Array.isArray(parsed.tasks) &&
        Array.isArray(parsed.announcements) &&
        Array.isArray(parsed.events)
      ) {
        return {
          contestants: parsed.contestants,
          tasks: parsed.tasks,
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
    tasks: seedTasks(),
    announcements: seedAnnouncements(),
    events: seedEvents(),
  };
}

export function useHouse() {
  const [initial] = useState<PersistedState>(loadInitial);
  const [contestants, setContestants] = useState<Contestant[]>(initial.contestants);
  const [tasks, setTasks] = useState<Task[]>(initial.tasks);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initial.announcements);
  const [events, setEvents] = useState<EventLog[]>(initial.events);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ contestants, tasks, announcements, events }),
      );
    } catch {
      // storage unavailable — ignore
    }
  }, [contestants, tasks, announcements, events]);

  const addPoints = (id: string, amount: number): void => {
    if (!Number.isFinite(amount) || amount <= 0) return;
    const target = contestants.find((c) => c.id === id);
    if (!target) return;
    setContestants((prev) =>
      prev.map((c) => (c.id === id ? { ...c, points: Math.max(0, c.points + amount) } : c)),
    );
    setEvents((prev) => pushTo(prev, 'points', `+${amount} points → ${target.name}`));
  };

  const subtractPoints = (id: string, amount: number): void => {
    if (!Number.isFinite(amount) || amount <= 0) return;
    const target = contestants.find((c) => c.id === id);
    if (!target) return;
    setContestants((prev) =>
      prev.map((c) => (c.id === id ? { ...c, points: Math.max(0, c.points - amount) } : c)),
    );
    setEvents((prev) => pushTo(prev, 'points', `-${amount} points → ${target.name}`));
  };

  const changeCaptain = (id: string): void => {
    const target = contestants.find((c) => c.id === id);
    if (!target || target.status === 'EVICTED') return;
    setContestants((prev) => prev.map((c) => ({ ...c, captain: c.id === id })));
    setEvents((prev) => pushTo(prev, 'captain', `${target.name} became Captain`));
  };

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
    if (!target) return;
    setContestants((prev) => prev.map((c) => (c.id === id ? { ...c, immune: false } : c)));
    setEvents((prev) => pushTo(prev, 'immunity', `${target.name} immunity revoked`));
  };

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

  const evict = (id: string): void => {
    const target = contestants.find((c) => c.id === id);
    if (!target || target.status === 'EVICTED') return;
    setContestants((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: 'EVICTED', captain: false, immune: false } : c,
      ),
    );
    setEvents((prev) => pushTo(prev, 'evict', `${target.name} EVICTED from the house`));
  };

  const assignTask = (taskId: string, contestantId: string | null): void => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    if (contestantId !== null) {
      const assignee = contestants.find((c) => c.id === contestantId);
      if (!assignee) return;
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, assignedTo: contestantId } : t)));
      setEvents((prev) => pushTo(prev, 'task', `Task "${task.title}" assigned to ${assignee.name}`));
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

  const makeAnnouncement = (text: string): void => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const announcement: Announcement = {
      id: makeId(),
      text: trimmed,
      createdAt: new Date().toLocaleString(),
    };
    setAnnouncements((prev) => [announcement, ...prev]);
    const truncated = trimmed.length > 60 ? `${trimmed.slice(0, 60)}…` : trimmed;
    setEvents((prev) => pushTo(prev, 'announce', `Announcement: ${truncated}`));
  };

  const resetAll = (): void => {
    setContestants(seedContestants());
    setTasks(seedTasks());
    setAnnouncements(seedAnnouncements());
    setEvents([makeEvent('system', 'House reset to initial state'), ...seedEvents()].slice(0, MAX_EVENTS));
  };

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
    assignTask,
    toggleTask,
    makeAnnouncement,
    resetAll,
  };
}

export type HouseApi = ReturnType<typeof useHouse>;
