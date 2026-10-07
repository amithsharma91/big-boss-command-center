export type ContestantStatus = 'ACTIVE' | 'NOMINATED' | 'EVICTED';

export interface Contestant {
  id: string;
  name: string;
  /** Team membership. Null = No Team. Replaces the old `team: string` field. */
  teamId: string | null;
  points: number;
  status: ContestantStatus;
  immune: boolean;
  captain: boolean;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  /** Hex accent, restricted to COLOR_CHOICES in UI. */
  color: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string | null;
  completed: boolean;
  /** Optional point reward. 0 = none. */
  reward: number;
  /** True once the reward has been paid out. */
  rewarded: boolean;
}

export interface Announcement {
  id: string;
  text: string;
  createdAt: string;
}

export type EventType =
  | 'points'
  | 'captain'
  | 'nominate'
  | 'immunity'
  | 'evict'
  | 'task'
  | 'announce'
  | 'system'
  | 'team';

export interface EventLog {
  id: string;
  message: string;
  timestamp: string;
  type: EventType;
}

export interface HouseStats {
  active: number;
  nominated: number;
  immune: number;
  evicted: number;
  completedTasks: number;
  totalTasks: number;
  totalPoints: number;
  highestScorer: Contestant | null;
}

export interface TeamStats {
  teamId: string | null;
  name: string;
  color: string;
  members: Contestant[];
  totalPoints: number;
  avgPoints: number;
  topScorer: Contestant | null;
  completedTasks: number;
}

/** Controlled accent palette for teams. */
export const COLOR_CHOICES: { label: string; value: string }[] = [
  { label: 'Crimson', value: '#E11D48' },
  { label: 'Gold', value: '#D4AF37' },
  { label: 'Violet', value: '#8B5CF6' },
  { label: 'Blue', value: '#3B82F6' },
  { label: 'Emerald', value: '#10B981' },
  { label: 'Orange', value: '#F59E0B' },
  { label: 'Silver', value: '#A1A1AA' },
];

export function teamName(teams: Team[], teamId: string | null): string {
  if (!teamId) return 'No Team';
  return teams.find((t) => t.id === teamId)?.name ?? 'No Team';
}

export function teamColor(teams: Team[], teamId: string | null): string {
  if (!teamId) return '#A1A1AA';
  return teams.find((t) => t.id === teamId)?.color ?? '#A1A1AA';
}

/** Live per-team metrics. Only ACTIVE members count toward points. */
export function calcTeamStats(
  teams: Team[],
  contestants: Contestant[],
  tasks: Task[],
  teamId: string | null,
): TeamStats {
  const name = teamId === null ? 'No Team' : teamName(teams, teamId);
  const color = teamId === null ? '#A1A1AA' : teamColor(teams, teamId);
  const members = contestants.filter((c) => (c.teamId ?? null) === teamId);
  const active = members.filter((c) => c.status !== 'EVICTED');
  const totalPoints = active.reduce((s, c) => s + c.points, 0);
  const sorted = [...active].sort((a, b) => b.points - a.points);
  const memberIds = new Set(members.map((m) => m.id));
  const completedTasks = tasks.filter(
    (t) => t.completed && t.assignedTo !== null && memberIds.has(t.assignedTo),
  ).length;
  return {
    teamId,
    name,
    color,
    members,
    totalPoints,
    avgPoints: active.length > 0 ? Math.round(totalPoints / active.length) : 0,
    topScorer: sorted[0] ?? null,
    completedTasks,
  };
}

/** Standings across all teams + No Team bucket, ranked by active points desc. */
export function calcStandings(
  teams: Team[],
  contestants: Contestant[],
  tasks: Task[],
): TeamStats[] {
  const ids: (string | null)[] = [...teams.map((t) => t.id)];
  if (contestants.some((c) => (c.teamId ?? null) === null)) ids.push(null);
  return ids
    .map((id) => calcTeamStats(teams, contestants, tasks, id))
    .sort((a, b) => b.totalPoints - a.totalPoints);
}
