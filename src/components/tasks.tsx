import { useEffect, useRef, useState } from 'react';
import type { Task, Contestant } from '../types';
import { Card, Badge, ActionButton } from './ui';

function format(s: number): string {
  const m = Math.floor(Math.max(0, s) / 60);
  const sec = Math.max(0, s) % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function TaskManager(props: {
  tasks: Task[];
  contestants: Contestant[];
  onAssign(taskId: string, contestantId: string | null): void;
  onToggle(taskId: string): void;
}) {
  const { tasks, contestants, onAssign, onToggle } = props;

  const contestantName = (id: string | null | undefined): string | null => {
    if (!id) return null;
    return contestants.find((c) => c.id === id)?.name ?? null;
  };

  const active = contestants.filter((c) => c.status !== 'EVICTED');
  const completed = tasks.filter((t) => t.completed).length;
  const pct = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

  return (
    <Card title="TASK MANAGEMENT" subtitle="Assign • Track • Complete" id="tasks">
      <div className="space-y-2">
        {tasks.length === 0 && (
          <p className="text-xs text-white/40">No tasks yet.</p>
        )}
        {tasks.map((task) => {
          const name = contestantName(task.assignedTo);
          return (
            <div
              key={task.id}
              className="flex items-center gap-2 rounded border border-white/10 bg-white/[0.02] px-2 py-1.5"
            >
              <span className="shrink-0 text-sm">{task.completed ? '✅' : '⬜'}</span>
              <span
                className={
                  task.completed
                    ? 'flex-1 text-sm font-semibold text-white/40 line-through'
                    : 'flex-1 text-sm font-semibold text-white'
                }
              >
                {task.title}
              </span>
              {name ? (
                <Badge tone="blue">{name}</Badge>
              ) : (
                <Badge tone="gray">UNASSIGNED</Badge>
              )}
              <select
                className="bg-[#0a0a12] border-white/10 rounded text-xs px-1 py-1"
                value={task.assignedTo ?? ''}
                onChange={(e) => onAssign(task.id, e.target.value || null)}
                aria-label={`Assign ${task.title}`}
              >
                <option value="">Unassigned</option>
                {active.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ActionButton
                kind={task.completed ? 'ghost' : 'primary'}
                onClick={() => onToggle(task.id)}
              >
                {task.completed ? 'REOPEN' : 'COMPLETE'}
              </ActionButton>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-[11px] text-white/50">
          COMPLETED: {completed} / {tasks.length}
        </span>
        <div className="h-1.5 flex-1 bg-white/10 rounded overflow-hidden">
          <div className="h-full bg-green-500 rounded" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </Card>
  );
}

export function TaskTimer() {
  const [totalSecs, setTotalSecs] = useState(900);
  const [remaining, setRemaining] = useState(900);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const start = () => {
    if (running) return;
    const base = remaining <= 0 ? totalSecs : remaining;
    if (remaining <= 0) setRemaining(base);
    setRunning(true);
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
    }
    intervalRef.current = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current !== null) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pause = () => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
  };

  const reset = () => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
    setRemaining(totalSecs);
  };

  const handleMinutes = (mins: number) => {
    const clamped = Math.min(120, Math.max(1, Math.floor(mins)));
    if (Number.isNaN(clamped)) return;
    const secs = clamped * 60;
    setTotalSecs(secs);
    if (!running) setRemaining(secs);
  };

  const danger = remaining <= 60 && running && remaining > 0;
  const progress = totalSecs > 0 ? (remaining / totalSecs) * 100 : 0;

  return (
    <Card title="TASK TIMER" subtitle="Default 15:00" id="task-timer">
      <div className="flex flex-col items-center gap-3">
        <div
          className={
            danger
              ? 'font-black text-4xl tabular-nums text-red-500 animate-pulse'
              : 'font-black text-4xl tabular-nums text-white'
          }
        >
          {format(remaining)}
        </div>
        {remaining === 0 && <Badge tone="red">⏱ TIME UP</Badge>}
        <div className="h-1.5 w-full bg-white/10 rounded overflow-hidden">
          <div
            className="h-full rounded bg-gradient-to-r from-red-600 to-red-400"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[11px] text-white/50" htmlFor="task-timer-mins">
            Mins
          </label>
          <input
            id="task-timer-mins"
            type="number"
            min={1}
            max={120}
            value={Math.round(totalSecs / 60)}
            disabled={running}
            onChange={(e) => handleMinutes(Number(e.target.value))}
            className="w-16 bg-[#0a0a12] border border-white/10 rounded text-xs px-1 py-1 disabled:opacity-50"
          />
        </div>
        <div className="flex items-center gap-2">
          <ActionButton kind="primary" onClick={start} disabled={running}>
            START
          </ActionButton>
          <ActionButton kind="ghost" onClick={pause} disabled={!running}>
            PAUSE
          </ActionButton>
          <ActionButton kind="danger" onClick={reset}>
            RESET
          </ActionButton>
        </div>
      </div>
    </Card>
  );
}
