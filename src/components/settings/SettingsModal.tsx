import React, { useState } from 'react';
import {
  X,
  Settings,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Sliders,
  Moon,
  Laptop,
  Sun,
  HardDrive,
  Trash2,
  Check,
  Palette,
  LayoutGrid,
  Sparkles,
} from 'lucide-react';
import { useOS } from '../../store/useOSStore';
import { WidgetConfig, WidgetSize, OSTheme, GradientPreset } from '../../types';

export const SettingsModal: React.FC = () => {
  const {
    settingsModalOpen,
    setSettingsModalOpen,
    widgets,
    updateWidgetConfig,
    reorderWidgets,
    resetWidgetsToDefault,
    theme,
    setTheme,
    gradientPreset,
    setGradientPreset,
    files,
    resetAllSystemData,
  } = useOS();

  const [activeTab, setActiveTab] = useState<'widgets' | 'appearance' | 'vault'>('widgets');

  if (!settingsModalOpen) return null;

  const sortedWidgets = [...widgets].sort((a, b) => a.order - b.order);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...sortedWidgets];
    const temp = newItems[index];
    newItems[index] = newItems[index - 1];
    newItems[index - 1] = temp;
    reorderWidgets(newItems.map((w) => w.id));
  };

  const moveDown = (index: number) => {
    if (index === sortedWidgets.length - 1) return;
    const newItems = [...sortedWidgets];
    const temp = newItems[index];
    newItems[index] = newItems[index + 1];
    newItems[index + 1] = temp;
    reorderWidgets(newItems.map((w) => w.id));
  };

  const toggleVisibility = (id: string, current: boolean) => {
    updateWidgetConfig(id, { visible: !current });
  };

  const setSize = (id: string, size: WidgetSize) => {
    updateWidgetConfig(id, { size });
  };

  const totalFiles = files.filter((f) => f.type === 'file').length;
  const totalFolders = files.filter((f) => f.type === 'folder').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-2xl glass-panel rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#CEB7AB]/15 flex items-center justify-between bg-[#120B06]/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#64504A]/30 border border-[#CEB7AB]/25 flex items-center justify-center">
              <Settings className="w-4 h-4 text-[#CEB7AB]" />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-[#FAF4F0]">
                System Settings & Customization
              </h2>
              <p className="text-xs text-[#A89E97]">
                Centralized workspace controls for dashboard layout, appearance, and vault preferences.
              </p>
            </div>
          </div>

          <button
            onClick={() => setSettingsModalOpen(false)}
            className="p-1.5 rounded-lg text-[#8A8C8D] hover:text-[#FAF4F0] hover:bg-[#64504A]/30 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="px-6 py-2.5 border-b border-[#CEB7AB]/10 bg-[#120B06]/60 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('widgets')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'widgets'
                ? 'bg-[#CEB7AB] text-[#120B06] font-semibold'
                : 'text-[#A89E97] hover:text-[#FAF4F0]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Dashboard Widgets</span>
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'appearance'
                ? 'bg-[#CEB7AB] text-[#120B06] font-semibold'
                : 'text-[#A89E97] hover:text-[#FAF4F0]'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Color Palette & Glassmorphism</span>
          </button>

          <button
            onClick={() => setActiveTab('vault')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'vault'
                ? 'bg-[#CEB7AB] text-[#120B06] font-semibold'
                : 'text-[#A89E97] hover:text-[#FAF4F0]'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Vault & System</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: DASHBOARD WIDGETS */}
          {activeTab === 'widgets' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h3 className="text-xs font-semibold text-[#FAF4F0]">Main Dashboard Modules</h3>
                  <p className="text-[11px] text-[#A89E97]">
                    Arrange widgets, adjust grid widths, or hide modules.
                  </p>
                </div>
                <button
                  onClick={resetWidgetsToDefault}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#A89E97] hover:text-[#FAF4F0] border border-[#CEB7AB]/15 hover:border-[#CEB7AB]/40 rounded-lg transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Layout</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {sortedWidgets.map((widget, index) => (
                  <div
                    key={widget.id}
                    className={`p-3.5 rounded-2xl border transition-all text-xs flex items-center justify-between gap-4 ${
                      widget.visible
                        ? 'glass-card'
                        : 'bg-[#120B06]/30 border-[#CEB7AB]/10 opacity-50'
                    }`}
                  >
                    {/* Order Controls & Title */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex flex-col gap-0.5 shrink-0">
                        <button
                          disabled={index === 0}
                          onClick={() => moveUp(index)}
                          className="p-1 rounded text-[#8A8C8D] hover:text-[#FAF4F0] disabled:opacity-20 hover:bg-[#64504A]/30 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={index === sortedWidgets.length - 1}
                          onClick={() => moveDown(index)}
                          className="p-1 rounded text-[#8A8C8D] hover:text-[#FAF4F0] disabled:opacity-20 hover:bg-[#64504A]/30 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#FAF4F0]">{widget.title}</span>
                          <span className="text-[10px] font-mono text-[#CEB7AB]">#{index + 1}</span>
                        </div>
                        <p className="text-[11px] text-[#A89E97] truncate">{widget.description}</p>
                      </div>
                    </div>

                    {/* Sizing & Visibility Controls */}
                    <div className="flex items-center gap-3 shrink-0">
                      {/* Size Selector */}
                      <div className="flex items-center bg-[#120B06] border border-[#CEB7AB]/15 rounded-lg p-0.5 text-[11px]">
                        {(['compact', 'normal', 'wide', 'full'] as WidgetSize[]).map((size) => (
                          <button
                            key={size}
                            onClick={() => setSize(widget.id, size)}
                            className={`px-2 py-1 rounded capitalize transition-colors cursor-pointer ${
                              widget.size === size
                                ? 'bg-[#CEB7AB] text-[#120B06] font-semibold shadow-xs'
                                : 'text-[#8A8C8D] hover:text-[#FAF4F0]'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>

                      {/* Visibility Toggle */}
                      <button
                        onClick={() => toggleVisibility(widget.id, widget.visible)}
                        className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                          widget.visible
                            ? 'bg-[#64504A]/40 border-[#CEB7AB]/30 text-[#CEB7AB] hover:bg-[#64504A]/60'
                            : 'bg-[#120B06]/80 border-[#CEB7AB]/10 text-[#8A8C8D] hover:text-[#FAF4F0]'
                        }`}
                        title={widget.visible ? 'Hide from dashboard' : 'Show on dashboard'}
                      >
                        {widget.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: APPEARANCE & THEMES */}
          {activeTab === 'appearance' && (
            <div className="space-y-5 text-xs">
              {/* Reference Palette Active Showcase */}
              <div className="p-4 rounded-2xl glass-card border border-[#CEB7AB]/25 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#CEB7AB]" />
                    <h3 className="font-bold text-[#FAF4F0]">
                      Active Reference Color Palette
                    </h3>
                  </div>
                  <span className="font-mono text-[10px] text-[#CEB7AB] bg-[#64504A]/30 px-2 py-0.5 rounded-full border border-[#CEB7AB]/20">
                    Uploaded Image Active
                  </span>
                </div>
                <p className="text-[#A89E97] text-[11px] leading-relaxed">
                  Extracted directly from your reference image. Applied with an atmospheric ambient gradient, frosted glassmorphism cards and widgets, and warm high-contrast text:
                </p>

                {/* Swatches Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
                  <div className="p-2.5 rounded-xl bg-[#120B06] border border-white/10 text-center">
                    <div className="w-full h-8 rounded-lg bg-[#120B06] mb-2 border border-white/20 shadow-xs" />
                    <div className="font-semibold text-[11px] text-[#FAF4F0]">Smoky Black</div>
                    <div className="font-mono text-[10px] text-[#A89E97]">#120B06</div>
                    <div className="text-[9px] text-[#8A8C8D] mt-0.5">Deep Canvas</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#120B06]/80 border border-white/10 text-center">
                    <div className="w-full h-8 rounded-lg bg-[#64504A] mb-2 border border-white/20 shadow-xs" />
                    <div className="font-semibold text-[11px] text-[#FAF4F0]">Umber</div>
                    <div className="font-mono text-[10px] text-[#A89E97]">#64504A</div>
                    <div className="text-[9px] text-[#8A8C8D] mt-0.5">Warm Bronze</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#120B06]/80 border border-white/10 text-center">
                    <div className="w-full h-8 rounded-lg bg-[#8A8C8D] mb-2 border border-white/20 shadow-xs" />
                    <div className="font-semibold text-[11px] text-[#FAF4F0]">Philippine Gray</div>
                    <div className="font-mono text-[10px] text-[#A89E97]">#8A8C8D</div>
                    <div className="text-[9px] text-[#8A8C8D] mt-0.5">Muted Accents</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#120B06]/80 border border-white/10 text-center">
                    <div className="w-full h-8 rounded-lg bg-[#CEB7AB] mb-2 border border-white/20 shadow-xs" />
                    <div className="font-semibold text-[11px] text-[#FAF4F0]">Dark Vanilla</div>
                    <div className="font-mono text-[10px] text-[#A89E97]">#CEB7AB</div>
                    <div className="text-[9px] text-[#8A8C8D] mt-0.5">Primary Accent</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#120B06]/80 border border-white/10 text-center">
                    <div className="w-full h-8 rounded-lg bg-[#7B7985] mb-2 border border-white/20 shadow-xs" />
                    <div className="font-semibold text-[11px] text-[#FAF4F0]">Palette Gray</div>
                    <div className="font-mono text-[10px] text-[#A89E97]">#7B7985</div>
                    <div className="text-[9px] text-[#8A8C8D] mt-0.5">Neutral Tone</div>
                  </div>
                </div>

                {/* Glassmorphism Specs Preview */}
                <div className="p-3 rounded-xl bg-[#120B06]/60 border border-[#CEB7AB]/15 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-[#FAF4F0]">Glassmorphism Engine</div>
                    <div className="text-[11px] text-[#A89E97]">
                      Backdrop blur 16–20px · Inset specular light · 1px Dark Vanilla border highlight
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Active
                  </span>
                </div>
              </div>

              {/* Background Gradient Presets Selector */}
              <div className="p-4 rounded-2xl glass-card border border-[#CEB7AB]/25 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-[#CEB7AB]" />
                    <h3 className="font-bold text-[#FAF4F0]">
                      Background Gradient Styles
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-[#CEB7AB]">
                    Reference Palette
                  </span>
                </div>
                <p className="text-[#A89E97] text-[11px] leading-relaxed">
                  Choose your preferred gradient mood. All styles are crafted using the Umber, Dark Vanilla, and Smoky Black reference tones:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {[
                    {
                      id: 'smoky-vanilla' as GradientPreset,
                      label: 'Smoky Vanilla Glow',
                      description: 'Deep Smoky Black canvas with radiant Umber bronze & luminous Dark Vanilla.',
                      previewClass: 'os-gradient-smoky-vanilla',
                      isDefault: true,
                    },
                    {
                      id: 'warm-horizon' as GradientPreset,
                      label: 'Warm Horizon',
                      description: 'Top-down warm champagne sunburst into deep earthy Bronze & espresso.',
                      previewClass: 'os-gradient-warm-horizon',
                    },
                    {
                      id: 'velvet-dusk' as GradientPreset,
                      label: 'Velvet Dusk',
                      description: 'Moody Philippine Gray & mauve undertones flowing into deep Umber.',
                      previewClass: 'os-gradient-velvet-dusk',
                    },
                    {
                      id: 'aurora-bronze' as GradientPreset,
                      label: 'Aurora Bronze',
                      description: 'High-contrast diagonal flow with golden vanilla and glowing umber blooms.',
                      previewClass: 'os-gradient-aurora-bronze',
                    },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setGradientPreset(opt.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                        gradientPreset === opt.id
                          ? 'border-[#CEB7AB] ring-2 ring-[#CEB7AB]/40 bg-[#1A1009]/80 shadow-lg'
                          : 'border-[#CEB7AB]/15 hover:border-[#CEB7AB]/40 bg-[#120B06]/60 hover:bg-[#1A1009]/60'
                      }`}
                    >
                      {/* Gradient preview swatch */}
                      <div
                        className={`h-12 w-full rounded-lg mb-2.5 border border-white/20 shadow-inner ${opt.previewClass}`}
                      />
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-xs text-[#FAF4F0] flex items-center gap-1.5">
                          <span>{opt.label}</span>
                          {opt.isDefault && (
                            <span className="text-[9px] font-mono text-[#120B06] bg-[#CEB7AB] px-1.5 py-0.2 rounded font-bold">
                              DEFAULT
                            </span>
                          )}
                        </div>
                        {gradientPreset === opt.id && (
                          <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            <Check className="w-3 h-3 stroke-[2.5]" />
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#A89E97] mt-1 leading-snug">{opt.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VAULT & SYSTEM */}
          {activeTab === 'vault' && (
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="font-semibold text-[#FAF4F0] mb-1">Second Brain Vault Status</h3>
                <p className="text-[#A89E97] text-[11px]">
                  Local storage allocation and system database management.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl glass-card">
                  <div className="text-[#A89E97] text-[11px] mb-1">Total Vault Documents</div>
                  <div className="text-lg font-bold text-[#FAF4F0] font-mono tabular-nums">
                    {totalFiles} files
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl glass-card">
                  <div className="text-[#A89E97] text-[11px] mb-1">Vault Directories</div>
                  <div className="text-lg font-bold text-[#FAF4F0] font-mono tabular-nums">
                    {totalFolders} folders
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#CEB7AB]/10 space-y-2">
                <div className="font-semibold text-rose-400 text-xs">Danger Zone</div>
                <p className="text-[11px] text-[#A89E97]">
                  Reset the entire operating system, returning all notes, tasks, projects, and reminders to default factory state.
                </p>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to reset all operating system data to defaults?')) {
                      resetAllSystemData();
                      setSettingsModalOpen(false);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset All Workspace Data to Defaults</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#CEB7AB]/15 bg-[#120B06]/80 flex items-center justify-between">
          <span className="text-xs text-[#A89E97]">Preferences update and persist automatically</span>
          <button
            onClick={() => setSettingsModalOpen(false)}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#CEB7AB] hover:bg-[#DFCCC1] text-[#120B06] text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-md shadow-[#CEB7AB]/20 active:scale-95"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
