export type ContestantStatus = 'ACTIVE' | 'NOMINATED' | 'EVICTED';
export interface Contestant { id: string; name: string; team: string; points: number; status: ContestantStatus; immune: boolean; captain: boolean; }
export interface Task { id: string; title: string; assignedTo: string | null; completed: boolean; }
export interface Announcement { id: string; text: string; createdAt: string; }
export type EventType = 'points' | 'captain' | 'nominate' | 'immunity' | 'evict' | 'task' | 'announce' | 'system';
export interface EventLog { id: string; message: string; timestamp: string; type: EventType; }
export interface HouseStats { active: number; nominated: number; immune: number; evicted: number; completedTasks: number; totalTasks: number; totalPoints: number; highestScorer: Contestant | null; }
