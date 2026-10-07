import type { Announcement, Contestant, EventLog, Task, Team } from './types';

export function seedTeams(): Team[] {
  const now = new Date().toLocaleString();
  return [
    { id: 'team-alpha', name: 'Alpha', description: 'Main challenge squad', color: '#E11D48', createdAt: now },
    { id: 'team-beta', name: 'Beta', description: 'Strategy and subterfuge', color: '#3B82F6', createdAt: now },
    { id: 'team-gamma', name: 'Gamma', description: 'Dark-horse contenders', color: '#10B981', createdAt: now },
  ];
}

export function seedContestants(): Contestant[] {
  return [
    { id: 'aarav', name: 'Aarav', teamId: 'team-alpha', points: 980, status: 'ACTIVE', immune: false, captain: true },
    { id: 'riya', name: 'Riya', teamId: 'team-beta', points: 850, status: 'NOMINATED', immune: false, captain: false },
    { id: 'kabir', name: 'Kabir', teamId: 'team-alpha', points: 790, status: 'ACTIVE', immune: false, captain: false },
    { id: 'sara', name: 'Sara', teamId: 'team-gamma', points: 720, status: 'ACTIVE', immune: true, captain: false },
    { id: 'dev', name: 'Dev', teamId: 'team-beta', points: 680, status: 'NOMINATED', immune: false, captain: false },
    { id: 'meera', name: 'Meera', teamId: 'team-gamma', points: 640, status: 'ACTIVE', immune: false, captain: false },
    { id: 'arjun', name: 'Arjun', teamId: 'team-alpha', points: 590, status: 'ACTIVE', immune: false, captain: false },
    { id: 'nisha', name: 'Nisha', teamId: 'team-beta', points: 540, status: 'NOMINATED', immune: false, captain: false },
    { id: 'vihaan', name: 'Vihaan', teamId: 'team-gamma', points: 470, status: 'ACTIVE', immune: false, captain: false },
    { id: 'anaya', name: 'Anaya', teamId: 'team-alpha', points: 410, status: 'ACTIVE', immune: false, captain: false },
  ];
}

export function seedTasks(): Task[] {
  return [
    { id: 't1', title: 'Code Hunt', description: 'Find the hidden logic bug before the timer ends.', assignedTo: 'aarav', completed: true, reward: 50, rewarded: true },
    { id: 't2', title: 'Logic Arena', description: 'Head-to-head puzzle battle.', assignedTo: 'kabir', completed: false, reward: 50, rewarded: false },
    { id: 't3', title: 'System Design', description: 'Design a house-scale voting system.', assignedTo: null, completed: false, reward: 0, rewarded: false },
    { id: 't4', title: 'Rapid Build', description: 'Ship a working prototype in record time.', assignedTo: 'riya', completed: true, reward: 0, rewarded: false },
  ];
}

export function seedAnnouncements(): Announcement[] {
  return [
    {
      id: 'a1',
      text: 'Welcome to Bigg Boss Round 01! Captain Aarav leads the house. Tasks are live — earn points, dodge nominations.',
      createdAt: new Date().toLocaleString(),
    },
  ];
}

export function seedEvents(): EventLog[] {
  const ts = () => new Date().toLocaleTimeString();
  return [
    { id: 'e1', message: 'House opened for Round 01', timestamp: ts(), type: 'system' },
    { id: 'e2', message: 'Aarav became Captain', timestamp: ts(), type: 'captain' },
    { id: 'e3', message: 'Code Hunt completed', timestamp: ts(), type: 'task' },
  ];
}
