import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  FileText,
  CheckSquare,
  Target,
  Settings,
  FolderSync,
  Plus,
  Moon,
  Laptop,
  Sun,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useOS } from '../../store/useOSStore';

export const CommandPalette: React.FC = () => {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    files,
    tasks,
    projects,
    setActiveView,
    openFile,
    setQuickCaptureModalOpen,
    setSettingsModalOpen,
    setOrganizerModalOpen,
    setTheme,
  } = useOS();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  // Build searchable items
  interface PaletteItem {
    id: string;
    title: string;
    category: 'Action' | 'File' | 'Task' | 'Project' | 'Navigation';
    icon: React.FC<{ className?: string }>;
    run: () => void;
    detail?: string;
  }

  const actions: PaletteItem[] = [
    {
      id: 'act-capture',
      title: 'Quick Capture Note to Second Brain',
      category: 'Action',
      icon: Plus,
      run: () => setQuickCaptureModalOpen(true),
      detail: 'Save thought directly into 00_Inbox',
    },
    {
      id: 'act-triage',
      title: 'Open Brain Inbox',
      category: 'Action',
      icon: FolderSync,
      run: () => setOrganizerModalOpen(true),
      detail: 'File captured notes into PARA directories',
    },
    {
      id: 'act-settings',
      title: 'Open Settings & Customization',
      category: 'Action',
      icon: Settings,
      run: () => setSettingsModalOpen(true),
      detail: 'Configure dashboard widgets, appearance, and vault',
    },
    {
      id: 'nav-dash',
      title: "Jump to LET'S GET IT",
      category: 'Navigation',
      icon: ArrowRight,
      run: () => setActiveView('dashboard'),
    },
    {
      id: 'nav-files',
      title: 'Jump to Second Brain & Files',
      category: 'Navigation',
      icon: ArrowRight,
      run: () => setActiveView('files'),
    },
    {
      id: 'nav-tasks',
      title: 'Jump to Priority Tasks',
      category: 'Navigation',
      icon: ArrowRight,
      run: () => setActiveView('tasks'),
    },
    {
      id: 'nav-projects',
      title: 'Jump to Active Initiatives',
      category: 'Navigation',
      icon: ArrowRight,
      run: () => setActiveView('projects'),
    },
    {
      id: 'nav-reminders',
      title: 'Jump to Reminders',
      category: 'Navigation',
      icon: ArrowRight,
      run: () => setActiveView('reminders'),
    },
    {
      id: 'theme-palette',
      title: 'Active Theme: Smoky Vanilla Reference',
      category: 'Action',
      icon: Sparkles,
      run: () => setTheme('slate'),
    },
  ];

  // Files items
  const fileItems: PaletteItem[] = files
    .filter((f) => f.type === 'file')
    .map((f) => ({
      id: `file-${f.id}`,
      title: f.name,
      category: 'File',
      icon: FileText,
      run: () => openFile(f.id),
      detail: f.content ? f.content.slice(0, 50).replace(/[#*`\n]/g, ' ') : 'Document',
    }));

  // Tasks items
  const taskItems: PaletteItem[] = tasks.map((t) => ({
    id: `task-${t.id}`,
    title: t.title,
    category: 'Task',
    icon: CheckSquare,
    run: () => setActiveView('tasks'),
    detail: `${t.priority.toUpperCase()} · ${t.dueDate}`,
  }));

  // Projects items
  const projectItems: PaletteItem[] = projects.map((p) => ({
    id: `proj-${p.id}`,
    title: p.title,
    category: 'Project',
    icon: Target,
    run: () => setActiveView('projects'),
    detail: `${p.progress}% progress · ${p.category}`,
  }));

  const allItems = [...actions, ...fileItems, ...taskItems, ...projectItems];

  const filteredItems = query.trim()
    ? allItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          (item.detail && item.detail.toLowerCase().includes(query.toLowerCase())) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      )
    : allItems.slice(0, 8);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].run();
        setCommandPaletteOpen(false);
      }
    } else if (e.key === 'Escape') {
      setCommandPaletteOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-xl glass-panel rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#F59E0B]/15 flex items-center gap-3 bg-[#070B14]/80">
          <Search className="w-4 h-4 text-[#F59E0B] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, search documents, tasks, or initiatives..."
            className="w-full bg-transparent text-sm text-[#FAF4F0] placeholder:text-[#8A8C8D] focus:outline-none"
          />
          <kbd className="font-mono text-[10px] text-[#F59E0B] bg-[#070B14] px-1.5 py-0.5 rounded border border-[#F59E0B]/20">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="p-2 max-h-[360px] overflow-y-auto space-y-1">
          {filteredItems.map((item, index) => {
            const Icon = item.icon;
            const isSelected = index === selectedIndex;

            return (
              <div
                key={item.id}
                onMouseEnter={() => setSelectedIndex(index)}
                onClick={() => {
                  item.run();
                  setCommandPaletteOpen(false);
                }}
                className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors text-xs ${
                  isSelected
                    ? 'bg-[#F59E0B] text-[#070B14] shadow-md font-semibold'
                    : 'text-[#FBBF24] hover:bg-[#EA580C]/25'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isSelected ? 'text-[#070B14]' : 'text-[#F59E0B]'
                    }`}
                  />
                  <div className="truncate">
                    <div className="truncate">{item.title}</div>
                    {item.detail && (
                      <div
                        className={`text-[10px] truncate ${
                          isSelected ? 'text-[#070B14]/75' : 'text-[#8A8C8D]'
                        }`}
                      >
                        {item.detail}
                      </div>
                    )}
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                    isSelected
                      ? 'bg-[#070B14]/20 text-[#070B14] font-bold'
                      : 'bg-[#070B14] text-[#A89E97] border border-[#F59E0B]/10'
                  }`}
                >
                  {item.category}
                </span>
              </div>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="py-8 text-center text-xs text-[#8A8C8D]">
              No matching commands or files found
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-[#F59E0B]/10 bg-[#070B14]/60 flex items-center justify-between text-[11px] text-[#A89E97] font-mono">
          <span>Navigate with ↑ ↓ · Press Enter to open</span>
          <span>AetherOS Universal Index</span>
        </div>
      </div>
    </div>
  );
};
