import type { ReactNode } from 'react';
import type { Permission, Role } from '../auth/rbac';
import { useAuth } from '../auth/AuthContext';
import { ActionButton } from './ui';

const ROLE_STYLES: Record<Role, { color: string; border: string; background: string }> = {
  BIG_BOSS: { color: '#D4AF37', border: 'rgba(212,175,55,0.4)', background: 'rgba(212,175,55,0.15)' },
  MODERATOR: { color: '#93C5FD', border: 'rgba(59,130,246,0.4)', background: 'rgba(59,130,246,0.15)' },
  CONTESTANT: { color: '#86EFAC', border: 'rgba(34,197,94,0.4)', background: 'rgba(34,197,94,0.15)' },
  VIEWER: { color: '#A1A1AA', border: 'rgba(39,39,42,1)', background: 'rgba(255,255,255,0.05)' },
};

export function RoleBadge(props: { role: Role }) {
  const { role } = props;
  const style = ROLE_STYLES[role];
  return (
    <span
      className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-widest"
      style={{ color: style.color, borderColor: style.border, backgroundColor: style.background }}
    >
      {role.replace(/_/g, ' ')}
    </span>
  );
}

export function CurrentUserSwitcher() {
  const { users, currentUser, switchUser } = useAuth();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA]">Current user</span>
      <span className="text-sm font-bold text-[#FAFAFA]">{currentUser.name}</span>
      <RoleBadge role={currentUser.role} />
      <select
        value={currentUser.id}
        onChange={(e) => switchUser(e.target.value)}
        aria-label="Switch user"
        className="rounded-lg border border-[#27272A] bg-[#18181B] px-2 py-1.5 text-xs text-[#FAFAFA]"
      >
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name} — {u.role.replace(/_/g, ' ')}
          </option>
        ))}
      </select>
    </div>
  );
}

export function RequirePermission(props: { perm: Permission; action: string; children: ReactNode }) {
  const { perm, action, children } = props;
  const { can } = useAuth();
  if (can(perm)) return <>{children}</>;
  return <AccessDeniedPanel perm={perm} action={action} />;
}

export function AccessDeniedPanel(props: { perm: Permission; action: string }) {
  const { perm, action } = props;
  const { currentUser } = useAuth();
  return (
    <div className="rounded-lg border border-[#E11D48]/40 bg-[#E11D48]/10 px-3 py-2">
      <p className="text-xs font-bold tracking-widest text-[#FDA4AF]">ACCESS DENIED</p>
      <p className="mt-1 text-[11px] text-[#FAFAFA]">Role: {currentUser.role.replace(/_/g, ' ')}</p>
      <p className="text-[11px] text-[#FAFAFA]">Tried: {action}</p>
      <p className="font-mono text-[11px] text-[#FAFAFA]">Requires: {perm}</p>
      <p className="mt-1 text-[11px] text-[#A1A1AA]">Switch to an authorized role to proceed.</p>
    </div>
  );
}

export function DeniedBanner() {
  const { denied, clearDenied } = useAuth();
  if (!denied) return null;
  return (
    <div
      aria-live="assertive"
      className="fixed bottom-3 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-[#E11D48]/50 bg-[#18181B] px-4 py-2 shadow-xl flex items-center gap-3"
    >
      <span className="text-xs text-[#FDA4AF]">
        ACCESS DENIED — {denied.action} requires {denied.perm}
      </span>
      <ActionButton kind="ghost" onClick={clearDenied}>
        DISMISS
      </ActionButton>
    </div>
  );
}
