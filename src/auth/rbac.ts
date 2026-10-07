export type Role = 'BIG_BOSS' | 'MODERATOR' | 'CONTESTANT' | 'VIEWER';
export type Permission =
  | 'dashboard.view' | 'contestants.view' | 'contestants.manage'
  | 'teams.view' | 'teams.manage' | 'tasks.view' | 'tasks.manage'
  | 'points.manage' | 'captain.manage' | 'nominations.manage'
  | 'immunity.manage' | 'eviction.manage' | 'announcements.view'
  | 'announcements.manage' | 'timer.manage' | 'statistics.view'
  | 'users.manage' | 'roles.manage' | 'audit.view'
  | 'own-task.view' | 'own-task.update';
export interface DemoUser { id: string; name: string; role: Role; contestantId?: string; }
export const ROLES: Role[] = ['BIG_BOSS', 'MODERATOR', 'CONTESTANT', 'VIEWER'];
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  BIG_BOSS: ['dashboard.view','contestants.view','contestants.manage','teams.view','teams.manage','tasks.view','tasks.manage','points.manage','captain.manage','nominations.manage','immunity.manage','eviction.manage','announcements.view','announcements.manage','timer.manage','statistics.view','users.manage','roles.manage','audit.view','own-task.view','own-task.update'],
  MODERATOR: ['dashboard.view','contestants.view','contestants.manage','teams.view','teams.manage','tasks.view','tasks.manage','points.manage','captain.manage','nominations.manage','immunity.manage','announcements.view','announcements.manage','timer.manage','statistics.view','audit.view','own-task.view','own-task.update'],
  CONTESTANT: ['dashboard.view','contestants.view','teams.view','tasks.view','own-task.view','own-task.update','statistics.view','announcements.view'],
  VIEWER: ['dashboard.view','contestants.view','teams.view','tasks.view','statistics.view','announcements.view'],
};
export const DEFAULT_USERS: DemoUser[] = [
  { id: 'u-aarav', name: 'Aarav', role: 'BIG_BOSS' },
  { id: 'u-riya', name: 'Riya', role: 'MODERATOR' },
  { id: 'u-kabir', name: 'Kabir', role: 'CONTESTANT', contestantId: 'kabir' },
  { id: 'u-sara', name: 'Sara', role: 'VIEWER' },
];
export function permissionsFor(role: Role): Permission[] { return ROLE_PERMISSIONS[role] ?? []; }
export function roleHas(role: Role, perm: Permission): boolean { return permissionsFor(role).includes(perm); }
export function can(user: DemoUser | null | undefined, perm: Permission): boolean {
  if (!user) return false;
  return roleHas(user.role, perm);
}
