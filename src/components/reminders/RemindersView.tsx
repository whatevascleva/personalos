import React, { useState } from 'react';
import {
  Bell,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
} from 'lucide-react';
import { useOS } from '../../store/useOSStore';

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
    { key: 'critical', label: 'Critical Alerts & Deadlines' },
    { key: 'important', label: 'Important Commitments' },
    { key: 'routine', label: 'Routine Syncs & Follow-ups' },
  ] as const;

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 select-none">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#382629]/10">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#382629]">
            Reminders
          </h1>
          <p className="text-xs text-[#382629]/70 mt-1">
            Operational deadlines, synchronization check-ins, and system notifications.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#DF9FA8] to-[#C97D8B] hover:brightness-105 text-white text-xs font-semibold shadow-md shadow-[#C97D8B]/20 cursor-pointer active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Reminder</span>
        </button>
      </div>

      {/* Add Reminder Form */}
      {isAdding && (
        <form onSubmit={handleCreate} className="p-5 rounded-2xl glass-panel space-y-3 text-xs shadow-xl border border-white/80">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#382629] flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-[#C97D8B]" />
              <span>New Reminder Alert</span>
            </span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-[#382629]/60 hover:text-[#382629] cursor-pointer"
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
            className="w-full px-3 py-2 glass-input rounded-lg text-[#382629] placeholder:text-[#382629]/50"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="text-[10px] text-[#382629]/70 block mb-1">Urgency</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full bg-white/70 border border-[#DF9FA8]/30 rounded-lg p-2 text-[#382629] text-xs focus:outline-none"
              >
                <option value="critical">Critical</option>
                <option value="important">Important</option>
                <option value="routine">Routine</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-[#382629]/70 block mb-1">Due Date & Time</label>
              <input
                type="text"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full glass-input rounded-lg p-2 text-xs text-[#382629]"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#382629]/70 block mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full glass-input rounded-lg p-2 text-xs text-[#382629]"
              />
            </div>
          </div>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Context notes or agenda link (optional)..."
            className="w-full px-3 py-2 glass-input rounded-lg text-xs placeholder:text-[#382629]/50 text-[#382629]"
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-[#382629]/10">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3.5 py-1.5 text-[#382629]/60 hover:text-[#382629] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-gradient-to-r from-[#DF9FA8] to-[#C97D8B] hover:brightness-105 text-white rounded-lg font-semibold cursor-pointer shadow-xs active:scale-95 transition-all"
            >
              Save Reminder
            </button>
          </div>
        </form>
      )}

      {/* Urgency Groups - Single palette, no counter numbers */}
      <div className="space-y-6">
        {urgencyGroups.map(({ key, label }) => {
          const groupReminders = reminders.filter((r) => r.urgency === key);

          return (
            <div key={key} className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#382629]/10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#C97D8B]" />
                  <h2 className="text-xs font-semibold text-[#382629] tracking-wide uppercase">
                    {label}
                  </h2>
                </div>
              </div>

              <div className="rounded-2xl glass-card overflow-hidden shadow-sm border border-white/60">
                {groupReminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className={`p-3.5 hover:bg-[#DF9FA8]/10 transition-colors flex items-start justify-between gap-4 text-xs border-b border-[#382629]/10 last:border-b-0 ${
                      reminder.completed ? 'opacity-40' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <button
                        onClick={() => toggleReminder(reminder.id)}
                        className="mt-0.5 text-[#382629]/40 hover:text-[#C97D8B] cursor-pointer shrink-0 transition-transform active:scale-90"
                      >
                        {reminder.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-[#C97D8B]" />
                        ) : (
                          <Circle className="w-4 h-4 text-[#382629]/40 hover:text-[#382629]" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <span className={`font-medium ${reminder.completed ? 'line-through text-[#382629]/40' : 'text-[#382629]'}`}>
                          {reminder.title}
                        </span>

                        {reminder.notes && (
                          <p className="text-[11px] text-[#382629]/70 mt-1 leading-relaxed">
                            {reminder.notes}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-[#382629]/60 font-mono">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#C97D8B]" />
                            <span>{reminder.dueTime}</span>
                          </div>
                          <span>·</span>
                          <span className="px-2 py-0.2 rounded-full bg-[#DF9FA8]/20 text-[#382629]/80 border border-[#DF9FA8]/30">
                            {reminder.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteReminder(reminder.id)}
                      className="p-1 text-[#382629]/40 hover:text-[#C97D8B] cursor-pointer shrink-0 transition-colors"
                      title="Delete reminder"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {groupReminders.length === 0 && (
                  <div className="py-6 text-center text-xs text-[#382629]/60">
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
