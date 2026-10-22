import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { useOS } from '../../../store/useOSStore';
import { TaskItem, TaskPriority } from '../../../types';

export const TopTasksWidget: React.FC = () => {
  const { tasks, toggleTask, createTask, setActiveView, projects, openFile } = useOS();

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('p1');

  // Filter top 3 tasks
  const highPriorityTasks = tasks
    .filter((t) => t.priority === 'p1' || t.priority === 'p2' || t.priority === 'p3')
    .slice(0, 3);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    createTask({
      title: newTitle.trim(),
      priority: newPriority,
      completed: false,
      dueDate: 'Today',
      domain: 'work',
    });

    setNewTitle('');
    setIsAdding(false);
  };

  const priorityLabels: Record<TaskPriority, { label: string }> = {
    p1: { label: 'P1 Urgent' },
    p2: { label: 'P2 High' },
    p3: { label: 'P3 Focus' },
    normal: { label: 'Routine' },
  };

  return (
    <div className="relative overflow-hidden rounded-2xl p-5 md:p-6 flex flex-col justify-between h-full backdrop-blur-2xl bg-white/65 border border-white/85 shadow-[inset_0_1.5px_1.5px_0_rgba(255,255,255,0.95),0_12px_32px_-8px_rgba(122,96,100,0.08)] transition-all duration-300 group">
      {/* Liquid Glass Specular Highlight Refraction Beam */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 -left-28 w-80 h-60 bg-gradient-to-br from-white/70 via-white/20 to-transparent rounded-full blur-2xl transform -rotate-12"
      />
      {/* Top Specular Edge Line */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
      />

      <div className="relative z-10">
        {/* Header (No icons on dashboard, no description under header, no count numbers) */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-[#382629] text-base tracking-tight">
              Top 3 High Priority Tasks
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('tasks')}
              className="text-xs text-[#7A6064] hover:text-[#382629] px-3 py-1 rounded-full bg-white/70 hover:bg-white backdrop-blur-md border border-white/80 hover:border-[#DF9FA8]/35 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_2px_6px_rgba(122,96,100,0.04)] cursor-pointer transition-all active:scale-95"
            >
              All Tasks
            </button>
          </div>
        </div>

        {/* Task List: Liquid Glass Sub-cards (Date and time removed as requested) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {highPriorityTasks.map((task) => {
            const project = projects.find((p) => p.id === task.projectId);
            const prioInfo = priorityLabels[task.priority];

            return (
              <div
                key={task.id}
                className={`relative overflow-hidden p-4 rounded-xl border backdrop-blur-xl transition-all duration-200 text-xs flex flex-col justify-between gap-3 group/task ${
                  task.completed
                    ? 'bg-white/40 border-white/60 opacity-60 shadow-xs'
                    : 'bg-white/75 hover:bg-white/90 border-white/90 hover:border-[#DF9FA8]/40 shadow-[inset_0_1px_1.5px_0_rgba(255,255,255,0.95),0_4px_16px_-2px_rgba(122,96,100,0.06)]'
                }`}
              >
                {/* Liquid Glass Internal Specular Bloom */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-12 -right-12 w-28 h-28 bg-[#DF9FA8]/10 rounded-full blur-xl group-hover/task:bg-[#DF9FA8]/18 transition-all"
                />

                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    {/* Unified Color Priority Pill */}
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-[#DF9FA8]/30 bg-[#DF9FA8]/15 text-[#5E3E43] backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                      {prioInfo.label}
                    </span>

                    {/* Liquid Glass Checkbox Button */}
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 backdrop-blur-md active:scale-90 ${
                        task.completed
                          ? 'bg-[#DF9FA8] text-white shadow-[0_2px_8px_rgba(223,159,168,0.4)]'
                          : 'bg-white/70 hover:bg-white border border-[#DF9FA8]/35 hover:border-[#DF9FA8] text-[#7A6064] hover:text-[#382629] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]'
                      }`}
                      title={task.completed ? 'Mark uncompleted' : 'Mark completed'}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      ) : (
                        <Circle className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <span
                    className={`font-semibold line-clamp-2 leading-snug tracking-tight text-xs ${
                      task.completed ? 'line-through text-[#A78D91]' : 'text-[#382629]'
                    }`}
                  >
                    {task.title}
                  </span>
                </div>

                {/* Metadata Footer: Clean single palette, no date/time property */}
                {(project || task.linkedFileId) && (
                  <div className="relative z-10 flex items-center justify-between pt-2 border-t border-[#DF9FA8]/20 text-[11px] text-[#7A6064]">
                    {project ? (
                      <span className="truncate max-w-[120px] font-medium text-[#7A6064]">
                        {project.title}
                      </span>
                    ) : <span />}

                    {task.linkedFileId && (
                      <button
                        onClick={() => openFile(task.linkedFileId!)}
                        className="px-2 py-0.5 rounded-full bg-white/70 hover:bg-white border border-white/80 hover:border-[#DF9FA8]/35 text-[#382629] text-[10px] font-medium transition-all cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
                      >
                        Spec
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {highPriorityTasks.length === 0 && (
            <div className="col-span-1 md:col-span-3 py-6 text-center border border-dashed border-[#DF9FA8]/30 rounded-xl bg-white/40 backdrop-blur-xl">
              <p className="text-xs text-[#382629] font-medium">All high priority tasks completed</p>
              <button
                onClick={() => setIsAdding(true)}
                className="mt-2 text-xs font-medium text-[#7A6064] hover:text-[#382629] hover:underline cursor-pointer"
              >
                + Add New Task
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Inline Add Action: Simple Link '+ Add New Task' as requested */}
      <div className="mt-4 pt-3 border-t border-[#DF9FA8]/20 relative z-10">
        {isAdding ? (
          <form onSubmit={handleAddTask} className="space-y-2.5">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="What is your immediate focus task?"
              autoFocus
              className="w-full px-3 py-2 text-xs bg-white/80 hover:bg-white focus:bg-white backdrop-blur-xl border border-white/90 focus:border-[#DF9FA8] rounded-xl text-[#382629] placeholder:text-[#A78D91] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] focus:outline-none transition-all"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                  className="bg-white/80 backdrop-blur-xl border border-white/90 focus:border-[#DF9FA8] text-[#382629] text-[11px] rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
                >
                  <option value="p1">P1 Urgent</option>
                  <option value="p2">P2 High</option>
                  <option value="p3">P3 Focus</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 rounded-lg text-[#7A6064] hover:text-[#382629] text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="px-3.5 py-1.5 rounded-lg bg-[#382629] hover:bg-[#4D3539] disabled:opacity-40 disabled:pointer-events-none text-[#FAF5F6] font-medium text-xs shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  Save Task
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Simple link replacement instead of a big button */
          <button
            onClick={() => setIsAdding(true)}
            className="text-xs font-medium text-[#7A6064] hover:text-[#382629] hover:underline cursor-pointer transition-colors inline-flex items-center gap-1"
          >
            + Add New Task
          </button>
        )}
      </div>
    </div>
  );
};
