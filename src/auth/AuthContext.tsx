import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { DemoUser, Permission, Role } from './rbac';
import { DEFAULT_USERS, ROLES, can as canFor } from './rbac';

export interface AuditEntry { id: string; message: string; timestamp: string; }

export interface AuthContextValue {
  users: DemoUser[];
  currentUser: DemoUser;
  can(perm: Permission): boolean;
  switchUser(id: string): void;
  setUserRole(id: string, role: Role): boolean;
  deny(perm: Permission, action: string): void;
  denied: { perm: Permission; action: string } | null;
  clearDenied(): void;
  audit: AuditEntry[];
}

const STORAGE_KEY = 'bigboss-rbac-v1';

interface PersistedState {
  users: DemoUser[];
  currentUserId: string;
  audit: AuditEntry[];
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function now(): string {
  return new Date().toLocaleTimeString('en-GB');
}

function isValidRole(role: unknown): role is Role {
  return typeof role === 'string' && (ROLES as string[]).includes(role);
}

function loadState(): PersistedState {
  const fallback: PersistedState = {
    users: DEFAULT_USERS,
    currentUserId: DEFAULT_USERS[0].id,
    audit: [],
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    let users: DemoUser[] = fallback.users;
    if (Array.isArray(parsed.users) && parsed.users.length > 0) {
      const cleaned = (parsed.users as DemoUser[]).filter(
        (u) => u && typeof u.id === 'string' && typeof u.name === 'string' && isValidRole(u.role),
      );
      if (cleaned.length > 0) users = cleaned;
    }
    let currentUserId = fallback.currentUserId;
    if (typeof parsed.currentUserId === 'string' && users.some((u) => u.id === parsed.currentUserId)) {
      currentUserId = parsed.currentUserId;
    } else {
      currentUserId = users[0].id;
    }
    let audit: AuditEntry[] = [];
    if (Array.isArray(parsed.audit)) {
      audit = (parsed.audit as AuditEntry[]).filter(
        (a) => a && typeof a.id === 'string' && typeof a.message === 'string' && typeof a.timestamp === 'string',
      ).slice(0, 40);
    }
    return { users, currentUserId, audit };
  } catch {
    return fallback;
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initial] = useState<PersistedState>(loadState);
  const [users, setUsers] = useState<DemoUser[]>(initial.users);
  const [currentUserId, setCurrentUserId] = useState<string>(initial.currentUserId);
  const [audit, setAudit] = useState<AuditEntry[]>(initial.audit);
  const [denied, setDenied] = useState<{ perm: Permission; action: string } | null>(null);

  useEffect(() => {
    try {
      const payload: PersistedState = { users, currentUserId, audit };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore persistence errors
    }
  }, [users, currentUserId, audit]);

  function pushAudit(message: string): void {
    const entry: AuditEntry = { id: makeId(), message, timestamp: now() };
    setAudit((prev) => [entry, ...prev].slice(0, 40));
  }

  const currentUser: DemoUser =
    users.find((u) => u.id === currentUserId) ?? users[0] ?? DEFAULT_USERS[0];

  function can(perm: Permission): boolean {
    return canFor(currentUser, perm);
  }

  function deny(perm: Permission, action: string): void {
    pushAudit(`${currentUser.name} attempted ${action}: ACCESS DENIED (requires ${perm})`);
    setDenied({ perm, action });
  }

  function clearDenied(): void {
    setDenied(null);
  }

  function switchUser(id: string): void {
    const target = users.find((u) => u.id === id);
    if (!target) return;
    setCurrentUserId(id);
    pushAudit(`${target.name} signed in as ${target.role}`);
  }

  function setUserRole(id: string, role: Role): boolean {
    if (!canFor(currentUser, 'roles.manage')) {
      deny('roles.manage', 'change role');
      return false;
    }
    if (!isValidRole(role)) return false;
    const target = users.find((u) => u.id === id);
    if (!target) return false;
    if (target.role === 'BIG_BOSS' && role !== 'BIG_BOSS') {
      const remaining = users.filter((u) => u.id !== id && u.role === 'BIG_BOSS').length;
      if (remaining === 0) {
        deny('roles.manage', 'remove the last BIG_BOSS');
        return false;
      }
    }
    const oldRole = target.role;
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    pushAudit(`${currentUser.name} changed ${target.name} role: ${oldRole} → ${role}`);
    return true;
  }

  const value: AuthContextValue = {
    users,
    currentUser,
    can,
    switchUser,
    setUserRole,
    deny,
    denied,
    clearDenied,
    audit,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
