import type { Announcement, Contestant, EventLog, Task } from './types';

export function seedContestants(): Contestant[] {
  return [
    { id: 'aarav', name: 'Aarav', team: 'Alpha', points: 980, status: 'ACTIVE', immune: false, captain: true },
    { id: 'riya', name: 'Riya', team: 'Beta', points: 850, status: 'NOMINATED', immune: false, captain: false },
    { id: 'kabir', name: 'Kabir', team: 'Alpha', points: 790, status: 'ACTIVE', immune: false, captain: false },
    { id: 'sara', name: 'Sara', team: 'Gamma', points: 720, status: 'ACTIVE', immune: true, captain: false },
    { id: 'dev', name: 'Dev', team: 'Beta', points: 680, status: 'NOMINATED', immune: false, captain: false },
    { id: 'meera', name: 'Meera', team: 'Gamma', points: 640, status: 'ACTIVE', immune: false, captain: false },
    { id: 'arjun', name: 'Arjun', team: 'Alpha', points: 590, status: 'ACTIVE', immune: false, captain: false },
    { id: 'nisha', name: 'Nisha', team: 'Beta', points: 540, status: 'NOMINATED', immune: false, captain: false },
    { id: 'vihaan', name: 'Vihaan', team: 'Gamma', points: 470, status: 'ACTIVE', immune: false, captain: false },
    { id: 'anaya', name: 'Anaya', team: 'Alpha', points: 410, status: 'ACTIVE', immune: false, captain: false },
  ];
}

export function seedTasks(): Task[] {
  return [
    { id: 't1', title: 'Code Hunt', assignedTo: 'aarav', completed: true },
    { id: 't2', title: 'Logic Arena', assignedTo: 'kabir', completed: false },
    { id: 't3', title: 'System Design', assignedTo: null, completed: false },
    { id: 't4', title: 'Rapid Build', assignedTo: 'riya', completed: true },
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
