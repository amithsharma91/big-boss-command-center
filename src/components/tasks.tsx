import { useEffect, useRef, useState } from 'react';
import type { Task, Contestant } from '../types';
import { Card, Badge, ActionButton } from './ui';

type Filter = 'ALL' | 'ASSIGNED' | 'UNASSIGNED' | 'COMPLETED';

const inputClass = 'bg-[#18181B] border border-[#27272A] rounded text-xs px-2 py-1.5 text-[#FAFAFA]';
const labelClass = 'text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA]';
const rowClass = 'flex flex-wrap items-center gap-2 rounded border border-[#27272A] bg-white/[0.02] px-2 py-1.5';

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
  onCreate(title: string, description: string, assignedTo: string | null, reward: number): boolean;
  onUpdate(id: string, patch: { title?: string; description?: string; reward?: number }): boolean;
  onDelete(id: string): void;
  onAward(id: string): void;
  canManage: boolean;
  ownContestantId: string | null;
  canUpdateOwn: boolean;
}) {
  const { tasks, contestants, onAssign, onToggle, onCreate, onUpdate, onDelete, onAward, canManage, ownContestantId, canUpdateOwn } = props;
  const canFlip = (task: Task): boolean =>
    canManage || (canUpdateOwn && ownContestantId !== null && task.assignedTo === ownContestantId);
  const [filter, setFilter] = useState<Filter>('ALL');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignTo, setAssignTo] = useState('');
  const [reward, setReward] = useState('0');
  const [createError, setCreateError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editReward, setEditReward] = useState('0');
  const [editError, setEditError] = useState<string | null>(null);

  const active = contestants.filter((c) => c.status !== 'EVICTED');

  const contestantName = (id: string | null): string | null => {
    if (!id) return null;
    return contestants.find((c) => c.id === id)?.name ?? null;
  };

  const isAssigneeActive = (task: Task): boolean => {
    if (!task.assignedTo) return false;
    const c = contestants.find((x) => x.id === task.assignedTo);
    return c !== undefined && c.status !== 'EVICTED';
  };

  const assignedCount = tasks.filter((t) => t.assignedTo !== null).length;
  const unassignedCount = tasks.filter((t) => t.assignedTo === null).length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const counts: Record<Filter, number> = {
    ALL: tasks.length,
    ASSIGNED: assignedCount,
    UNASSIGNED: unassignedCount,
    COMPLETED: completedCount,
  };
  const filters: Filter[] = ['ALL', 'ASSIGNED', 'UNASSIGNED', 'COMPLETED'];

  const visible = tasks.filter((t) => {
    if (filter === 'ASSIGNED') return t.assignedTo !== null;
    if (filter === 'UNASSIGNED') return t.assignedTo === null;
    if (filter === 'COMPLETED') return t.completed;
    return true;
  });

  const pct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = title.trim();
    if (!name) {
      setCreateError('Task name is required.');
      return;
    }
    const rewardNum = Math.max(0, Math.floor(Number(reward) || 0));
    const ok = onCreate(name, description, assignTo === '' ? null : assignTo, rewardNum);
    if (!ok) {
      setCreateError('Could not create task.');
      return;
    }
    setTitle('');
    setDescription('');
    setAssignTo('');
    setReward('0');
    setCreateError(null);
  }

  function startEdit(task: Task) {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditReward(String(task.reward ?? 0));
    setEditError(null);
  }

  function handleSave(id: string) {
    const name = editTitle.trim();
    if (!name) {
      setEditError('Task name is required.');
      return;
    }
    const rewardNum = Math.max(0, Math.floor(Number(editReward) || 0));
    const ok = onUpdate(id, { title: name, description: editDescription, reward: rewardNum });
    if (!ok) {
      setEditError('Could not save task.');
      return;
    }
    setEditingId(null);
    setEditError(null);
  }

  return (
    <Card title="TASK MANAGEMENT" subtitle="Create • Assign • Complete • Reward" id="tasks">
      {!canManage ? (
        <p className="mb-3 rounded-lg border border-[#27272A] bg-white/[0.02] px-3 py-2 text-xs text-[#A1A1AA]">
          Task creation locked — requires tasks.manage. Contestants can only update their own assigned tasks.
        </p>
      ) : null}
      {canManage ? (
      <form onSubmit={handleCreate} className="mb-3 grid gap-2 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="task-name">Task Name</label>
          <input
            id="task-name"
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="task-desc">Description</label>
          <input
            id="task-desc"
            className={inputClass}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="task-assign">Assign To</label>
          <select
            id="task-assign"
            className={inputClass}
            value={assignTo}
            onChange={(e) => setAssignTo(e.target.value)}
          >
            <option value="">Unassigned</option>
            {active.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="task-reward">Reward pts</label>
          <input
            id="task-reward"
            type="number"
            min={0}
            className={inputClass}
            value={reward}
            onChange={(e) => setReward(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <ActionButton type="submit" kind="primary">
            CREATE TASK
          </ActionButton>
          {createError !== null && (
            <p className="mt-1 text-xs text-[#FDA4AF]">{createError}</p>
          )}
        </div>
      </form>
      ) : null}

      <div className="mb-2 flex flex-wrap gap-2" role="tablist" aria-label="Filter tasks">
        {filters.map((f) => (
          <ActionButton
            key={f}
            kind={filter === f ? 'primary' : 'ghost'}
            onClick={() => setFilter(f)}
          >
            {f} ({counts[f]})
          </ActionButton>
        ))}
      </div>

      <div className="space-y-2">
        {visible.length === 0 && (
          <p className="text-xs text-[#A1A1AA]">No tasks match this filter.</p>
        )}
        {visible.map((task) => {
          const name = contestantName(task.assignedTo);
          const showAward =
            task.completed && task.reward > 0 && !task.rewarded && isAssigneeActive(task);
          const isEditing = editingId === task.id;
          return (
            <div key={task.id} className={rowClass}>
              {task.completed ? (
                <Badge tone="green">COMPLETED</Badge>
              ) : task.assignedTo !== null ? (
                <Badge tone="blue">ASSIGNED</Badge>
              ) : (
                <Badge tone="gray">UNASSIGNED</Badge>
              )}
              <div className="min-w-0 flex-1 basis-40">
                <div className="truncate text-sm font-bold text-[#FAFAFA]">{task.title}</div>
                {task.description ? (
                  <div className="truncate text-xs text-[#A1A1AA]">{task.description}</div>
                ) : null}
              </div>
              {name ? <Badge tone="blue">{name}</Badge> : <Badge tone="gray">UNASSIGNED</Badge>}
              {task.reward > 0 && <Badge tone="amber">+{task.reward} PTS</Badge>}
              {task.rewarded && <Badge tone="gray">AWARDED</Badge>}
              <label className="flex items-center gap-1 text-[11px] text-[#A1A1AA]">
                Assign:
                <select
                  className={inputClass}
                  value={task.assignedTo ?? ''}
                  disabled={!canManage}
                  title={canManage ? undefined : 'Requires tasks.manage'}
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
              </label>
              <ActionButton
                kind={task.completed ? 'ghost' : 'primary'}
                disabled={!canFlip(task)}
                title={canFlip(task) ? undefined : 'Requires tasks.manage or own-task assignment'}
                onClick={() => onToggle(task.id)}
              >
                {task.completed ? 'REOPEN' : 'COMPLETE'}
              </ActionButton>
              {showAward && canManage && (
                <ActionButton kind="green" onClick={() => onAward(task.id)}>
                  AWARD +{task.reward}
                </ActionButton>
              )}
              {showAward && !canManage && (
                <span className="text-[11px] text-[#A1A1AA]" title="Requires tasks.manage">🔒 reward locked</span>
              )}
              <ActionButton
                kind="ghost"
                disabled={!canManage}
                title={canManage ? undefined : 'Requires tasks.manage'}
                onClick={() => (isEditing ? setEditingId(null) : startEdit(task))}
              >
                {isEditing ? 'CANCEL' : 'EDIT'}
              </ActionButton>
              <ActionButton
                kind="danger"
                disabled={!canManage}
                title={canManage ? undefined : 'Requires tasks.manage'}
                onClick={() => {
                  if (window.confirm(`Delete task "${task.title}"?`)) {
                    onDelete(task.id);
                  }
                }}
              >
                DELETE
              </ActionButton>
              {isEditing && (
                <div className="grid w-full gap-2 sm:grid-cols-3">
                  <div className="flex flex-col gap-1">
                    <label className={labelClass} htmlFor={`edit-title-${task.id}`}>Task Name</label>
                    <input
                      id={`edit-title-${task.id}`}
                      className={inputClass}
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className={labelClass} htmlFor={`edit-desc-${task.id}`}>Description</label>
                    <input
                      id={`edit-desc-${task.id}`}
                      className={inputClass}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className={labelClass} htmlFor={`edit-reward-${task.id}`}>Reward pts</label>
                    <input
                      id={`edit-reward-${task.id}`}
                      type="number"
                      min={0}
                      className={inputClass}
                      value={editReward}
                      onChange={(e) => setEditReward(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:col-span-3">
                    <ActionButton kind="primary" onClick={() => handleSave(task.id)}>
                      SAVE
                    </ActionButton>
                    <ActionButton kind="ghost" onClick={() => setEditingId(null)}>
                      CANCEL
                    </ActionButton>
                    {editError !== null && (
                      <span className="text-xs text-[#FDA4AF]">{editError}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="text-[11px] text-[#A1A1AA]">
          COMPLETED: {completedCount} / {tasks.length} • UNASSIGNED: {unassignedCount}
        </span>
        <div
          className="h-1.5 flex-1 overflow-hidden rounded bg-white/10"
          role="progressbar"
          aria-valuenow={completedCount}
          aria-valuemin={0}
          aria-valuemax={tasks.length}
          aria-label="Tasks completed"
        >
          <div className="h-full rounded bg-green-500" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </Card>
  );
}

export function TaskTimer(props: { canManage: boolean }) {
  const { canManage } = props;
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

  useEffect(() => {
    if (running && remaining <= 0) {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setRunning(false);
    }
  }, [running, remaining]);

  const start = () => {
    if (running) return;
    if (remaining <= 0) setRemaining(totalSecs);
    setRunning(true);
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
    }
    intervalRef.current = window.setInterval(() => {
      setRemaining((prev) => (prev <= 1 ? 0 : prev - 1));
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
    if (Number.isNaN(mins)) return;
    const clamped = Math.min(120, Math.max(1, Math.floor(mins)));
    const secs = clamped * 60;
    setTotalSecs(secs);
    if (!running) setRemaining(secs);
  };

  const danger = remaining <= 60 && running && remaining > 0;
  const progress = totalSecs > 0 ? (remaining / totalSecs) * 100 : 0;

  return (
    <Card title="TASK TIMER" subtitle="Countdown • START / PAUSE / RESET" id="task-timer">
      {!canManage ? (
        <p className="mb-3 rounded-lg border border-[#27272A] bg-white/[0.02] px-3 py-2 text-center text-xs text-[#A1A1AA]">
          Timer controls locked — requires timer.manage. Countdown is visible to all roles.
        </p>
      ) : null}
      <div className="flex flex-col items-center gap-3">
        <div
          className={
            danger
              ? 'font-black text-4xl tabular-nums text-[#FDA4AF] animate-pulse'
              : 'font-black text-4xl tabular-nums text-[#FAFAFA]'
          }
        >
          {format(remaining)}
        </div>
        {remaining === 0 && <Badge tone="red">TIME UP</Badge>}
        <div
          className="h-1.5 w-full overflow-hidden rounded bg-white/10"
          role="progressbar"
          aria-valuenow={remaining}
          aria-valuemin={0}
          aria-valuemax={totalSecs}
          aria-label="Time remaining"
        >
          <div className="h-full rounded bg-red-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center gap-2">
          <label className={labelClass} htmlFor="task-timer-mins">
            Minutes
          </label>
          <input
            id="task-timer-mins"
            type="number"
            min={1}
            max={120}
            value={Math.round(totalSecs / 60)}
            disabled={running || !canManage}
            title={canManage ? undefined : 'Requires timer.manage'}
            onChange={(e) => handleMinutes(Number(e.target.value))}
            className={`${inputClass} w-16 disabled:opacity-50`}
          />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <ActionButton kind="primary" onClick={start} disabled={running || !canManage} title={canManage ? undefined : 'Requires timer.manage'}>
            START
          </ActionButton>
          <ActionButton kind="ghost" onClick={pause} disabled={!running || !canManage} title={canManage ? undefined : 'Requires timer.manage'}>
            PAUSE
          </ActionButton>
          <ActionButton kind="danger" onClick={reset} disabled={!canManage} title={canManage ? undefined : 'Requires timer.manage'}>
            RESET
          </ActionButton>
        </div>
      </div>
    </Card>
  );
}
