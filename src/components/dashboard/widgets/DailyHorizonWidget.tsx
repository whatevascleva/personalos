import React from 'react';
import {
  Compass,
  CheckCircle2,
  FolderSync,
} from 'lucide-react';
import { useOS } from '../../../store/useOSStore';

export const DailyHorizonWidget: React.FC = () => {
  const { tasks, files, setOrganizerModalOpen } = useOS();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const taskPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const inboxNotes = files.filter(
    (f) => f.type === 'file' && (f.parentId === 'folder-inbox' || f.isInboxCapture)
  );

  const totalFiles = files.filter((f) => f.type === 'file').length;

  return (
    <div className="relative overflow-hidden rounded-2xl p-5 flex flex-col justify-between h-full backdrop-blur-2xl bg-gradient-to-b from-white/[0.14] via-[#24160E]/45 to-[#120B06]/70 border border-white/20 hover:border-white/35 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.3),inset_0_-1px_1px_0_rgba(0,0,0,0.35),0_16px_40px_-8px_rgba(18,11,6,0.65)] hover:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.4),0_20px_48px_-8px_rgba(18,11,6,0.75)] transition-all duration-300 group">
      {/* Specular glass highlight reflection beam */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 w-64 h-48 bg-gradient-to-br from-white/25 via-white/5 to-transparent rounded-full blur-2xl transform -rotate-12"
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-white/25 to-[#64504A]/50 border border-white/30 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)]">
              <Compass className="w-4 h-4 text-[#FAF4F0]" />
            </div>
            <h3 className="font-semibold text-[#FAF4F0]">
              Horizon & System Pulse
            </h3>
          </div>
          <span className="font-mono text-xs text-[#FAF4F0] font-medium bg-white/[0.1] backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
            Nominal
          </span>
        </div>

        {/* Daily Focus Prompt */}
        <div className="p-3.5 rounded-xl bg-white/[0.05] backdrop-blur-md border border-white/[0.14] mb-3 text-xs shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.14)]">
          <div className="text-[11px] text-[#CEB7AB] mb-1 font-medium">Daily Operating Principle</div>
          <p className="text-[#FAF4F0] italic leading-relaxed">
            "Eliminate passive capture without review. Every note saved to the inbox must either become an initiative or be filed into an area."
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-white/[0.05] backdrop-blur-md border border-white/[0.14] hover:bg-white/[0.09] transition-colors shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.12)]">
            <div className="flex items-center justify-between text-[#CEB7AB] mb-1.5">
              <span className="text-[11px] font-medium">Tasks Closed</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#CEB7AB]" />
            </div>
            <div className="font-mono text-base font-semibold text-[#FAF4F0] tabular-nums">
              {completedTasks}/{totalTasks}
              <span className="text-xs font-normal text-[#CEB7AB]/80 ml-1.5">({taskPercent}%)</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.05] backdrop-blur-md border border-white/[0.14] hover:bg-white/[0.09] transition-colors shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.12)]">
            <div className="flex items-center justify-between text-[#CEB7AB] mb-1.5">
              <span className="text-[11px] font-medium">Inbox Awaiting</span>
              <FolderSync className="w-3.5 h-3.5 text-[#CEB7AB]" />
            </div>
            <div className="font-mono text-base font-semibold text-[#FAF4F0] tabular-nums">
              {inboxNotes.length}
              <span className="text-xs font-normal text-[#CEB7AB]/80 ml-1.5">captures</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3.5 pt-3 border-t border-white/[0.14] flex items-center justify-between text-xs relative z-10">
        <span className="text-[#CEB7AB] font-mono text-[11px]">Second Brain Vault · {totalFiles} Total Files</span>
        <button
          onClick={() => setOrganizerModalOpen(true)}
          className="text-[#FAF4F0] hover:text-[#CEB7AB] text-xs font-medium cursor-pointer transition-colors"
        >
          Brain Inbox →
        </button>
      </div>
    </div>
  );
};
