import React, { useState } from 'react';
import {
  X,
  Settings,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  HardDrive,
  Trash2,
  Check,
  Palette,
  LayoutGrid,
  Sparkles,
  Archive,
  Download,
} from 'lucide-react';
import { useOS } from '../../store/useOSStore';
import { WidgetSize, GradientPreset } from '../../types';
import { exportSecondBrainZip, exportFullSystemZip } from '../../utils/exportZip';

export const SettingsModal: React.FC = () => {
  const {
    settingsModalOpen,
    setSettingsModalOpen,
    widgets,
    updateWidgetConfig,
    reorderWidgets,
    resetWidgetsToDefault,
    gradientPreset,
    setGradientPreset,
    resetAllSystemData,
    files,
    projects,
    tasks,
    reminders,
    addToast,
  } = useOS();

  const [activeTab, setActiveTab] = useState<'widgets' | 'appearance' | 'vault'>('widgets');
  const [isExportingNotes, setIsExportingNotes] = useState(false);
  const [isExportingFull, setIsExportingFull] = useState(false);

  const handleExportNotesZip = async () => {
    try {
      setIsExportingNotes(true);
      const name = await exportSecondBrainZip(files);
      addToast('Notes downloaded as ZIP', name, 'success');
    } catch (e) {
      addToast('Export error', 'Could not create notes ZIP', 'alert');
    } finally {
      setIsExportingNotes(false);
    }
  };

  const handleExportFullZip = async () => {
    try {
      setIsExportingFull(true);
      const name = await exportFullSystemZip({ files, projects, tasks, reminders });
      addToast('Full backup downloaded as ZIP', name, 'success');
    } catch (e) {
      addToast('Export error', 'Could not create backup ZIP', 'alert');
    } finally {
      setIsExportingFull(false);
    }
  };

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-2xl glass-panel rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] border border-white/80 bg-white/85">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#382629]/10 flex items-center justify-between bg-white/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#DF9FA8]/30 border border-[#DF9FA8]/40 flex items-center justify-center">
              <Settings className="w-4 h-4 text-[#C97D8B]" />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-[#382629]">
                System Settings & Customization
              </h2>
              <p className="text-xs text-[#382629]/70">
                Workspace controls for dashboard layout, appearance, and vault preferences.
              </p>
            </div>
          </div>

          <button
            onClick={() => setSettingsModalOpen(false)}
            className="p-1.5 rounded-lg text-[#382629]/60 hover:text-[#382629] hover:bg-[#DF9FA8]/20 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="px-6 py-2.5 border-b border-[#382629]/10 bg-white/40 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('widgets')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'widgets'
                ? 'bg-[#C97D8B] text-white font-semibold shadow-xs'
                : 'text-[#382629]/70 hover:text-[#382629]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Dashboard Widgets</span>
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'appearance'
                ? 'bg-[#C97D8B] text-white font-semibold shadow-xs'
                : 'text-[#382629]/70 hover:text-[#382629]'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Color Palette & Glassmorphism</span>
          </button>

          <button
            onClick={() => setActiveTab('vault')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'vault'
                ? 'bg-[#C97D8B] text-white font-semibold shadow-xs'
                : 'text-[#382629]/70 hover:text-[#382629]'
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
                  <h3 className="text-xs font-semibold text-[#382629]">Main Dashboard Modules</h3>
                  <p className="text-[11px] text-[#382629]/70">
                    Arrange widgets, adjust grid widths, or hide modules.
                  </p>
                </div>
                <button
                  onClick={resetWidgetsToDefault}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#382629]/70 hover:text-[#382629] border border-[#DF9FA8]/30 hover:border-[#C97D8B] rounded-lg transition-colors cursor-pointer bg-white/60"
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
                        ? 'bg-white/70 border-white/80 shadow-sm'
                        : 'bg-white/30 border-[#DF9FA8]/20 opacity-50'
                    }`}
                  >
                    {/* Order Controls & Title */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex flex-col gap-0.5 shrink-0">
                        <button
                          disabled={index === 0}
                          onClick={() => moveUp(index)}
                          className="p-1 rounded text-[#382629]/60 hover:text-[#382629] disabled:opacity-20 hover:bg-[#DF9FA8]/20 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={index === sortedWidgets.length - 1}
                          onClick={() => moveDown(index)}
                          className="p-1 rounded text-[#382629]/60 hover:text-[#382629] disabled:opacity-20 hover:bg-[#DF9FA8]/20 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#382629]">{widget.title}</span>
                        </div>
                        <p className="text-[11px] text-[#382629]/70 truncate">{widget.description}</p>
                      </div>
                    </div>

                    {/* Sizing & Visibility Controls */}
                    <div className="flex items-center gap-3 shrink-0">
                      {/* Size Selector */}
                      <div className="flex items-center bg-white/80 border border-[#DF9FA8]/30 rounded-lg p-0.5 text-[11px]">
                        {(['compact', 'normal', 'wide', 'full'] as WidgetSize[]).map((size) => (
                          <button
                            key={size}
                            onClick={() => setSize(widget.id, size)}
                            className={`px-2 py-1 rounded capitalize transition-colors cursor-pointer ${
                              widget.size === size
                                ? 'bg-[#C97D8B] text-white font-semibold shadow-xs'
                                : 'text-[#382629]/70 hover:text-[#382629]'
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
                            ? 'bg-[#DF9FA8]/30 border-[#DF9FA8]/50 text-[#C97D8B] hover:bg-[#DF9FA8]/50'
                            : 'bg-white/50 border-[#DF9FA8]/20 text-[#382629]/40 hover:text-[#382629]'
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
              <div className="p-4 rounded-2xl glass-card border border-[#DF9FA8]/30 space-y-3 bg-white/70">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#C97D8B]" />
                    <h3 className="font-bold text-[#382629]">
                      Active Reference Color Palette
                    </h3>
                  </div>
                  <span className="font-mono text-[10px] text-[#382629] bg-[#DF9FA8]/25 px-2.5 py-0.5 rounded-full border border-[#DF9FA8]/30">
                    Rose Quartz & Silk Chiffon
                  </span>
                </div>
                <p className="text-[#382629]/70 text-[11px] leading-relaxed">
                  Extracted directly from the floral silk chiffon and blossom reference photography. Featuring soft rose quartz, petal blush organza, porcelain white, and delicate champagne accents:
                </p>

                {/* Swatches Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  <div className="p-2.5 rounded-xl bg-white/80 border border-[#DF9FA8]/30 text-center">
                    <div className="w-full h-8 rounded-lg bg-[#FAF6F6] mb-2 border border-[#DF9FA8]/30 shadow-xs" />
                    <div className="font-semibold text-[11px] text-[#382629]">Porcelain White</div>
                    <div className="font-mono text-[10px] text-[#382629]/70">#FAF6F6</div>
                    <div className="text-[9px] text-[#382629]/50 mt-0.5">Base Canvas</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/80 border border-[#DF9FA8]/30 text-center">
                    <div className="w-full h-8 rounded-lg bg-[#DF9FA8] mb-2 border border-[#DF9FA8]/40 shadow-xs" />
                    <div className="font-semibold text-[11px] text-[#382629]">Petal Blush</div>
                    <div className="font-mono text-[10px] text-[#382629]/70">#DF9FA8</div>
                    <div className="text-[9px] text-[#C97D8B] mt-0.5">Blossom Accent</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/80 border border-[#DF9FA8]/30 text-center">
                    <div className="w-full h-8 rounded-lg bg-[#382629] mb-2 border border-[#382629]/30 shadow-xs" />
                    <div className="font-semibold text-[11px] text-[#382629]">Deep Rosewood</div>
                    <div className="font-mono text-[10px] text-[#382629]/70">#382629</div>
                    <div className="text-[9px] text-[#382629]/70 mt-0.5">High-Contrast Text</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/80 border border-[#DF9FA8]/30 text-center">
                    <div className="w-full h-8 rounded-lg bg-[#D4AA8C] mb-2 border border-[#D4AA8C]/30 shadow-xs" />
                    <div className="font-semibold text-[11px] text-[#382629]">Champagne Silk</div>
                    <div className="font-mono text-[10px] text-[#382629]/70">#D4AA8C</div>
                    <div className="text-[9px] text-[#D4AA8C] mt-0.5">Warm Tone</div>
                  </div>
                </div>

                {/* Glassmorphism Specs Preview */}
                <div className="p-3 rounded-xl bg-white/60 border border-[#DF9FA8]/20 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-[#382629]">Liquid Glassmorphism Engine</div>
                    <div className="text-[11px] text-[#382629]/70">
                      Backdrop blur 16–24px · Inset porcelain specular highlight · Soft rose border edge
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-[#C97D8B] bg-[#DF9FA8]/20 px-2 py-0.5 rounded border border-[#DF9FA8]/30">
                    Active
                  </span>
                </div>
              </div>

              {/* Background Gradient Presets Selector */}
              <div className="p-4 rounded-2xl glass-card border border-[#DF9FA8]/30 space-y-3 bg-white/70">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-[#C97D8B]" />
                    <h3 className="font-bold text-[#382629]">
                      Background Styles
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-[#C97D8B]">
                    Rose Quartz & Silk
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {[
                    {
                      id: 'la-night-grid' as GradientPreset,
                      label: 'Rose Quartz Silk',
                      description: 'Soft petal blush silk with subtle translucent organza layering.',
                      previewClass: 'bg-gradient-to-br from-[#FAF6F6] via-[#F4E8EA] to-[#EBD5D9]',
                      isDefault: true,
                    },
                    {
                      id: 'sunset-arterial' as GradientPreset,
                      label: 'Petal Chiffon',
                      description: 'Warm luminous champagne tones blending seamlessly into delicate blossom rose.',
                      previewClass: 'bg-gradient-to-br from-[#FDFBF7] via-[#F7ECE8] to-[#EED6CD]',
                    },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setGradientPreset(opt.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                        gradientPreset === opt.id || (opt.id === 'la-night-grid' && (gradientPreset as string) === 'smoky-vanilla')
                          ? 'border-[#C97D8B] ring-2 ring-[#DF9FA8]/40 bg-white/90 shadow-md'
                          : 'border-[#DF9FA8]/30 hover:border-[#DF9FA8]/60 bg-white/60 hover:bg-white/80'
                      }`}
                    >
                      <div
                        className={`h-12 w-full rounded-lg mb-2.5 border border-white/60 shadow-inner ${opt.previewClass}`}
                      />
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-xs text-[#382629] flex items-center gap-1.5">
                          <span>{opt.label}</span>
                          {opt.isDefault && (
                            <span className="text-[9px] font-mono text-white bg-[#C97D8B] px-1.5 py-0.2 rounded font-bold">
                              DEFAULT
                            </span>
                          )}
                        </div>
                        {(gradientPreset === opt.id || (opt.id === 'la-night-grid' && (gradientPreset as string) === 'smoky-vanilla')) && (
                          <span className="flex items-center gap-1 text-[10px] font-mono text-[#C97D8B] bg-[#DF9FA8]/20 px-2 py-0.5 rounded border border-[#DF9FA8]/30">
                            <Check className="w-3 h-3 stroke-[2.5]" />
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#382629]/70 mt-1 leading-snug">{opt.description}</p>
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
                <h3 className="font-semibold text-[#382629] mb-1">Second Brain Vault Status</h3>
                <p className="text-[#382629]/70 text-[11px]">
                  Local storage allocation and system database management.
                </p>
              </div>

              {/* Backup & ZIP Export */}
              <div className="p-4 rounded-xl bg-white/70 border border-[#DF9FA8]/30 space-y-3 shadow-xs">
                <div className="flex items-center gap-2">
                  <Archive className="w-4 h-4 text-[#C97D8B]" />
                  <h4 className="font-bold text-xs text-[#382629]">Backup & Export in ZIP</h4>
                </div>
                <p className="text-[11px] text-[#382629]/70">
                  Save all notes with their original folder tree, or create a full system snapshot with projects, tasks, and reminders inside a compressed ZIP archive.
                </p>
                <div className="flex items-center gap-2.5 flex-wrap pt-1">
                  <button
                    onClick={handleExportNotesZip}
                    disabled={isExportingNotes}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 hover:bg-white text-[#382629] hover:text-[#C97D8B] border border-[#DF9FA8]/40 rounded-lg text-xs font-medium transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5 text-[#C97D8B]" />
                    <span>{isExportingNotes ? 'Creating ZIP...' : 'Export Notes (.zip)'}</span>
                  </button>

                  <button
                    onClick={handleExportFullZip}
                    disabled={isExportingFull}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#DF9FA8] to-[#C97D8B] text-white hover:brightness-105 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-md shadow-[#C97D8B]/20 active:scale-95 disabled:opacity-50"
                  >
                    <Archive className="w-3.5 h-3.5 text-white" />
                    <span>{isExportingFull ? 'Packaging Full Workspace...' : 'Export Full Workspace (.zip)'}</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-[#382629]/10 space-y-2">
                <div className="font-semibold text-rose-500 text-xs">Danger Zone</div>
                <p className="text-[11px] text-[#382629]/70">
                  Reset the entire operating system, returning all notes, tasks, projects, and reminders to default state.
                </p>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to reset all operating system data to defaults?')) {
                      resetAllSystemData();
                      setSettingsModalOpen(false);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/30 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset All Workspace Data to Defaults</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#382629]/10 bg-white/60 flex items-center justify-between">
          <span className="text-xs text-[#382629]/60">Preferences update and persist automatically</span>
          <button
            onClick={() => setSettingsModalOpen(false)}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-[#DF9FA8] to-[#C97D8B] hover:brightness-105 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-md shadow-[#C97D8B]/20 active:scale-95"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
