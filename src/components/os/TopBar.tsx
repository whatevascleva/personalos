import React, { useState, useEffect } from 'react';
import {
  Search,
  Settings,
  Calendar,
  Palette,
} from 'lucide-react';
import { useOS } from '../../store/useOSStore';
import { GradientPreset } from '../../types';

export const TopBar: React.FC = () => {
  const {
    activeView,
    setCommandPaletteOpen,
    setSettingsModalOpen,
    gradientPreset,
    setGradientPreset,
    addToast,
  } = useOS();

  const [time, setTime] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
      setDateStr(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const viewTitles: Record<string, string> = {
    dashboard: "let's get it",
    files: 'Second Brain & File Vault',
    projects: 'Projects',
    tasks: 'High-Priority Tasks Matrix',
    reminders: 'Reminders & Time Horizon',
  };

  const PRESET_CYCLE: GradientPreset[] = ['smoky-vanilla', 'warm-horizon', 'velvet-dusk', 'aurora-bronze'];
  const PRESET_NAMES: Record<GradientPreset, string> = {
    'smoky-vanilla': 'Smoky Vanilla Glow',
    'warm-horizon': 'Warm Horizon',
    'velvet-dusk': 'Velvet Dusk',
    'aurora-bronze': 'Aurora Bronze',
  };

  const handleCycleGradient = () => {
    const currentIndex = PRESET_CYCLE.indexOf(gradientPreset);
    const nextIndex = (currentIndex + 1) % PRESET_CYCLE.length;
    const nextPreset = PRESET_CYCLE[nextIndex];
    setGradientPreset(nextPreset);
    addToast('Gradient Updated', `Switched to ${PRESET_NAMES[nextPreset]}`, 'info');
  };

  return (
    <header className="h-14 border-b border-[#CEB7AB]/15 px-5 flex items-center justify-between gap-8 shrink-0 select-none backdrop-blur-xl bg-[#160E0A]/60 z-30 shadow-[0_4px_20px_-4px_rgba(18,11,6,0.6)] font-heading">
      {/* Zone 1: Wordmark and View Breadcrumb */}
      <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#64504A] via-[#8A8C8D] to-[#CEB7AB] flex items-center justify-center shadow-sm shadow-[#CEB7AB]/20 border border-white/20">
            <span className="font-bold text-xs text-[#120B06] tracking-wider">Æ</span>
          </div>
          <span className="font-semibold text-sm tracking-tight text-[#FAF4F0] font-heading">AetherOS</span>
        </div>
        <span className="text-[#8A8C8D]/60 text-xs" aria-hidden="true">/</span>
        <span className={`text-xs font-medium text-[#CEB7AB] font-heading ${activeView === 'dashboard' ? 'lowercase [letter-spacing:-1px]' : ''}`}>
          {viewTitles[activeView]}
        </span>
      </div>

      {/* Zone 2: Real-time Clock, Calendar & Command Bar Trigger */}
      <div className="hidden md:flex items-center gap-4 text-xs">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[#24160E]/50 border border-[#CEB7AB]/15 hover:border-[#CEB7AB]/40 text-[#8A8C8D] hover:text-[#FAF4F0] backdrop-blur-md transition-all text-xs group cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
        >
          <Search className="w-3.5 h-3.5 text-[#8A8C8D] group-hover:text-[#CEB7AB] transition-colors" />
          <span>Search or jump to...</span>
          <kbd className="font-mono text-[10px] bg-[#120B06]/80 text-[#CEB7AB] px-1.5 py-0.5 rounded border border-[#CEB7AB]/15">
            ⌘K
          </kbd>
        </button>

        <div className="flex items-center gap-2 text-[#8A8C8D] font-mono text-xs tabular-nums border-l border-[#CEB7AB]/15 pl-4">
          <Calendar className="w-3.5 h-3.5 text-[#CEB7AB]/70" />
          <span className="text-[#A89E97]">{dateStr}</span>
          <span className="text-[#64504A]">·</span>
          <span className="text-[#FAF4F0] font-medium">{time}</span>
        </div>
      </div>

      {/* Zone 3: Quick Gradient & Settings Actions (Far Right) */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleCycleGradient}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-[#CEB7AB] hover:text-[#FAF4F0] bg-[#24160E]/50 hover:bg-[#64504A]/40 border border-[#CEB7AB]/15 hover:border-[#CEB7AB]/40 transition-all cursor-pointer backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] group"
          title={`Cycle Background Gradient (Current: ${PRESET_NAMES[gradientPreset]})`}
        >
          <Palette className="w-3.5 h-3.5 text-[#CEB7AB] group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline text-[11px] font-medium">Gradient</span>
          <span className="w-2 h-2 rounded-full bg-gradient-to-tr from-[#64504A] to-[#CEB7AB] inline-block shadow-xs" />
        </button>

        <button
          onClick={() => setSettingsModalOpen(true)}
          className="p-2 rounded-lg text-[#CEB7AB] hover:text-[#FAF4F0] bg-[#24160E]/50 hover:bg-[#64504A]/40 border border-[#CEB7AB]/15 hover:border-[#CEB7AB]/40 transition-all cursor-pointer backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
          title="Settings & Customization"
        >
          <Settings className="w-4 h-4 text-[#CEB7AB] hover:rotate-45 transition-transform" />
        </button>
      </div>
    </header>
  );
};
