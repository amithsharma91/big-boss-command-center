import { useHouse } from './store';
import { Header } from './components/ui';
import { Leaderboard, ContestantGrid, HouseStats } from './components/contestants';
import { TaskManager, TaskTimer } from './components/tasks';
import { CommandPanel, DangerZone, AnnouncementBar, EventFeed } from './components/house';

export default function App() {
  const house = useHouse();
  const nominees = house.contestants.filter(
    (c) => c.status === 'NOMINATED',
  );

  return (
    <div className="min-h-screen bg-[#07070c] text-zinc-100">
      <Header onReset={house.resetAll} activeCount={house.stats.active} />

      <main className="mx-auto max-w-[1440px] space-y-4 p-3 md:p-5">
        <section aria-label="Top statistics">
          <HouseStats stats={house.stats} />
        </section>

        <section
          aria-label="Command row"
          className="grid grid-cols-1 gap-4 lg:grid-cols-3"
        >
          <Leaderboard board={house.leaderboard} />
          <div className="flex flex-col gap-4">
            <CommandPanel
              contestants={house.contestants}
              onAdd={house.addPoints}
              onSub={house.subtractPoints}
              onNominate={house.nominate}
              onGrantImmunity={house.grantImmunity}
              onChangeCaptain={house.changeCaptain}
              onEvict={house.evict}
            />
            <TaskTimer />
          </div>
          <div className="flex flex-col gap-4">
            <DangerZone
              nominees={nominees}
              onEvict={house.evict}
              onRemoveNomination={house.removeNomination}
            />
            <EventFeed events={house.events} />
          </div>
        </section>

        <section aria-label="Contestant management">
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
        </section>

        <section
          aria-label="Tasks and announcements"
          className="grid grid-cols-1 gap-4 lg:grid-cols-5"
        >
          <div className="lg:col-span-3">
            <TaskManager
              tasks={house.tasks}
              contestants={house.contestants}
              onAssign={house.assignTask}
              onToggle={house.toggleTask}
            />
          </div>
          <div className="lg:col-span-2">
            <AnnouncementBar
              announcements={house.announcements}
              onAnnounce={house.makeAnnouncement}
            />
          </div>
        </section>

        <footer className="pb-4 pt-2 text-center text-[11px] tracking-widest text-zinc-600">
          BIG BOSS COMMAND CENTER • ROUND 01 • STATE PERSISTED LOCALLY
        </footer>
      </main>
    </div>
  );
}
