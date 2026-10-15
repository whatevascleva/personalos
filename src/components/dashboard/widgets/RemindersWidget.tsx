import React, { useState } from 'react';
import {
  Bell,
  AlertCircle,
  CheckCircle2,
  Circle,
  Plus,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { useOS } from '../../../store/useOSStore';
import { ReminderItem } from '../../../types';

export const RemindersWidget: React.FC = () => {
  const { reminders, toggleReminder, createReminder, setActiveView } = useOS();
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [dueTime, setDueTime] = useState('Today, 17:00');
  const [urgency, setUrgency] = useState<'critical' | 'important' | 'routine'>('important');

  const pendingReminders = reminders.filter((r) => !r.completed).slice(0, 3);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createReminder({
      title: title.trim(),
      dueTime,
      urgency,
      completed: false,
      category: 'General',
    });

    setTitle('');
    setIsAdding(false);
  };

  const urgencyStyles = {
    critical: {
      dot: 'bg-rose-500',
      label: 'Critical Alert',
      text: 'text-rose-400',
    },
    important: {
      dot: 'bg-amber-500',
      label: 'Important',
      text: 'text-amber-400',
    },
    routine: {
      dot: 'bg-cyan-500',
      label: 'Routine',
      text: 'text-cyan-400',
    },
  };

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col justify-between h-full shadow-[0_8px_32px_rgba(18,11,6,0.4)]">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#64504A]/30 border border-[#CEB7AB]/25 flex items-center justify-center">
              <Bell className="w-4 h-4 text-[#CEB7AB]" />
            </div>
            <h3 className="font-semibold text-[#FAF4F0]">
              Important Reminders
            </h3>
          </div>
          <button
            onClick={() => setActiveView('reminders')}
            className="text-xs text-[#CEB7AB] hover:text-[#FAF4F0] font-medium flex items-center gap-0.5 cursor-pointer"
          >
            <span>All Alerts</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <p className="text-xs text-[#A89E97] mb-3.5">
          Time-sensitive commitments, security reviews, and operational alerts.
        </p>

        {/* Reminders list */}
        <div className="space-y-2">
          {pendingReminders.map((reminder) => {
            const urgencyMeta = urgencyStyles[reminder.urgency];

            return (
              <div
                key={reminder.id}
                className="p-3 rounded-xl bg-[#120B06]/60 border border-[#CEB7AB]/10 hover:border-[#CEB7AB]/30 transition-all text-xs flex items-start gap-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
              >
                <button
                  onClick={() => toggleReminder(reminder.id)}
                  className="mt-0.5 text-[#8A8C8D] hover:text-emerald-400 cursor-pointer shrink-0"
                >
                  {reminder.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Circle className="w-4 h-4 text-[#8A8C8D] hover:text-[#CEB7AB]" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-medium text-[#FAF4F0] truncate">{reminder.title}</span>
                    <span className={`text-[10px] font-mono shrink-0 ${urgencyMeta.text}`}>
                      {urgencyMeta.label}
                    </span>
                  </div>

                  {reminder.notes && (
                    <p className="text-[11px] text-[#A89E97] line-clamp-1 mb-1.5">{reminder.notes}</p>
                  )}

                  <div className="flex items-center gap-2 text-[11px] text-[#8A8C8D] font-mono tabular-nums">
                    <Clock className="w-3 h-3 text-[#CEB7AB]/70" />
                    <span>{reminder.dueTime}</span>
                    <span aria-hidden="true" className="text-[#64504A]">·</span>
                    <span>{reminder.category}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {pendingReminders.length === 0 && (
            <div className="py-6 text-center border border-dashed border-[#CEB7AB]/20 rounded-xl text-xs text-[#8A8C8D]">
              No pending alerts on your horizon.
            </div>
          )}
        </div>
      </div>

      {/* Add reminder action */}
      <div className="mt-3 pt-3 border-t border-white/[0.06]">
        {isAdding ? (
          <form onSubmit={handleAdd} className="space-y-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Reminder description..."
              autoFocus
              className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-cyan-500/50 rounded-md text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as any)}
                  className="bg-slate-950 border border-white/[0.08] text-slate-300 text-[11px] rounded px-2 py-1"
                >
                  <option value="critical">Critical</option>
                  <option value="important">Important</option>
                  <option value="routine">Routine</option>
                </select>
                <input
                  type="text"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  placeholder="Due time"
                  className="w-28 px-2 py-1 text-[11px] bg-slate-950 border border-white/[0.08] rounded text-slate-300"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-2 py-1 text-slate-400 hover:text-slate-200 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!title.trim()}
                  className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[11px] font-medium"
                >
                  Set
                </button>
              </div>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-dashed border-white/[0.08] hover:border-cyan-500/40 text-slate-400 hover:text-slate-200 text-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Reminder</span>
          </button>
        )}
      </div>
    </div>
  );
};
