import React from 'react';
import { useOS } from '../../store/useOSStore';
import { TopTasksWidget } from './widgets/TopTasksWidget';
import { ActiveProjectsWidget } from './widgets/ActiveProjectsWidget';
import { RemindersWidget } from './widgets/RemindersWidget';
import { WidgetSize } from '../../types';

export const DashboardView: React.FC = () => {
  const { widgets, setSettingsModalOpen, setOrganizerModalOpen } = useOS();

  // Filter out daily_horizon completely as requested:
  // "Horizon & System Pulse: Remove it from the dashboard. (This should make room for Active Projects database view.)"
  const sortedWidgets = [...widgets]
    .filter((w) => w.visible && w.id !== 'daily_horizon')
    .sort((a, b) => a.order - b.order);

  const getColSpanClass = (id: string, size: WidgetSize) => {
    if (id === 'top_tasks') return 'col-span-12';
    if (id === 'active_projects') return 'col-span-12 lg:col-span-7 xl:col-span-8';
    if (id === 'reminders') return 'col-span-12 lg:col-span-5 xl:col-span-4';
    switch (size) {
      case 'compact':
        return 'col-span-12 md:col-span-6 lg:col-span-4';
      case 'wide':
        return 'col-span-12 lg:col-span-8';
      case 'full':
        return 'col-span-12';
      default:
        return 'col-span-12 md:col-span-6';
    }
  };

  const renderWidgetContent = (id: string) => {
    switch (id) {
      case 'top_tasks':
        return <TopTasksWidget />;
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
      {/* OS Welcome & Ingestion Banner (No icons, no descriptions under header, no count numbers) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#DF9FA8]/25">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#382629] lowercase font-heading heading-lets-get-it [letter-spacing:-2px]">
            let's get it
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setOrganizerModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-white/70 hover:bg-white border border-white/80 hover:border-[#DF9FA8]/40 text-[#382629] text-xs font-medium transition-all cursor-pointer backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_2px_8px_rgba(122,96,100,0.06)] active:scale-95"
          >
            <span>Brain Inbox</span>
          </button>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-5 items-stretch">
        {sortedWidgets.map((widget) => (
          <div
            key={widget.id}
            className={`${getColSpanClass(widget.id, widget.size)} transition-all duration-200`}
          >
            {renderWidgetContent(widget.id)}
          </div>
        ))}

        {sortedWidgets.length === 0 && (
          <div className="col-span-12 py-16 text-center border border-dashed border-[#DF9FA8]/30 rounded-2xl bg-white/40 backdrop-blur-md">
            <h3 className="text-sm font-semibold text-[#382629] mb-4">All Widgets are Hidden</h3>
            <button
              onClick={() => setSettingsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#382629] hover:bg-[#4D3539] text-[#FAF5F6] rounded-xl text-xs font-medium cursor-pointer shadow-md shadow-[#382629]/20"
            >
              <span>Configure in Settings</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
