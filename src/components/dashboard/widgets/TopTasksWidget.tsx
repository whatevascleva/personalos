import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  Clock,
  ExternalLink,
  ChevronRight,
  Flame,
  Sparkles,
} from 'lucide-react';
import { useOS } from '../../../store/useOSStore';
import { TaskItem, TaskPriority } from '../../../types';

export const TopTasksWidget: React.FC = () => {
  const { tasks, toggleTask, createTask, setActiveView, openFile, projects } = useOS();
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('p1');
  const [newDue, setNewDue] = useState('Today, 18:00');

  // Filter and sort for Top 3 High Priority Tasks
  const highPriorityTasks = tasks
    .filter((t) => t.priority === 'p1' || t.priority === 'p2' || t.priority === 'p3')
    .sort((a, b) => {
      // Pending first
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      // Then P1, P2, P3
      const order: Record<TaskPriority, number> = { p1: 1, p2: 2, p3: 3, normal: 4 };
      return order[a.priority] - order[b.priority];
    })
    .slice(0, 3);

  const completedCount = highPriorityTasks.filter((t) => t.completed).length;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    createTask({
      title: newTitle.trim(),
      priority: newPriority,
      dueDate: newDue,
      completed: false,
      timeEstimate: '30m',
      category: 'Focus',
    });

    setNewTitle('');
    setIsAdding(false);
  };

  const priorityLabels: Record<
    TaskPriority,
    { label: string; textClass: string; badgeBg: string; borderClass: string }
  > = {
    p1: {
      label: 'P1 Focus',
      textClass: 'text-rose-300 font-semibold',
      badgeBg: 'bg-rose-500/15',
      borderClass: 'border-rose-400/30',
    },
    p2: {
      label: 'P2 High',
      textClass: 'text-amber-300 font-medium',
      badgeBg: 'bg-amber-500/15',
      borderClass: 'border-amber-400/30',
    },
    p3: {
      label: 'P3 Core',
      textClass: 'text-sky-300 font-medium',
      badgeBg: 'bg-sky-500/15',
      borderClass: 'border-sky-400/30',
    },
    normal: {
      label: 'Normal',
      textClass: 'text-slate-300',
      badgeBg: 'bg-white/10',
      borderClass: 'border-white/20',
    },
  };

  return (
    <div className="relative overflow-hidden rounded-2xl p-5 md:p-6 flex flex-col justify-between h-full backdrop-blur-2xl bg-gradient-to-b from-white/[0.14] via-[#24160E]/45 to-[#120B06]/70 border border-white/20 hover:border-white/35 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.35),inset_0_-1px_1px_0_rgba(0,0,0,0.35),0_16px_40px_-8px_rgba(18,11,6,0.65)] hover:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.45),0_20px_48px_-8px_rgba(18,11,6,0.75)] transition-all duration-300 group">
      {/* Liquid Glass Specular Highlight Refraction Beam */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 -left-28 w-80 h-60 bg-gradient-to-br from-white/30 via-white/10 to-transparent rounded-full blur-2xl transform -rotate-12"
      />
      {/* Top Specular Edge Line */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            {/* Liquid Glass Icon Capsule */}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-white/25 via-white/10 to-[#64504A]/50 border border-white/30 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_4px_12px_rgba(0,0,0,0.3)]">
              <Flame className="w-4 h-4 text-[#FAF4F0]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#FAF4F0] text-sm md:text-base tracking-tight flex items-center gap-2">
                Top 3 High Priority Tasks
              </h3>
            </div>
          </div>

          {/* Liquid Glass Controls / Counters */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#FAF4F0] tabular-nums bg-white/[0.08] backdrop-blur-xl px-2.5 py-0.5 rounded-full border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]">
              {completedCount}/3 done
            </span>
            <button
              onClick={() => setActiveView('tasks')}
              className="group/btn text-xs text-[#FAF4F0] hover:text-white px-2.5 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.16] backdrop-blur-xl border border-white/20 hover:border-white/35 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_2px_8px_rgba(0,0,0,0.25)] flex items-center gap-1 cursor-pointer transition-all active:scale-[0.97]"
              title="View all tasks"
            >
              <span>All Tasks</span>
              <ChevronRight className="w-3 h-3 text-[#CEB7AB] group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        <p className="text-xs text-[#A89E97] mb-4">
          Executive daily horizon. Direct your immediate energy toward these 3 mission-critical outcomes.
        </p>

        {/* Task List: Liquid Glass Sub-cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {highPriorityTasks.map((task) => {
            const project = projects.find((p) => p.id === task.projectId);
            const prioInfo = priorityLabels[task.priority];

            return (
              <div
                key={task.id}
                className={`relative overflow-hidden p-4 rounded-xl border backdrop-blur-xl transition-all duration-200 text-xs flex flex-col justify-between gap-3 group/task ${
                  task.completed
                    ? 'bg-gradient-to-b from-white/[0.04] to-black/[0.3] border-white/10 opacity-60 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
                    : 'bg-gradient-to-b from-white/[0.12] via-white/[0.05] to-black/[0.2] border-white/20 hover:border-white/40 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.3),inset_0_-1px_1px_0_rgba(0,0,0,0.3),0_8px_20px_-4px_rgba(0,0,0,0.4)] hover:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.45),0_12px_28px_-4px_rgba(0,0,0,0.5)]'
                }`}
              >
                {/* Liquid Glass Internal Specular Bloom */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-12 -right-12 w-28 h-28 bg-white/[0.08] rounded-full blur-xl group-hover/task:bg-white/[0.15] transition-all"
                />

                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    {/* Liquid Glass Priority Pill */}
                    <span
                      className={`text-[11px] font-mono px-2 py-0.5 rounded-full border backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] ${prioInfo.badgeBg} ${prioInfo.borderClass} ${prioInfo.textClass}`}
                    >
                      {prioInfo.label}
                    </span>

                    {/* Liquid Glass Checkbox Button */}
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 backdrop-blur-md active:scale-90 ${
                        task.completed
                          ? 'bg-gradient-to-br from-emerald-500/30 to-emerald-600/50 border border-emerald-400/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_0_12px_rgba(52,211,153,0.35)] text-emerald-300'
                          : 'bg-white/[0.08] hover:bg-white/[0.2] border border-white/25 hover:border-white/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_2px_6px_rgba(0,0,0,0.3)] text-[#CEB7AB] hover:text-white'
                      }`}
                      title={task.completed ? 'Mark uncompleted' : 'Mark completed'}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      ) : (
                        <Circle className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <span
                    className={`font-semibold line-clamp-2 leading-snug tracking-tight ${
                      task.completed ? 'line-through text-[#8A8C8D]' : 'text-[#FAF4F0]'
                    }`}
                  >
                    {task.title}
                  </span>
                </div>

                {/* Metadata Footer with Glass Separator */}
                <div className="relative z-10 flex items-center justify-between pt-2.5 border-t border-white/[0.12] text-[11px] text-[#CEB7AB] font-mono tabular-nums">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-[#CEB7AB]/80" />
                    <span>{task.dueDate}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {task.timeEstimate && <span>{task.timeEstimate}</span>}
                    {project && (
                      <>
                        <span aria-hidden="true" className="text-white/30">·</span>
                        <span className="text-[#FAF4F0] truncate max-w-[80px]">{project.title}</span>
                      </>
                    )}
                    {task.linkedFileId && (
                      <>
                        <span aria-hidden="true" className="text-white/30">·</span>
                        <button
                          onClick={() => openFile(task.linkedFileId!)}
                          className="px-1.5 py-0.5 rounded-full bg-white/[0.08] hover:bg-white/[0.18] border border-white/20 hover:border-white/35 backdrop-blur-md text-[#FAF4F0] hover:text-white flex items-center gap-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-all cursor-pointer"
                        >
                          <span>Spec</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {highPriorityTasks.length === 0 && (
            <div className="col-span-1 md:col-span-3 py-8 text-center border border-dashed border-white/20 rounded-xl bg-white/[0.04] backdrop-blur-xl">
              <Sparkles className="w-6 h-6 text-[#CEB7AB] mx-auto mb-2 opacity-75" />
              <p className="text-xs text-[#FAF4F0] font-medium">All high priority tasks completed!</p>
              <button
                onClick={() => setIsAdding(true)}
                className="mt-3 px-3.5 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.16] border border-white/25 hover:border-white/40 backdrop-blur-xl text-xs text-[#FAF4F0] font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] transition-all cursor-pointer active:scale-95"
              >
                + Define Next Top 3
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Inline Add Action: Liquid Glass Input & Buttons */}
      <div className="mt-4 pt-3.5 border-t border-white/[0.14] relative z-10">
        {isAdding ? (
          <form onSubmit={handleAddTask} className="space-y-2.5">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="What is your immediate mission-critical task?"
              autoFocus
              className="w-full px-3 py-2 text-xs bg-white/[0.06] hover:bg-white/[0.09] focus:bg-white/[0.1] backdrop-blur-xl border border-white/20 focus:border-white/45 rounded-xl text-[#FAF4F0] placeholder:text-[#A89E97]/70 shadow-[inset_0_1px_2px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.15)] focus:outline-none transition-all"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                  className="bg-black/60 backdrop-blur-xl border border-white/20 focus:border-white/40 text-[#FAF4F0] text-[11px] rounded-lg px-2.5 py-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] focus:outline-none cursor-pointer"
                >
                  <option value="p1">P1 Priority</option>
                  <option value="p2">P2 Priority</option>
                  <option value="p3">P3 Priority</option>
                </select>
                <input
                  type="text"
                  value={newDue}
                  onChange={(e) => setNewDue(e.target.value)}
                  placeholder="Due time"
                  className="w-32 px-2.5 py-1.5 text-[11px] bg-white/[0.06] focus:bg-white/[0.1] backdrop-blur-xl border border-white/20 focus:border-white/40 rounded-lg text-[#FAF4F0] placeholder:text-[#A89E97]/70 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 rounded-lg backdrop-blur-md bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 hover:border-white/30 text-[#CEB7AB] hover:text-[#FAF4F0] text-[11px] font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="px-3.5 py-1.5 rounded-lg relative overflow-hidden backdrop-blur-xl bg-gradient-to-b from-[#CEB7AB] via-[#B89D90] to-[#8C6D60] hover:brightness-110 disabled:opacity-50 disabled:pointer-events-none border border-white/40 text-[#120B06] font-semibold text-[11px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),0_4px_14px_rgba(100,80,74,0.4)] active:scale-95 transition-all cursor-pointer"
                >
                  Save Task
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Liquid Glass Action Button */
          <button
            onClick={() => setIsAdding(true)}
            className="w-full relative overflow-hidden group/btn flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl backdrop-blur-xl bg-gradient-to-r from-white/[0.14] via-white/[0.08] to-white/[0.14] hover:from-white/[0.22] hover:via-white/[0.14] hover:to-white/[0.22] border border-white/30 hover:border-white/50 text-[#FAF4F0] font-medium text-xs shadow-[inset_0_1px_1.5px_0_rgba(255,255,255,0.45),inset_0_-1px_1px_0_rgba(0,0,0,0.35),0_6px_20px_rgba(0,0,0,0.35)] hover:shadow-[inset_0_1px_2px_0_rgba(255,255,255,0.6),0_8px_24px_rgba(206,183,171,0.25)] active:scale-[0.99] transition-all duration-200 cursor-pointer"
          >
            {/* Liquid Shimmer Light Reflection Stripe */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-out"
            />
            <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
              <Plus className="w-3 h-3 text-[#FAF4F0]" />
            </div>
            <span className="tracking-wide">Add Focus Task</span>
          </button>
        )}
      </div>
    </div>
  );
};
