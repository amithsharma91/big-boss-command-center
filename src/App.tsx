import { useMemo, useState } from 'react';
import { AuthProvider, useAuth } from './auth/AuthContext';
import type { Permission } from './auth/rbac';
import { can as canFor } from './auth/rbac';
import { useHouse } from './store';
import { Header } from './components/ui';
import { BroadcastBar } from './components/broadcast';
import { CurrentUserSwitcher, DeniedBanner } from './components/session';
import { RoleMatrix, UserManagement, AuditLog } from './components/access';
import { Leaderboard, ContestantGrid, HouseStats } from './components/contestants';
import { TaskManager, TaskTimer } from './components/tasks';
import { TeamManager, TeamStandings, TeamFilter } from './components/teams';
import { CommandPanel, DangerZone, AnnouncementBar, EventFeed } from './components/house';

function Shell() {
  const auth = useAuth();
  const house = useHouse({
    authorize: (perm: Permission) => canFor(auth.currentUser, perm),
    ownContestantId: auth.currentUser.contestantId ?? null,
    onDenied: (perm, action) => auth.deny(perm, action),
  });
  const [teamFilter, setTeamFilter] = useState<string>('ALL');

  const nominees = useMemo(
    () => house.contestants.filter((c) => c.status === 'NOMINATED'),
    [house.contestants],
  );
  const captainName =
    house.contestants.find((c) => c.captain && c.status !== 'EVICTED')?.name ?? '—';

  const visibleContestants = useMemo(() => {
    if (teamFilter === 'ALL') return house.contestants;
    if (teamFilter === 'NONE') return house.contestants.filter((c) => (c.teamId ?? null) === null);
    return house.contestants.filter((c) => c.teamId === teamFilter);
  }, [house.contestants, teamFilter]);

  const canManageTasks = auth.can('tasks.manage');
  const canUpdateOwn = auth.can('own-task.update');
  const ownContestantId = auth.currentUser.contestantId ?? null;

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA]">
      <Header
        onReset={house.resetAll}
        activeCount={house.stats.active}
        canReset={auth.can('users.manage')}
      />

      <main className="mx-auto max-w-[1440px] space-y-4 p-3 md:p-5">
        <section aria-label="Session" className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <CurrentUserSwitcher />
          </div>
          <div className="lg:col-span-3">
            <BroadcastBar
              announcement={house.announcements[0] ?? null}
              count={house.announcements.length}
            />
          </div>
        </section>

        <section aria-label="Top statistics">
          <HouseStats stats={house.stats} captainName={captainName} />
        </section>

        <section aria-label="Leaderboard and command" className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <Leaderboard board={house.leaderboard} teams={house.teams} />
          </div>
          <div className="lg:col-span-2">
            <CommandPanel
              contestants={house.contestants}
              teams={house.teams}
              onAdd={house.addPoints}
              onSub={house.subtractPoints}
              onNominate={house.nominate}
              onGrantImmunity={house.grantImmunity}
              onChangeCaptain={house.changeCaptain}
              onEvict={house.evict}
            />
          </div>
        </section>

        <section aria-label="Teams and contestants" className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <TeamManager
              teams={house.teams}
              contestants={house.contestants}
              onCreateTeam={(name, description, color) => house.createTeam(name, description, color) !== null}
              onRenameTeam={house.renameTeam}
              onUpdateTeam={house.updateTeam}
              onDeleteTeam={house.deleteTeam}
              onMoveMember={house.moveMember}
              onAddContestant={(name, teamId, points) => house.addContestant(name, teamId, points) !== null}
              canManage={auth.can('teams.manage')}
              canAddContestant={auth.can('contestants.manage')}
            />
          </div>
          <div className="lg:col-span-2">
            <TeamStandings teams={house.teams} contestants={house.contestants} tasks={house.tasks} />
          </div>
        </section>

        <section aria-label="Contestants">
          <ContestantGrid
            contestants={visibleContestants}
            teams={house.teams}
            filter={<TeamFilter teams={house.teams} value={teamFilter} onChange={setTeamFilter} />}
            onAdd={house.addPoints}
            onSub={house.subtractPoints}
            onNominate={house.nominate}
            onRemoveNomination={house.removeNomination}
            onGrantImmunity={house.grantImmunity}
            onRevokeImmunity={house.revokeImmunity}
            onChangeCaptain={house.changeCaptain}
            onEvict={house.evict}
          />
        </section>

        <section aria-label="Tasks and timer" className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <TaskManager
              tasks={house.tasks}
              contestants={house.contestants}
              onAssign={house.assignTask}
              onToggle={house.toggleTask}
              onCreate={(title, description, assignedTo, reward) =>
                house.createTask(title, description, assignedTo, reward) !== null
              }
              onUpdate={house.updateTask}
              onDelete={house.deleteTask}
              onAward={house.awardTaskReward}
              canManage={canManageTasks}
              ownContestantId={ownContestantId}
              canUpdateOwn={canUpdateOwn}
            />
          </div>
          <div className="lg:col-span-2">
            <TaskTimer canManage={auth.can('timer.manage')} />
          </div>
        </section>

        <section aria-label="Danger zone and activity" className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <DangerZone
              nominees={nominees}
              teams={house.teams}
              onEvict={house.evict}
              onRemoveNomination={house.removeNomination}
            />
          </div>
          <div className="lg:col-span-2">
            <EventFeed events={house.events} />
          </div>
        </section>

        <section aria-label="Announcement">
          <AnnouncementBar announcements={house.announcements} onAnnounce={house.makeAnnouncement} />
        </section>

        <section aria-label="Access control" id="access" className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <RoleMatrix />
          </div>
          <div className="lg:col-span-2">
            <UserManagement />
          </div>
        </section>

        <section aria-label="Access audit">
          <AuditLog audit={auth.audit} />
        </section>

        <footer className="pb-4 pt-2 text-center text-[11px] tracking-widest text-[#A1A1AA]">
          BIG BOSS COMMAND CENTER • ROUND 01 • STATE PERSISTED LOCALLY (bigboss-v1 + bigboss-rbac-v1)
        </footer>
      </main>
      <DeniedBanner />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
