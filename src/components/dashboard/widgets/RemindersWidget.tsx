import React, { useState } from 'react';
import { useOS } from '../../../store/useOSStore';

export const RemindersWidget: React.FC = () => {
  const { reminders, toggleReminder, createReminder, setActiveView } = useOS();
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [urgency, setUrgency] = useState<'critical' | 'important' | 'routine'>('important');

  const pendingReminders = reminders.filter((r) => !r.completed).slice(0, 4);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createReminder({
      title: title.trim(),
      dueTime: 'Pending',
      urgency,
      completed: false,
      category: 'General',
    });

    setTitle('');
    setIsAdding(false);
  };

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col justify-between h-full shadow-[0_8px_32px_rgba(56,38,41,0.06)] border border-white/60">
      {/* Header - No icons, No description */}
      <div>
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#382629]/10">
          <h3 className="font-semibold text-sm tracking-tight text-[#382629]">
            Important Reminders
          </h3>
          <button
            onClick={() => setActiveView('reminders')}
            className="text-xs text-[#C97D8B] hover:text-[#382629] font-medium transition-colors cursor-pointer"
          >
            All Alerts
          </button>
        </div>

        {/* Reminders List - Clean minimal list view, no time & date */}
        <div className="divide-y divide-[#382629]/10">
          {pendingReminders.map((reminder) => {
            return (
              <div
                key={reminder.id}
                className="py-2.5 flex items-center justify-between gap-3 text-xs group hover:bg-[#DF9FA8]/10 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <button
                    onClick={() => toggleReminder(reminder.id)}
                    className="cursor-pointer shrink-0"
                    aria-label={reminder.completed ? 'Mark incomplete' : 'Mark complete'}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border transition-all flex items-center justify-center ${
                        reminder.completed
                          ? 'bg-[#C97D8B] border-[#C97D8B]'
                          : 'border-[#382629]/30 hover:border-[#C97D8B] bg-white/40'
                      }`}
                    >
                      {reminder.completed && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                  </button>

                  <span
                    className={`font-medium truncate ${
                      reminder.completed ? 'line-through text-[#382629]/40' : 'text-[#382629]'
                    }`}
                  >
                    {reminder.title}
                  </span>
                </div>

                {reminder.category && (
                  <span className="text-[10px] font-mono shrink-0 px-2 py-0.5 rounded-full bg-[#DF9FA8]/20 text-[#382629]/80 border border-[#DF9FA8]/30">
                    {reminder.category}
                  </span>
                )}
              </div>
            );
          })}

          {pendingReminders.length === 0 && (
            <div className="py-6 text-center text-xs text-[#382629]/60">
              No pending reminders.
            </div>
          )}
        </div>
      </div>

      {/* Add reminder action */}
      <div className="mt-4 pt-3 border-t border-[#382629]/10">
        {isAdding ? (
          <form onSubmit={handleAdd} className="space-y-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Reminder description..."
              autoFocus
              className="w-full px-3 py-1.5 text-xs bg-white/70 border border-[#DF9FA8]/50 focus:border-[#C97D8B] rounded-lg text-[#382629] placeholder:text-[#382629]/50 focus:outline-none backdrop-blur-md"
            />
            <div className="flex items-center justify-between text-xs">
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="bg-white/70 border border-[#DF9FA8]/50 text-[#382629] text-[11px] rounded px-2 py-1 focus:outline-none"
              >
                <option value="critical">Critical</option>
                <option value="important">Important</option>
                <option value="routine">Routine</option>
              </select>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-2 py-1 text-[#382629]/60 hover:text-[#382629] text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!title.trim()}
                  className="px-3 py-1 bg-gradient-to-r from-[#DF9FA8] to-[#C97D8B] hover:brightness-105 text-white rounded-lg text-[11px] font-medium cursor-pointer shadow-sm"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="text-xs font-medium text-[#C97D8B] hover:text-[#382629] transition-colors cursor-pointer inline-flex items-center"
          >
            + Add New Reminder
          </button>
        )}
      </div>
    </div>
  );
};
