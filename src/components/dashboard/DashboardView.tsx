import React from 'react';
import { useOS } from '../../store/useOSStore';
import { TopTasksWidget } from './widgets/TopTasksWidget';
import { ActiveProjectsWidget } from './widgets/ActiveProjectsWidget';
import { RemindersWidget } from './widgets/RemindersWidget';
import { DailyHorizonWidget } from './widgets/DailyHorizonWidget';
import { FolderSync, Settings } from 'lucide-react';
import { WidgetSize } from '../../types';

export const DashboardView: React.FC = () => {
  const { widgets, setSettingsModalOpen, setOrganizerModalOpen, files } = useOS();

  const inboxCount = files.filter(
    (f) => f.type === 'file' && (f.parentId === 'folder-inbox' || f.isInboxCapture)
  ).length;

  const sortedWidgets = [...widgets]
    .filter((w) => w.visible)
    .sort((a, b) => a.order - b.order);

  const getColSpanClass = (size: WidgetSize) => {
    switch (size) {
      case 'compact':
        return 'col-span-12 md:col-span-4 lg:col-span-4';
      case 'normal':
        return 'col-span-12 md:col-span-4 lg:col-span-4';
      case 'wide':
        return 'col-span-12 lg:col-span-8';
      case 'full':
        return 'col-span-12';
      default:
        return 'col-span-12 md:col-span-4';
    }
  };

  const renderWidgetContent = (id: string) => {
    switch (id) {
      case 'top_tasks':
        return <TopTasksWidget />;
      case 'daily_horizon':
        return <DailyHorizonWidget />;
      case 'reminders':
        return <RemindersWidget />;
      case 'active_projects':
        return <ActiveProjectsWidget />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
      {/* OS Welcome & Ingestion Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#CEB7AB]/15">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#FAF4F0] lowercase font-heading heading-lets-get-it [letter-spacing:-2px]">
            let's get it
          </h1>
          <p className="text-xs text-[#A89E97] mt-1">
            Personal operating system with second-brain file management, high-priority triage, and real-time capture.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {inboxCount > 0 && (
            <button
              onClick={() => setOrganizerModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#64504A]/30 hover:bg-[#64504A]/50 border border-[#CEB7AB]/25 text-[#CEB7AB] text-xs font-medium transition-all cursor-pointer backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
            >
              <FolderSync className="w-3.5 h-3.5 text-[#CEB7AB]" />
              <span>Brain Inbox ({inboxCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-5 items-stretch">
        {sortedWidgets.map((widget) => (
          <div
            key={widget.id}
            className={`${getColSpanClass(widget.size)} transition-all duration-200`}
          >
            {renderWidgetContent(widget.id)}
          </div>
        ))}

        {sortedWidgets.length === 0 && (
          <div className="col-span-12 py-16 text-center border border-dashed border-[#CEB7AB]/20 rounded-2xl bg-[#24160E]/30 backdrop-blur-md">
            <h3 className="text-sm font-semibold text-[#FAF4F0] mb-1">All Widgets are Hidden</h3>
            <p className="text-xs text-[#A89E97] mb-4">
              Open Settings from the top bar to enable or rearrange your dashboard modules.
            </p>
            <button
              onClick={() => setSettingsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#CEB7AB] hover:bg-[#DFCCC1] text-[#120B06] rounded-lg text-xs font-semibold cursor-pointer shadow-md shadow-[#CEB7AB]/25"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Configure in Settings</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
