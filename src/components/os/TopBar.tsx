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

  const PRESET_CYCLE: GradientPreset[] = ['la-night-grid', 'sunset-arterial', 'twilight-basin', 'downtown-gold'];
  const PRESET_NAMES: Record<GradientPreset, string> = {
    'la-night-grid': 'Rose Quartz Silk',
    'sunset-arterial': 'Petal Chiffon',
    'twilight-basin': 'Dusty Blossom',
    'downtown-gold': 'Champagne Silk',
    'smoky-vanilla': 'Rose Quartz Silk',
    'warm-horizon': 'Petal Chiffon',
    'velvet-dusk': 'Dusty Blossom',
    'aurora-bronze': 'Champagne Silk',
  };

  const handleCycleGradient = () => {
    const currentIndex = PRESET_CYCLE.indexOf(gradientPreset as any);
    const nextIndex = (currentIndex + 1) % PRESET_CYCLE.length;
    const nextPreset = PRESET_CYCLE[nextIndex];
    setGradientPreset(nextPreset);
    addToast('Gradient Updated', `Switched to ${PRESET_NAMES[nextPreset]}`, 'info');
  };

  return (
    <header className="h-14 border-b border-white/80 px-5 flex items-center justify-between gap-8 shrink-0 select-none backdrop-blur-xl bg-white/70 z-30 shadow-[0_2px_16px_rgba(122,96,100,0.06)] font-heading">
      {/* Zone 1: Wordmark and View Breadcrumb */}
      <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#DF9FA8] via-[#ECD0D4] to-[#D4AA8C] flex items-center justify-center shadow-xs border border-white">
            <span className="font-bold text-xs text-[#382629] tracking-wider">Æ</span>
          </div>
          <span className="font-semibold text-sm tracking-tight text-[#382629] font-heading">AetherOS</span>
        </div>
        <span className="text-[#A78D91]/60 text-xs" aria-hidden="true">/</span>
        <span className={`text-xs font-medium text-[#382629] font-heading ${activeView === 'dashboard' ? 'lowercase [letter-spacing:-1px]' : ''}`}>
          {viewTitles[activeView]}
        </span>
      </div>

      {/* Zone 2: Real-time Clock, Calendar & Command Bar Trigger */}
      <div className="hidden md:flex items-center gap-4 text-xs">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-white/70 border border-white/90 hover:border-[#DF9FA8]/40 text-[#7A6064] hover:text-[#382629] backdrop-blur-md transition-all text-xs group cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
        >
          <Search className="w-3.5 h-3.5 text-[#A78D91] group-hover:text-[#382629] transition-colors" />
          <span>Search or jump to...</span>
          <kbd className="font-mono text-[10px] bg-[#DF9FA8]/15 text-[#382629] px-1.5 py-0.5 rounded border border-[#DF9FA8]/25 font-bold">
            ⌘K
          </kbd>
        </button>

        <div className="flex items-center gap-2 text-[#7A6064] font-mono text-xs tabular-nums border-l border-[#DF9FA8]/25 pl-4">
          <Calendar className="w-3.5 h-3.5 text-[#DF9FA8]" />
          <span className="text-[#7A6064]">{dateStr}</span>
          <span className="text-[#DF9FA8]">·</span>
          <span className="text-[#382629] font-medium">{time}</span>
        </div>
      </div>

      {/* Zone 3: Quick Gradient & Settings Actions (Far Right) */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleCycleGradient}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-[#382629] hover:text-[#382629] bg-white/60 hover:bg-white/90 border border-white/80 hover:border-[#DF9FA8]/40 transition-all cursor-pointer backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] group"
          title={`Cycle Background Gradient (Current: ${PRESET_NAMES[gradientPreset] || 'Rose Quartz Silk'})`}
        >
          <Palette className="w-3.5 h-3.5 text-[#DF9FA8] group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline text-[11px] font-medium">Theme</span>
          <span className="w-2 h-2 rounded-full bg-gradient-to-tr from-[#DF9FA8] to-[#D4AA8C] inline-block shadow-xs" />
        </button>

        <button
          onClick={() => setSettingsModalOpen(true)}
          className="p-2 rounded-lg text-[#382629] hover:text-[#382629] bg-white/60 hover:bg-white/90 border border-white/80 hover:border-[#DF9FA8]/40 transition-all cursor-pointer backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
          title="Settings & Customization"
        >
          <Settings className="w-4 h-4 text-[#7A6064] hover:text-[#382629] hover:rotate-45 transition-transform" />
        </button>
      </div>
    </header>
  );
};
