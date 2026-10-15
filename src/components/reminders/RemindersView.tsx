import React, { useState } from 'react';
import {
  Bell,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useOS } from '../../store/useOSStore';
import { ReminderItem } from '../../types';

export const RemindersView: React.FC = () => {
  const { reminders, createReminder, toggleReminder, deleteReminder } = useOS();

  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [dueTime, setDueTime] = useState('Today, 18:00');
  const [urgency, setUrgency] = useState<'critical' | 'important' | 'routine'>('important');
  const [category, setCategory] = useState('Operations');
  const [notes, setNotes] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createReminder({
      title: title.trim(),
      dueTime,
      urgency,
      category,
      notes: notes.trim(),
      completed: false,
    });

    setTitle('');
    setNotes('');
    setIsAdding(false);
  };

  const urgencyGroups = [
    { key: 'critical', label: 'Critical Alerts & Hard Deadlines', icon: AlertTriangle, color: 'text-rose-400' },
    { key: 'important', label: 'Important Commitments', icon: Bell, color: 'text-[#CEB7AB]' },
    { key: 'routine', label: 'Routine Syncs & Follow-ups', icon: Info, color: 'text-[#A89E97]' },
  ] as const;

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 select-none">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#CEB7AB]/15">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#FAF4F0] flex items-center gap-2">
            <span>Reminders & Time Horizon</span>
          </h1>
          <p className="text-xs text-[#A89E97] mt-1">
            Keep track of operational deadlines, synchronization meetings, and system backups.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#CEB7AB] hover:bg-[#DFCCC1] text-[#120B06] text-xs font-semibold shadow-md shadow-[#CEB7AB]/20 cursor-pointer active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Reminder</span>
        </button>
      </div>

      {/* Add Reminder Form */}
      {isAdding && (
        <form onSubmit={handleCreate} className="p-5 rounded-2xl glass-panel space-y-3 text-xs shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#FAF4F0] flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-[#CEB7AB]" />
              <span>New Reminder Alert</span>
            </span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-[#A89E97] hover:text-[#FAF4F0] cursor-pointer"
            >
              Cancel
            </button>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs attention?..."
            autoFocus
            className="w-full px-3 py-2 glass-input rounded-lg text-[#FAF4F0] placeholder:text-[#8A8C8D]"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="text-[10px] text-[#A89E97] block mb-1">Urgency</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full bg-[#120B06] border border-[#CEB7AB]/20 rounded-lg p-2 text-[#FAF4F0] text-xs focus:outline-none"
              >
                <option value="critical">Critical</option>
                <option value="important">Important</option>
                <option value="routine">Routine</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-[#A89E97] block mb-1">Due Date & Time</label>
              <input
                type="text"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full glass-input rounded-lg p-2 text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#A89E97] block mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full glass-input rounded-lg p-2 text-xs"
              />
            </div>
          </div>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Context notes or agenda link (optional)..."
            className="w-full px-3 py-2 glass-input rounded-lg text-xs placeholder:text-[#8A8C8D]"
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-[#CEB7AB]/10">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3.5 py-1.5 text-[#A89E97] hover:text-[#FAF4F0] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#CEB7AB] hover:bg-[#DFCCC1] text-[#120B06] rounded-lg font-semibold cursor-pointer shadow-xs active:scale-95 transition-all"
            >
              Save Reminder
            </button>
          </div>
        </form>
      )}

      {/* Urgency Groups */}
      <div className="space-y-6">
        {urgencyGroups.map(({ key, label, icon: Icon, color }) => {
          const groupReminders = reminders.filter((r) => r.urgency === key);

          return (
            <div key={key} className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#CEB7AB]/15">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <h2 className="text-xs font-semibold text-[#FAF4F0] tracking-wide uppercase">
                    {label}
                  </h2>
                </div>
                <span className="font-mono text-xs text-[#CEB7AB] tabular-nums bg-[#120B06]/60 px-2 py-0.5 rounded-full border border-[#CEB7AB]/15">
                  {groupReminders.filter((r) => !r.completed).length} Pending
                </span>
              </div>

              <div className="rounded-2xl glass-card overflow-hidden shadow-sm">
                {groupReminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className={`p-3.5 hover:bg-[#64504A]/25 transition-colors flex items-start justify-between gap-4 text-xs border-b border-[#CEB7AB]/10 last:border-b-0 ${
                      reminder.completed ? 'opacity-40' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <button
                        onClick={() => toggleReminder(reminder.id)}
                        className="mt-0.5 text-[#8A8C8D] hover:text-emerald-400 cursor-pointer shrink-0 transition-transform active:scale-90"
                      >
                        {reminder.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Circle className="w-4 h-4 text-[#8A8C8D] hover:text-[#FAF4F0]" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <span className={`font-medium ${reminder.completed ? 'line-through text-[#8A8C8D]' : 'text-[#FAF4F0]'}`}>
                          {reminder.title}
                        </span>

                        {reminder.notes && (
                          <p className="text-[11px] text-[#DFCCC1] mt-1 leading-relaxed opacity-85">
                            {reminder.notes}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-[#A89E97] font-mono tabular-nums">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#8A8C8D]" />
                            <span>{reminder.dueTime}</span>
                          </div>
                          <span aria-hidden="true" className="text-[#64504A]">·</span>
                          <span>{reminder.category}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteReminder(reminder.id)}
                      className="p-1 text-[#8A8C8D] hover:text-rose-400 cursor-pointer shrink-0 transition-colors"
                      title="Delete reminder"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {groupReminders.length === 0 && (
                  <div className="py-6 text-center text-xs text-[#8A8C8D]">
                    No reminders in this tier
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
