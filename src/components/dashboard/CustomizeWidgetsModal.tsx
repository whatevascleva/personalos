import React from 'react';
import {
  X,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Sliders,
  Check,
} from 'lucide-react';
import { useOS } from '../../store/useOSStore';
import { WidgetConfig, WidgetSize } from '../../types';

export const CustomizeWidgetsModal: React.FC = () => {
  const {
    customizeWidgetsModalOpen,
    setCustomizeWidgetsModalOpen,
    widgets,
    updateWidgetConfig,
    reorderWidgets,
    resetWidgetsToDefault,
  } = useOS();

  if (!customizeWidgetsModalOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <Sliders className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-slate-100">
                Customize Dashboard Layout
              </h2>
              <p className="text-xs text-slate-400">
                Reorder widgets, adjust span widths, or hide modules to tailor your workspace.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetWidgetsToDefault}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 border border-white/[0.06] hover:border-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Reset to default arrangement"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              onClick={() => setCustomizeWidgetsModalOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: Widgets List */}
        <div className="p-6 overflow-y-auto space-y-3">
          {sortedWidgets.map((widget, index) => (
            <div
              key={widget.id}
              className={`p-3.5 rounded-xl border transition-all text-xs flex items-center justify-between gap-4 ${
                widget.visible
                  ? 'bg-slate-950/60 border-white/[0.08]'
                  : 'bg-slate-950/20 border-white/[0.03] opacity-60'
              }`}
            >
              {/* Order Controls & Title */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    disabled={index === 0}
                    onClick={() => moveUp(index)}
                    className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 hover:bg-slate-800 cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={index === sortedWidgets.length - 1}
                    onClick={() => moveDown(index)}
                    className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 hover:bg-slate-800 cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">{widget.title}</span>
                    <span className="text-[10px] font-mono text-slate-500">#{index + 1}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{widget.description}</p>
                </div>
              </div>

              {/* Sizing & Visibility Controls */}
              <div className="flex items-center gap-3 shrink-0">
                {/* Size Selector */}
                <div className="flex items-center bg-slate-900 border border-white/[0.08] rounded-lg p-0.5 text-[11px]">
                  {(['compact', 'normal', 'wide', 'full'] as WidgetSize[]).map((size) => (
                    <button
                      key={size}
                      onClick={() => setSize(widget.id, size)}
                      className={`px-2 py-1 rounded capitalize transition-colors cursor-pointer ${
                        widget.size === size
                          ? 'bg-indigo-600 text-white font-medium shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
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
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                      : 'bg-slate-800/80 border-white/[0.06] text-slate-500 hover:text-slate-300'
                  }`}
                  title={widget.visible ? 'Hide from dashboard' : 'Show on dashboard'}
                >
                  {widget.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-white/[0.08] bg-slate-950/40 flex items-center justify-between">
          <span className="text-xs text-slate-400">Changes are automatically saved to local OS state</span>
          <button
            onClick={() => setCustomizeWidgetsModalOpen(false)}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
