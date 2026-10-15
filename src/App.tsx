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
    'smoky-vanilla': 'os-gradient-smoky-vanilla',
    'warm-horizon': 'os-gradient-warm-horizon',
    'velvet-dusk': 'os-gradient-velvet-dusk',
    'aurora-bronze': 'os-gradient-aurora-bronze',
  }[gradientPreset] || 'os-gradient-smoky-vanilla';

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden font-sans select-none text-[#FAF4F0] ${gradientClass} relative transition-all duration-700`}>
      {/* Decorative ambient blurred glowing orbs for authentic glassmorphism specular highlights */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 w-[36rem] h-[36rem] rounded-full bg-[#64504A]/45 blur-[100px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/4 -right-20 w-[34rem] h-[34rem] rounded-full bg-[#CEB7AB]/30 blur-[110px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 left-1/4 w-[42rem] h-[28rem] rounded-full bg-[#64504A]/35 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/3 w-[28rem] h-[28rem] rounded-full bg-[#7B7985]/25 blur-[120px]"
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
