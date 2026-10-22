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
    setOrganizerModalOpen,
    setQuickCaptureModalOpen,
  } = useOS();

  const navItems: {
    id: AppView;
    label: string;
    icon: React.FC<{ className?: string }>;
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
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: Target,
    },
    {
      id: 'tasks',
      label: 'Top Priority Tasks',
      icon: CheckSquare,
    },
    {
      id: 'reminders',
      label: 'Reminders',
      icon: Bell,
    },
  ];

  return (
    <aside
      className={`relative overflow-hidden h-full border-r border-white/80 backdrop-blur-2xl bg-white/[0.68] shadow-[inset_0_1px_1.5px_0_rgba(255,255,255,0.95),4px_0_24px_rgba(122,96,100,0.06)] flex flex-col justify-between transition-all duration-300 select-none shrink-0 z-20 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Liquid Glass Specular Highlight Refraction Beam */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-20 w-60 h-60 bg-gradient-to-br from-white/60 via-white/20 to-transparent rounded-full blur-2xl transform -rotate-12"
      />
      {/* Specular Edge Line along Right Border */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-white/90 via-white/40 to-transparent"
      />

      {/* Top Section */}
      <div className="p-3 relative z-10">
        {/* Quick Capture Liquid Glass Button (Above System Modules) */}
        {!sidebarCollapsed ? (
          <div className="mb-3 px-0.5">
            <button
              onClick={() => setQuickCaptureModalOpen(true)}
              className="relative overflow-hidden group/qc w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl backdrop-blur-xl bg-white/80 hover:bg-white border border-white/90 hover:border-[#DF9FA8]/40 text-[#382629] font-medium text-xs shadow-[inset_0_1px_1.5px_0_rgba(255,255,255,1),0_4px_16px_rgba(122,96,100,0.08)] hover:shadow-[inset_0_1px_2px_0_rgba(255,255,255,1),0_6px_20px_rgba(223,159,168,0.2)] active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              {/* Liquid Shimmer Light Reflection Stripe */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover/qc:translate-x-full transition-transform duration-700 ease-out"
              />
              <div className="flex items-center gap-2 relative z-10">
                <div className="w-5 h-5 rounded-lg bg-[#DF9FA8]/20 border border-[#DF9FA8]/30 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
                  <Plus className="w-3.5 h-3.5 stroke-[2.5] text-[#382629]" />
                </div>
                <span className="tracking-wide">Quick Capture</span>
              </div>
              <kbd className="relative z-10 font-mono text-[10px] bg-[#DF9FA8]/15 text-[#382629] px-2 py-0.5 rounded-md border border-[#DF9FA8]/25 font-bold">
                ⌘J
              </kbd>
            </button>
          </div>
        ) : (
          <div className="mb-3 flex justify-center">
            <button
              onClick={() => setQuickCaptureModalOpen(true)}
              className="w-10 h-10 rounded-xl relative overflow-hidden group/qc backdrop-blur-xl bg-white/80 hover:bg-white border border-white/90 hover:border-[#DF9FA8]/40 text-[#382629] flex items-center justify-center shadow-[inset_0_1px_1.5px_0_rgba(255,255,255,1),0_4px_14px_rgba(122,96,100,0.08)] active:scale-95 transition-all cursor-pointer"
              title="Quick Capture (⌘J)"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover/qc:translate-x-full transition-transform duration-700 ease-out"
              />
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        )}

        {/* Toggle Collapse Header */}
        <div className="flex items-center justify-between mb-2.5 px-2">
          {!sidebarCollapsed && (
            <span className="text-[11px] font-semibold tracking-wider text-[#7A6064] uppercase">
              System Modules
            </span>
          )}
          <button
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            className="p-1.5 rounded-lg text-[#7A6064] hover:text-[#382629] bg-white/40 hover:bg-white/80 border border-white/60 hover:border-[#DF9FA8]/30 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition-all cursor-pointer ml-auto active:scale-95"
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation list without colored number buttons */}
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
                    ? 'bg-[#DF9FA8]/20 text-[#382629] border border-[#DF9FA8]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_8px_rgba(223,159,168,0.15)] backdrop-blur-xl'
                    : 'text-[#7A6064] hover:text-[#382629] hover:bg-white/60 border border-transparent hover:border-white/80 backdrop-blur-md'
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                {/* Active Indicator Glowing Specular Bar */}
                {isActive && (
                  <div
                    aria-hidden="true"
                    className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#DF9FA8] shadow-[0_0_8px_rgba(223,159,168,0.8)]"
                  />
                )}

                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-[#382629]' : 'text-[#7A6064] group-hover:text-[#382629]'
                  }`}
                />
                {!sidebarCollapsed && (
                  <span className="truncate flex-1 text-left tracking-wide">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Second Brain Ingestion Triage Shortcut (Clean, No Numbers) */}
        {!sidebarCollapsed && (
          <div className="mt-5 pt-3.5 border-t border-[#DF9FA8]/20">
            <div className="text-[11px] text-[#7A6064] mb-2 px-1 font-medium">
              <span>Second Brain Hub</span>
            </div>
            <button
              onClick={() => setOrganizerModalOpen(true)}
              className="w-full relative overflow-hidden group/inbox flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-white/60 hover:bg-white/90 border border-white/80 hover:border-[#DF9FA8]/35 backdrop-blur-xl text-[#382629] text-xs transition-all cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_2px_8px_rgba(122,96,100,0.05)] active:scale-[0.98]"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/inbox:translate-x-full transition-transform duration-700 ease-out"
              />
              <div className="flex items-center gap-2 relative z-10">
                <div className="w-5 h-5 rounded-lg bg-[#DF9FA8]/15 border border-[#DF9FA8]/25 flex items-center justify-center">
                  <FolderSync className="w-3.5 h-3.5 text-[#382629] group-hover/inbox:rotate-45 transition-transform" />
                </div>
                <span className="text-left font-medium">Brain Inbox</span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Section: Clean Local Vault Status & Reference Badge */}
      <div className="p-3 border-t border-white/80 bg-white/40 backdrop-blur-xl relative z-10">
        {!sidebarCollapsed ? (
          <div className="space-y-3">
            {/* Storage metric liquid glass card (without numbers) */}
            <div className="px-3 py-2.5 rounded-xl bg-white/60 border border-white/80 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] hover:border-[#DF9FA8]/30 transition-all">
              <div className="flex items-center gap-1.5 text-[11px] text-[#382629] mb-2 font-medium">
                <div className="w-4 h-4 rounded-md bg-[#DF9FA8]/20 border border-[#DF9FA8]/30 flex items-center justify-center">
                  <HardDrive className="w-2.5 h-2.5 text-[#382629]" />
                </div>
                <span>Local Vault Storage</span>
              </div>
              <div className="w-full bg-[#ECD0D4]/40 h-1.5 rounded-full overflow-hidden border border-white/80 shadow-[inset_0_1px_1px_rgba(122,96,100,0.06)]">
                <div
                  className="bg-gradient-to-r from-[#DF9FA8] to-[#D4AA8C] h-full rounded-full shadow-[0_0_6px_rgba(223,159,168,0.5)]"
                  style={{ width: '42%' }}
                />
              </div>
            </div>

            {/* Reference Palette Indicator */}
            <div className="flex items-center justify-between px-2 py-0.5 text-xs">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#FAF6F6] border border-[#DF9FA8]/40 shadow-xs" title="Porcelain Silk" />
                  <div className="w-3.5 h-3.5 rounded-full bg-[#ECD0D4] border border-[#DF9FA8]/40 shadow-xs" title="Soft Rose" />
                  <div className="w-3.5 h-3.5 rounded-full bg-[#DF9FA8] border border-[#DF9FA8]/40 shadow-xs" title="Petal Blush" />
                  <div className="w-3.5 h-3.5 rounded-full bg-[#D4AA8C] border border-[#DF9FA8]/40 shadow-xs" title="Champagne Gold" />
                </div>
                <div className="truncate flex-1">
                  <div className="font-medium text-[#382629] text-[11px] truncate flex items-center gap-1">
                    <span>Rose & Silk</span>
                    <Sparkles className="w-2.5 h-2.5 text-[#DF9FA8]" />
                  </div>
                  <div className="text-[9px] text-[#7A6064] font-mono">Modern Liquid Glass</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-1">
            <button
              onClick={() => setOrganizerModalOpen(true)}
              className="p-2 rounded-xl text-[#382629] bg-white/60 hover:bg-white border border-white/80 hover:border-[#DF9FA8]/30 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] transition-all cursor-pointer active:scale-95"
              title="Brain Inbox"
            >
              <FolderSync className="w-4 h-4 text-[#382629]" />
            </button>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-white to-[#ECD0D4] border border-white flex items-center justify-center text-xs text-[#382629] font-bold shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
              Æ
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
