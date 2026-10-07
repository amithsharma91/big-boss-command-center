import { useMemo } from 'react';
import { useHouse } from './store';
import { Header } from './components/ui';
import { Leaderboard, ContestantGrid, HouseStats } from './components/contestants';
import { TaskManager, TaskTimer } from './components/tasks';
import { CommandPanel, DangerZone, AnnouncementBar, EventFeed } from './components/house';

export default function App() {
  const house = useHouse();
  const nominees = useMemo(
    () => house.contestants.filter((c) => c.status === 'NOMINATED'),
    [house.contestants],
  );
  const captainName =
    house.contestants.find((c) => c.captain && c.status !== 'EVICTED')?.name ?? '—';

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#18181B]">
      <Header onReset={house.resetAll} activeCount={house.stats.active} />

      <main className="mx-auto max-w-[1440px] space-y-4 p-3 md:p-5">
        <section aria-label="Top statistics">
          <HouseStats stats={house.stats} captainName={captainName} />
        </section>

        <section aria-label="Leaderboard and command" className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <Leaderboard board={house.leaderboard} />
          </div>
          <div className="lg:col-span-2">
            <CommandPanel
              contestants={house.contestants}
              onAdd={house.addPoints}
              onSub={house.subtractPoints}
              onNominate={house.nominate}
              onGrantImmunity={house.grantImmunity}
              onChangeCaptain={house.changeCaptain}
              onEvict={house.evict}
            />
          </div>
        </section>

        <section aria-label="Contestants and timer" className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <ContestantGrid
              contestants={house.contestants}
              onAdd={house.addPoints}
              onSub={house.subtractPoints}
              onNominate={house.nominate}
              onRemoveNomination={house.removeNomination}
              onGrantImmunity={house.grantImmunity}
              onRevokeImmunity={house.revokeImmunity}
              onChangeCaptain={house.changeCaptain}
              onEvict={house.evict}
            />
          </div>
          <div className="lg:col-span-2">
            <TaskTimer />
          </div>
        </section>

        <section aria-label="Tasks and danger zone" className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <TaskManager tasks={house.tasks} contestants={house.contestants} onAssign={house.assignTask} onToggle={house.toggleTask} />
          </div>
          <div className="lg:col-span-2">
            <DangerZone
              nominees={nominees}
              onEvict={house.evict}
              onRemoveNomination={house.removeNomination}
            />
          </div>
        </section>

        <section aria-label="Announcements and activity" className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <AnnouncementBar announcements={house.announcements} onAnnounce={house.makeAnnouncement} />
          </div>
          <div className="lg:col-span-2">
            <EventFeed events={house.events} />
          </div>
        </section>

        <footer className="pb-4 pt-2 text-center text-[11px] tracking-widest text-[#A1A1AA]">
          BIG BOSS COMMAND CENTER • ROUND 01 • STATE PERSISTED LOCALLY
        </footer>
      </main>
    </div>
  );
}
