import { useState } from 'react';
import type { Permission, Role } from '../auth/rbac';
import { ROLES, roleHas } from '../auth/rbac';
import { useAuth } from '../auth/AuthContext';
import type { AuditEntry } from '../auth/AuthContext';
import { Badge, Card } from './ui';
import { RoleBadge } from './session';

const ROLE_BLURBS: Record<Role, string> = {
  BIG_BOSS: 'Full house control',
  MODERATOR: 'House operations, no user/role admin',
  CONTESTANT: 'View house + update own tasks',
  VIEWER: 'Read-only',
};

const MATRIX_PERMS: Permission[] = [
  'dashboard.view',
  'contestants.manage',
  'teams.manage',
  'tasks.manage',
  'points.manage',
  'captain.manage',
  'nominations.manage',
  'immunity.manage',
  'eviction.manage',
  'announcements.manage',
  'timer.manage',
  'users.manage',
  'roles.manage',
  'own-task.update',
];

export function RoleMatrix() {
  return (
    <Card title="ROLE & PERMISSIONS" subtitle="What each role can do" id="roles">
      <div className="space-y-3">
        {ROLES.map((role) => (
          <div key={role}>
            <div className="flex flex-wrap items-center gap-2">
              <RoleBadge role={role} />
              <span className="text-xs text-[#A1A1AA]">{ROLE_BLURBS[role]}</span>
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {MATRIX_PERMS.map((perm) => {
                const has = roleHas(role, perm);
                return (
                  <span
                    key={perm}
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] ${
                      has
                        ? 'border-[#22C55E]/40 bg-[#22C55E]/15 text-[#86EFAC]'
                        : 'border-[#27272A] bg-white/[0.02] text-[#A1A1AA]'
                    }`}
                  >
                    <span aria-hidden="true">{has ? '✓' : '✕'}</span>
                    {perm}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function UserManagement() {
  const { users, can, setUserRole } = useAuth();
  const [error, setError] = useState('');
  const allowed = can('roles.manage');

  if (!allowed) {
    return (
      <Card title="USER MANAGEMENT" subtitle="BIG_BOSS can change roles" id="users">
        <p className="text-xs text-[#A1A1AA]">Requires roles.manage — switch to BIG_BOSS to manage roles.</p>
        <ul className="mt-2 space-y-1.5">
          {users.map((u) => (
            <li
              key={u.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-[#27272A] bg-white/[0.02] px-2 py-1.5"
            >
              <span className="truncate text-xs font-semibold text-[#FAFAFA]">{u.name}</span>
              <RoleBadge role={u.role} />
            </li>
          ))}
        </ul>
      </Card>
    );
  }

  return (
    <Card title="USER MANAGEMENT" subtitle="BIG_BOSS can change roles" id="users">
      <ul className="space-y-1.5">
        {users.map((u) => (
          <li
            key={u.id}
            className="flex flex-wrap items-center gap-2 rounded-lg border border-[#27272A] bg-white/[0.02] px-2 py-1.5"
          >
            <span className="min-w-0 flex-1 truncate text-xs font-semibold text-[#FAFAFA]">{u.name}</span>
            <RoleBadge role={u.role} />
            <select
              value={u.role}
              aria-label={`Role for ${u.name}`}
              onChange={(e) => {
                const ok = setUserRole(u.id, e.target.value as Role);
                setError(ok ? '' : `Could not change role for ${u.name}.`);
              }}
              className="rounded-lg border border-[#27272A] bg-[#18181B] px-2 py-1.5 text-xs text-[#FAFAFA]"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </li>
        ))}
      </ul>
      {error ? (
        <p role="alert" className="mt-2 text-xs text-[#FDA4AF]">
          {error}
        </p>
      ) : null}
      <p className="mt-2 text-[11px] text-[#A1A1AA]">Changes apply immediately and are audited.</p>
    </Card>
  );
}

export function AuditLog(props: { audit: AuditEntry[] }) {
  const { audit } = props;
  const entries = [...audit].reverse().slice(0, 25);
  return (
    <Card title="ACCESS AUDIT" subtitle="Sign-ins, role changes, denied attempts" id="audit">
      {entries.length === 0 ? (
        <p className="text-xs text-[#A1A1AA]">No access events yet.</p>
      ) : (
        <ul className="slim-scroll max-h-56 space-y-1.5 overflow-y-auto pr-1">
          {entries.map((e) => (
            <li
              key={e.id}
              className="rounded-lg border border-[#27272A] bg-white/[0.02] px-2 py-1.5"
            >
              <div className="font-mono text-[10px] text-[#A1A1AA]">{e.timestamp}</div>
              <div className="text-xs text-[#E4E4E7]">{e.message}</div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
