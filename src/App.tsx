import { useMemo, useState } from 'react';
import { useHouse } from './store';
import { Header } from './components/ui';
import { BroadcastBar } from './components/broadcast';
import { Leaderboard, ContestantGrid, HouseStats } from './components/contestants';
import { TaskManager, TaskTimer } from './components/tasks';
import { TeamManager, TeamStandings, TeamFilter } from './components/teams';
import { CommandPanel, DangerZone, AnnouncementBar, EventFeed } from './components/house';

export default function App() {
  const house = useHouse();
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

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA]">
      <Header onReset={house.resetAll} activeCount={house.stats.active} />

      <main className="mx-auto max-w-[1440px] space-y-4 p-3 md:p-5">
        <BroadcastBar
          announcement={house.announcements[0] ?? null}
          count={house.announcements.length}
        />

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
            />
          </div>
          <div className="lg:col-span-2">
            <TaskTimer />
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

        <footer className="pb-4 pt-2 text-center text-[11px] tracking-widest text-[#A1A1AA]">
          BIG BOSS COMMAND CENTER • ROUND 01 • STATE PERSISTED LOCALLY
        </footer>
      </main>
    </div>
  );
}
