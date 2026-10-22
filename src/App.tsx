/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { OSProvider, useOS } from './store/useOSStore';
import { TopBar } from './components/os/TopBar';
import { Sidebar } from './components/os/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { FileManagerView } from './components/files/FileManagerView';
import { ProjectsView } from './components/projects/ProjectsView';
import { TasksView } from './components/tasks/TasksView';
import { RemindersView } from './components/reminders/RemindersView';
import { CommandPalette } from './components/os/CommandPalette';
import { QuickCaptureModal } from './components/os/QuickCaptureModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { ToastContainer } from './components/os/Toast';
import { FileEditorModal } from './components/files/FileEditorModal';
import { SecondBrainOrganizerModal } from './components/files/SecondBrainOrganizerModal';
import { VaultDocumentsModal } from './components/files/VaultDocumentsModal';

const OSContent: React.FC = () => {
  const { activeView, gradientPreset } = useOS();

  const gradientClass = {
    'la-night-grid': 'os-gradient-la-night-grid',
    'sunset-arterial': 'os-gradient-sunset-arterial',
    'twilight-basin': 'os-gradient-twilight-basin',
    'downtown-gold': 'os-gradient-downtown-gold',
    'smoky-vanilla': 'os-gradient-smoky-vanilla',
    'warm-horizon': 'os-gradient-warm-horizon',
    'velvet-dusk': 'os-gradient-velvet-dusk',
    'aurora-bronze': 'os-gradient-aurora-bronze',
  }[gradientPreset] || 'os-gradient-la-night-grid';

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden font-sans select-none text-[#382629] ${gradientClass} relative transition-all duration-700`}>
      {/* Decorative ambient blurred glowing orbs inspired by delicate rose quartz and silk petals */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 w-[38rem] h-[38rem] rounded-full bg-[#DF9FA8]/22 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/4 -right-20 w-[36rem] h-[36rem] rounded-full bg-[#ECD0D4]/35 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 left-1/4 w-[44rem] h-[30rem] rounded-full bg-[#D4AA8C]/16 blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/3 w-[30rem] h-[30rem] rounded-full bg-white/45 blur-[120px]"
      />

      {/* Top Header Bar */}
      <TopBar />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Left Side Navigation Bar */}
        <Sidebar />

        {/* Viewport Canvas with direct gradient visibility and glassmorphism refraction */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {activeView === 'dashboard' && <DashboardView />}
          {activeView === 'files' && <FileManagerView />}
          {activeView === 'projects' && <ProjectsView />}
          {activeView === 'tasks' && <TasksView />}
          {activeView === 'reminders' && <RemindersView />}
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <CommandPalette />
      <QuickCaptureModal />
      <SettingsModal />
      <FileEditorModal />
      <SecondBrainOrganizerModal />
      <VaultDocumentsModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <OSProvider>
      <OSContent />
    </OSProvider>
  );
}
