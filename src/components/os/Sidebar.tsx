import React from 'react';
import {
  LayoutDashboard,
  FolderTree,
  FolderSync,
  Target,
  CheckSquare,
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
  HardDrive,
  Sparkles,
  Plus,
} from 'lucide-react';
import { useOS } from '../../store/useOSStore';
import { AppView } from '../../types';

export const Sidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    sidebarCollapsed,
    setSidebarCollapsed,
    files,
    tasks,
    projects,
    reminders,
    setOrganizerModalOpen,
    setQuickCaptureModalOpen,
  } = useOS();

  const inboxCount = files.filter(
    (f) => f.type === 'file' && (f.parentId === 'folder-inbox' || f.isInboxCapture)
  ).length;

  const p1TasksCount = tasks.filter(
    (t) => !t.completed && (t.priority === 'p1' || t.priority === 'p2' || t.priority === 'p3')
  ).length;

  const pendingReminders = reminders.filter((r) => !r.completed).length;

  const totalFiles = files.filter((f) => f.type === 'file').length;
  const totalFolders = files.filter((f) => f.type === 'folder').length;

  const navItems: {
    id: AppView;
    label: string;
    icon: React.FC<{ className?: string }>;
    badge?: number;
    badgeStyle?: string;
  }[] = [
    {
      id: 'dashboard',
      label: "let's get it",
      icon: LayoutDashboard,
    },
    {
      id: 'files',
      label: 'Second Brain & Files',
      icon: FolderTree,
      badge: inboxCount > 0 ? inboxCount : undefined,
      badgeStyle: 'bg-amber-500/15 text-amber-200 border-amber-400/30',
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: Target,
      badge: projects.length,
      badgeStyle: 'bg-indigo-500/15 text-indigo-200 border-indigo-400/30',
    },
    {
      id: 'tasks',
      label: 'Top Priority Tasks',
      icon: CheckSquare,
      badge: p1TasksCount > 0 ? p1TasksCount : undefined,
      badgeStyle: 'bg-rose-500/15 text-rose-200 border-rose-400/30',
    },
    {
      id: 'reminders',
      label: 'Reminders',
      icon: Bell,
      badge: pendingReminders > 0 ? pendingReminders : undefined,
      badgeStyle: 'bg-sky-500/15 text-sky-200 border-sky-400/30',
    },
  ];

  return (
    <aside
      className={`relative overflow-hidden h-full border-r border-white/20 hover:border-white/30 backdrop-blur-2xl bg-gradient-to-b from-white/[0.12] via-[#1a100a]/70 to-[#0e0704]/85 shadow-[inset_-1px_0_1px_0_rgba(255,255,255,0.2),inset_0_1px_1px_0_rgba(255,255,255,0.3),6px_0_32px_rgba(0,0,0,0.5)] flex flex-col justify-between transition-all duration-300 select-none shrink-0 z-20 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Liquid Glass Specular Highlight Refraction Beam */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-20 w-60 h-60 bg-gradient-to-br from-white/25 via-white/5 to-transparent rounded-full blur-2xl transform -rotate-12"
      />
      {/* Specular Edge Line along Right Border */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-white/40 via-white/15 to-transparent"
      />

      {/* Top Section */}
      <div className="p-3 relative z-10">
        {/* Quick Capture Liquid Glass Button (Above System Modules) */}
        {!sidebarCollapsed ? (
          <div className="mb-3 px-0.5">
            <button
              onClick={() => setQuickCaptureModalOpen(true)}
              className="relative overflow-hidden group/qc w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl backdrop-blur-xl bg-gradient-to-r from-white/[0.18] via-white/[0.10] to-white/[0.16] hover:from-white/[0.26] hover:via-white/[0.16] hover:to-white/[0.24] border border-white/30 hover:border-white/50 text-[#FAF4F0] font-semibold text-xs shadow-[inset_0_1px_1.5px_0_rgba(255,255,255,0.5),inset_0_-1px_1px_0_rgba(0,0,0,0.35),0_8px_20px_rgba(0,0,0,0.35)] hover:shadow-[inset_0_1px_2px_0_rgba(255,255,255,0.65),0_10px_26px_rgba(206,183,171,0.25)] active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              {/* Liquid Shimmer Light Reflection Stripe */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover/qc:translate-x-full transition-transform duration-700 ease-out"
              />
              <div className="flex items-center gap-2 relative z-10">
                <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-white/30 to-[#64504A]/60 border border-white/30 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
                  <Plus className="w-3.5 h-3.5 stroke-[2.5] text-[#FAF4F0]" />
                </div>
                <span className="tracking-wide">Quick Capture</span>
              </div>
              <kbd className="relative z-10 font-mono text-[10px] bg-white/[0.12] text-[#FAF4F0] px-2 py-0.5 rounded-md border border-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] font-bold">
                ⌘J
              </kbd>
            </button>
          </div>
        ) : (
          <div className="mb-3 flex justify-center">
            <button
              onClick={() => setQuickCaptureModalOpen(true)}
              className="w-10 h-10 rounded-xl relative overflow-hidden group/qc backdrop-blur-xl bg-gradient-to-br from-white/[0.22] via-white/[0.12] to-[#64504A]/40 hover:from-white/[0.32] hover:via-white/[0.18] hover:to-[#64504A]/60 border border-white/35 hover:border-white/55 text-[#FAF4F0] flex items-center justify-center shadow-[inset_0_1px_1.5px_0_rgba(255,255,255,0.5),0_6px_18px_rgba(0,0,0,0.35)] active:scale-95 transition-all cursor-pointer"
              title="Quick Capture (⌘J)"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover/qc:translate-x-full transition-transform duration-700 ease-out"
              />
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        )}

        {/* Toggle Collapse Header */}
        <div className="flex items-center justify-between mb-2.5 px-2">
          {!sidebarCollapsed && (
            <span className="text-[11px] font-semibold tracking-wider text-[#CEB7AB]/80 uppercase">
              System Modules
            </span>
          )}
          <button
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            className="p-1.5 rounded-lg text-[#CEB7AB] hover:text-[#FAF4F0] bg-white/[0.04] hover:bg-white/[0.12] border border-white/10 hover:border-white/25 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] transition-all cursor-pointer ml-auto active:scale-95"
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`relative overflow-hidden w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-white/[0.18] via-white/[0.10] to-white/[0.06] text-[#FAF4F0] border border-white/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_4px_16px_rgba(0,0,0,0.3)] backdrop-blur-xl'
                    : 'text-[#A89E97] hover:text-[#FAF4F0] hover:bg-white/[0.08] border border-transparent hover:border-white/15 backdrop-blur-md'
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                {/* Active Indicator Glowing Specular Bar */}
                {isActive && (
                  <div
                    aria-hidden="true"
                    className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-gradient-to-b from-[#FAF4F0] to-[#CEB7AB] shadow-[0_0_8px_rgba(255,255,255,0.6)]"
                  />
                )}

                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-[#FAF4F0]' : 'text-[#CEB7AB]/80 group-hover:text-[#FAF4F0]'
                  }`}
                />
                {!sidebarCollapsed && (
                  <span className="truncate flex-1 text-left tracking-wide">{item.label}</span>
                )}
                {!sidebarCollapsed && item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-mono rounded-full shrink-0 tabular-nums border backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] ${
                      isActive
                        ? 'bg-white/[0.18] text-[#FAF4F0] border-white/35 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)]'
                        : `${item.badgeStyle || 'bg-white/[0.08] text-[#CEB7AB] border-white/20'}`
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Second Brain Ingestion Triage Shortcut */}
        {!sidebarCollapsed && (
          <div className="mt-5 pt-3.5 border-t border-white/[0.12]">
            <div className="flex items-center justify-between text-[11px] text-[#CEB7AB]/80 mb-2 px-1 font-medium">
              <span>Second Brain Hub</span>
              <span className="font-mono text-[10px] text-[#A89E97] tabular-nums">
                {totalFiles} docs
              </span>
            </div>
            <button
              onClick={() => setOrganizerModalOpen(true)}
              className="w-full relative overflow-hidden group/inbox flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-b from-white/[0.10] to-white/[0.04] hover:from-white/[0.16] hover:to-white/[0.08] border border-white/20 hover:border-white/35 backdrop-blur-xl text-[#FAF4F0] text-xs transition-all cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_4px_16px_rgba(0,0,0,0.25)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_6px_20px_rgba(0,0,0,0.35)] active:scale-[0.98]"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover/inbox:translate-x-full transition-transform duration-700 ease-out"
              />
              <div className="flex items-center gap-2 relative z-10">
                <div className="w-5 h-5 rounded-lg bg-white/[0.08] border border-white/20 flex items-center justify-center">
                  <FolderSync className="w-3.5 h-3.5 text-[#CEB7AB] group-hover/inbox:rotate-45 transition-transform" />
                </div>
                <span className="text-left font-medium">Brain Inbox</span>
              </div>
              <span className="relative z-10 font-mono text-[10px] text-[#FAF4F0] bg-white/[0.14] px-2 py-0.5 rounded-full border border-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                {inboxCount} new
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Section: Disk / Memory Status & Palette Reference Badge */}
      <div className="p-3 border-t border-white/[0.14] bg-white/[0.03] backdrop-blur-xl relative z-10">
        {!sidebarCollapsed ? (
          <div className="space-y-3">
            {/* Storage metric liquid glass card */}
            <div className="px-3 py-2.5 rounded-xl bg-gradient-to-b from-white/[0.08] to-white/[0.03] border border-white/15 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.18)] hover:border-white/25 transition-all">
              <div className="flex items-center justify-between text-[11px] text-[#CEB7AB] mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-md bg-white/[0.1] border border-white/20 flex items-center justify-center">
                    <HardDrive className="w-2.5 h-2.5 text-[#FAF4F0]" />
                  </div>
                  <span className="text-[#FAF4F0] font-medium">Local Vault</span>
                </div>
                <span className="font-mono text-[10px] text-[#CEB7AB] tabular-nums">
                  {totalFolders} dirs · {totalFiles} files
                </span>
              </div>
              <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(0,0,0,0.5)]">
                <div
                  className="bg-gradient-to-r from-[#64504A] via-[#CEB7AB] to-[#FAF4F0] h-full rounded-full shadow-[0_0_8px_rgba(206,183,171,0.5)]"
                  style={{ width: `${Math.min(100, Math.max(15, totalFiles * 6))}%` }}
                />
              </div>
            </div>

            {/* Reference Palette Indicator */}
            <div className="flex items-center justify-between px-2 py-0.5 text-xs">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#120B06] border border-white/30 shadow-sm" title="Smoky Black (#120B06)" />
                  <div className="w-3.5 h-3.5 rounded-full bg-[#64504A] border border-white/30 shadow-sm" title="Umber (#64504A)" />
                  <div className="w-3.5 h-3.5 rounded-full bg-[#8A8C8D] border border-white/30 shadow-sm" title="Philippine Gray (#8A8C8D)" />
                  <div className="w-3.5 h-3.5 rounded-full bg-[#CEB7AB] border border-white/30 shadow-sm" title="Dark Vanilla (#CEB7AB)" />
                </div>
                <div className="truncate flex-1">
                  <div className="font-medium text-[#FAF4F0] text-[11px] truncate flex items-center gap-1">
                    <span>Smoky Palette</span>
                    <Sparkles className="w-2.5 h-2.5 text-[#CEB7AB]" />
                  </div>
                  <div className="text-[9px] text-[#CEB7AB]/70 font-mono">Liquid Glass Ready</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-1">
            <button
              onClick={() => setOrganizerModalOpen(true)}
              className="p-2 rounded-xl text-[#FAF4F0] bg-white/[0.06] hover:bg-white/[0.14] border border-white/15 hover:border-white/30 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] transition-all cursor-pointer active:scale-95"
              title={`Brain Inbox (${inboxCount})`}
            >
              <FolderSync className="w-4 h-4 text-[#CEB7AB]" />
            </button>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-white/20 via-white/10 to-[#64504A]/40 border border-white/30 flex items-center justify-center text-xs text-[#FAF4F0] font-bold shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
              Æ
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
