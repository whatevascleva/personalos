import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AppView,
  OSTheme,
  GradientPreset,
  FileItem,
  ProjectItem,
  TaskItem,
  ReminderItem,
  WidgetConfig,
  OSToast,
  TaskPriority,
} from '../types';
import {
  INITIAL_FILES,
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_REMINDERS,
  INITIAL_WIDGETS,
} from './initialData';

interface OSContextType {
  // Navigation & Shell
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  theme: OSTheme;
  setTheme: (theme: OSTheme) => void;
  gradientPreset: GradientPreset;
  setGradientPreset: (preset: GradientPreset) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;

  // Modals & Panels
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  quickCaptureModalOpen: boolean;
  setQuickCaptureModalOpen: (open: boolean) => void;
  customizeWidgetsModalOpen: boolean;
  setCustomizeWidgetsModalOpen: (open: boolean) => void;
  settingsModalOpen: boolean;
  setSettingsModalOpen: (open: boolean) => void;
  organizerModalOpen: boolean;
  setOrganizerModalOpen: (open: boolean) => void;
  vaultDocumentsModalOpen: boolean;
  setVaultDocumentsModalOpen: (open: boolean) => void;
  activeFileId: string | null;
  openFile: (fileId: string | null) => void;

  // File System
  files: FileItem[];
  createFile: (params: {
    name: string;
    parentId?: string | null;
    content?: string;
    tags?: string[];
    extension?: 'md' | 'txt' | 'json';
  }) => FileItem;
  createFolder: (name: string, parentId?: string | null, tags?: string[]) => FileItem;
  moveFile: (fileId: string, newParentId: string | null) => void;
  updateFile: (fileId: string, updates: Partial<FileItem>) => void;
  deleteFile: (fileId: string) => void;
  togglePinFile: (fileId: string) => void;
  markCaptureDealtWith: (fileId: string, destinationFolderId?: string) => void;
  quickCaptureNote: (params: {
    title: string;
    content: string;
    folderId?: string;
    tags?: string[];
  }) => FileItem;
  handleDropUpload: (files: FileList | File[], parentId?: string | null) => Promise<void>;

  // Projects
  projects: ProjectItem[];
  createProject: (project: Omit<ProjectItem, 'id'>) => ProjectItem;
  updateProject: (id: string, updates: Partial<ProjectItem>) => void;
  toggleKeyResult: (projectId: string, krId: string) => void;
  deleteProject: (id: string) => void;

  // Tasks
  tasks: TaskItem[];
  createTask: (task: Omit<TaskItem, 'id' | 'createdAt'>) => TaskItem;
  toggleTask: (taskId: string) => void;
  updateTask: (taskId: string, updates: Partial<TaskItem>) => void;
  setTaskPriority: (taskId: string, priority: TaskPriority) => void;
  deleteTask: (taskId: string) => void;

  // Reminders
  reminders: ReminderItem[];
  createReminder: (reminder: Omit<ReminderItem, 'id'>) => ReminderItem;
  toggleReminder: (reminderId: string) => void;
  deleteReminder: (reminderId: string) => void;

  // Widgets
  widgets: WidgetConfig[];
  updateWidgetConfig: (id: string, updates: Partial<WidgetConfig>) => void;
  reorderWidgets: (orderedIds: string[]) => void;
  resetWidgetsToDefault: () => void;

  // Toasts
  toasts: OSToast[];
  addToast: (title: string, message?: string, type?: 'success' | 'info' | 'alert') => void;
  removeToast: (id: string) => void;

  // Reset all data
  resetAllSystemData: () => void;
}

const OSContext = createContext<OSContextType | null>(null);

const STORAGE_KEYS = {
  FILES: 'aether_os_files_v1',
  PROJECTS: 'aether_os_projects_v1',
  TASKS: 'aether_os_tasks_v1',
  REMINDERS: 'aether_os_reminders_v1',
  WIDGETS: 'aether_os_widgets_v1',
  THEME: 'aether_os_theme_v1',
  GRADIENT: 'aether_os_gradient_v1',
  SIDEBAR: 'aether_os_sidebar_v1',
};

export const OSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [theme, setThemeState] = useState<OSTheme>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      return (saved as OSTheme) || 'slate';
    } catch {
      return 'slate';
    }
  });

  const [gradientPreset, setGradientPresetState] = useState<GradientPreset>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GRADIENT);
      return (saved as GradientPreset) || 'smoky-vanilla';
    } catch {
      return 'smoky-vanilla';
    }
  });

  const setGradientPreset = useCallback((preset: GradientPreset) => {
    setGradientPresetState(preset);
    try {
      localStorage.setItem(STORAGE_KEYS.GRADIENT, preset);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const [sidebarCollapsed, setSidebarCollapsedState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SIDEBAR);
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  // Modals
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [quickCaptureModalOpen, setQuickCaptureModalOpen] = useState(false);
  const [customizeWidgetsModalOpen, setCustomizeWidgetsModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [organizerModalOpen, setOrganizerModalOpen] = useState(false);
  const [vaultDocumentsModalOpen, setVaultDocumentsModalOpen] = useState(false);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  // Core Data
  const [files, setFiles] = useState<FileItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FILES);
      return saved ? JSON.parse(saved) : INITIAL_FILES;
    } catch {
      return INITIAL_FILES;
    }
  });

  const [projects, setProjects] = useState<ProjectItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
    } catch {
      return INITIAL_PROJECTS;
    }
  });

  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (saved) {
        const parsed = JSON.parse(saved) as TaskItem[];
        const existingIds = new Set(parsed.map((t) => t.id));
        const missing = INITIAL_TASKS.filter((t) => !existingIds.has(t.id));
        if (missing.length > 0) {
          return [...parsed, ...missing];
        }
        return parsed;
      }
      return INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [reminders, setReminders] = useState<ReminderItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REMINDERS);
      return saved ? JSON.parse(saved) : INITIAL_REMINDERS;
    } catch {
      return INITIAL_REMINDERS;
    }
  });

  const [widgets, setWidgets] = useState<WidgetConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WIDGETS);
      if (saved) {
        const parsed = JSON.parse(saved) as WidgetConfig[];
        const filtered = parsed.filter((w) => w.id !== 'quick_capture' && w.id !== 'recent_files');
        return filtered
          .map((w) => {
            if (w.id === 'top_tasks') return { ...w, size: 'full' as const, order: 0 };
            return w;
          })
          .sort((a, b) => a.order - b.order);
      }
      return INITIAL_WIDGETS;
    } catch {
      return INITIAL_WIDGETS;
    }
  });

  const [toasts, setToasts] = useState<OSToast[]>([]);

  // Persistence Effects
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(files));
    } catch (e) {
      console.warn('Storage quota exceeded for files', e);
    }
  }, [files]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WIDGETS, JSON.stringify(widgets));
  }, [widgets]);

  const setTheme = (newTheme: OSTheme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
  };

  const setSidebarCollapsed = (action: boolean | ((prev: boolean) => boolean)) => {
    setSidebarCollapsedState((prev) => {
      const next = typeof action === 'function' ? action(prev) : action;
      localStorage.setItem(STORAGE_KEYS.SIDEBAR, JSON.stringify(next));
      return next;
    });
  };

  // Toast System
  const addToast = useCallback((title: string, message?: string, type: 'success' | 'info' | 'alert' = 'success') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3600);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Keyboard shortcut listener (⌘K / Ctrl+K and ⌘N / Ctrl+N)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setQuickCaptureModalOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
        setQuickCaptureModalOpen(false);
        setCustomizeWidgetsModalOpen(false);
        setSettingsModalOpen(false);
        setOrganizerModalOpen(false);
        setVaultDocumentsModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // File Handlers
  const createFile = useCallback(
    ({
      name,
      parentId = null,
      content = '',
      tags = [],
      extension = 'md',
    }: {
      name: string;
      parentId?: string | null;
      content?: string;
      tags?: string[];
      extension?: 'md' | 'txt' | 'json';
    }): FileItem => {
      const cleanName = name.trim().endsWith(`.${extension}`) ? name.trim() : `${name.trim()}.${extension}`;
      const newFile: FileItem = {
        id: 'file-' + Date.now(),
        name: cleanName,
        parentId: parentId || null,
        type: 'file',
        extension,
        content: content || `# ${cleanName.replace(`.${extension}`, '')}\n\n`,
        tags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sizeBytes: content.length,
      };
      setFiles((prev) => [newFile, ...prev]);
      addToast('File created', cleanName, 'success');
      return newFile;
    },
    [addToast]
  );

  const createFolder = useCallback(
    (name: string, parentId: string | null = null, tags: string[] = []): FileItem => {
      const cleanName = name.trim();
      const newFolder: FileItem = {
        id: 'folder-' + Date.now(),
        name: cleanName,
        parentId: parentId || null,
        type: 'folder',
        tags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setFiles((prev) => [...prev, newFolder]);
      addToast('Folder created', cleanName, 'success');
      return newFolder;
    },
    [addToast]
  );

  const moveFile = useCallback(
    (fileId: string, newParentId: string | null) => {
      if (fileId === newParentId) return;
      setFiles((prev) =>
        prev.map((item) => {
          if (item.id === fileId) {
            const isMovingOutOfInbox = item.parentId === 'folder-inbox' && newParentId !== 'folder-inbox';
            const cleanTags = isMovingOutOfInbox ? item.tags.filter((t) => t !== 'unorganized') : item.tags;
            return {
              ...item,
              parentId: newParentId,
              isInboxCapture: isMovingOutOfInbox ? false : item.isInboxCapture,
              wasQuickCaptured: item.wasQuickCaptured || item.isInboxCapture || item.tags.includes('quick-capture'),
              dealtWith: isMovingOutOfInbox ? true : item.dealtWith,
              dealtWithAt: isMovingOutOfInbox ? (item.dealtWithAt || new Date().toISOString()) : item.dealtWithAt,
              tags: cleanTags,
              updatedAt: new Date().toISOString(),
            };
          }
          return item;
        })
      );
      const movedItem = files.find((f) => f.id === fileId);
      const destinationFolder = newParentId ? files.find((f) => f.id === newParentId)?.name : 'Root';
      addToast('Moved to ' + (destinationFolder || 'Folder'), movedItem?.name, 'info');
    },
    [files, addToast]
  );

  const markCaptureDealtWith = useCallback(
    (fileId: string, destinationFolderId?: string) => {
      setFiles((prev) =>
        prev.map((item) => {
          if (item.id === fileId) {
            const targetFolder =
              destinationFolderId !== undefined
                ? destinationFolderId
                : item.parentId === 'folder-inbox'
                ? 'folder-resources'
                : item.parentId;
            const cleanTags = item.tags.filter((t) => t !== 'unorganized');
            return {
              ...item,
              parentId: targetFolder,
              isInboxCapture: false,
              wasQuickCaptured: true,
              dealtWith: true,
              dealtWithAt: new Date().toISOString(),
              tags: cleanTags,
              updatedAt: new Date().toISOString(),
            };
          }
          return item;
        })
      );
      const targetNote = files.find((f) => f.id === fileId);
      addToast('Capture dealt with & organized', targetNote?.name, 'success');
    },
    [files, addToast]
  );

  const updateFile = useCallback((fileId: string, updates: Partial<FileItem>) => {
    setFiles((prev) =>
      prev.map((item) =>
        item.id === fileId
          ? {
              ...item,
              ...updates,
              updatedAt: new Date().toISOString(),
              sizeBytes: updates.content ? updates.content.length : item.sizeBytes,
            }
          : item
      )
    );
  }, []);

  const deleteFile = useCallback(
    (fileId: string) => {
      const target = files.find((f) => f.id === fileId);
      if (!target) return;

      // Also remove all nested items if target is a folder
      const idsToDelete = new Set<string>([fileId]);
      const findChildren = (pid: string) => {
        files.forEach((f) => {
          if (f.parentId === pid) {
            idsToDelete.add(f.id);
            if (f.type === 'folder') findChildren(f.id);
          }
        });
      };
      if (target.type === 'folder') {
        findChildren(fileId);
      }

      setFiles((prev) => prev.filter((item) => !idsToDelete.has(item.id)));
      if (activeFileId && idsToDelete.has(activeFileId)) {
        setActiveFileId(null);
      }
      addToast('Deleted ' + target.name, undefined, 'info');
    },
    [files, activeFileId, addToast]
  );

  const togglePinFile = useCallback((fileId: string) => {
    setFiles((prev) =>
      prev.map((item) => (item.id === fileId ? { ...item, pinned: !item.pinned } : item))
    );
  }, []);

  const quickCaptureNote = useCallback(
    ({
      title,
      content,
      folderId,
      tags = ['inbox', 'quick-capture'],
    }: {
      title: string;
      content: string;
      folderId?: string;
      tags?: string[];
    }): FileItem => {
      // Find inbox folder if not specified
      const targetFolderId = folderId || files.find((f) => f.name === '00_Inbox')?.id || null;
      const formattedTitle = title.trim() || `Capture - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      const filename = formattedTitle.endsWith('.md') ? formattedTitle : `${formattedTitle}.md`;

      const markdownContent = `# ${formattedTitle.replace('.md', '')}\n*Captured on ${new Date().toLocaleString()}*\n\n${content}\n\n---\n*Destination: ${targetFolderId ? 'Inbox' : 'Root'}*`;

      const newFile: FileItem = {
        id: 'capture-' + Date.now(),
        name: filename,
        parentId: targetFolderId,
        type: 'file',
        extension: 'md',
        content: markdownContent,
        tags: Array.from(new Set([...tags, 'second-brain', 'unorganized'])),
        isInboxCapture: true,
        wasQuickCaptured: true,
        dealtWith: false,
        pinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sizeBytes: markdownContent.length,
      };

      setFiles((prev) => [newFile, ...prev]);
      addToast('Captured to Second Brain', filename, 'success');
      return newFile;
    },
    [files, addToast]
  );

  const handleDropUpload = useCallback(
    async (fileList: FileList | File[], parentId: string | null = null) => {
      const items = Array.from(fileList);
      for (const file of items) {
        let content = '';
        try {
          content = await file.text();
        } catch {
          content = `[Binary file: ${file.name} - ${(file.size / 1024).toFixed(1)} KB]`;
        }

        const ext = file.name.split('.').pop()?.toLowerCase();
        const validExt: 'md' | 'txt' | 'json' = ext === 'json' ? 'json' : ext === 'txt' ? 'txt' : 'md';

        const newFile: FileItem = {
          id: 'upload-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
          name: file.name,
          parentId,
          type: 'file',
          extension: validExt,
          content,
          tags: ['uploaded', validExt],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          sizeBytes: file.size,
        };

        setFiles((prev) => [newFile, ...prev]);
      }
      addToast(`Imported ${items.length} file${items.length > 1 ? 's' : ''}`, undefined, 'success');
    },
    [addToast]
  );

  // Projects Handlers
  const createProject = useCallback(
    (projData: Omit<ProjectItem, 'id'>): ProjectItem => {
      const newProj: ProjectItem = {
        id: 'proj-' + Date.now(),
        ...projData,
      };
      setProjects((prev) => [newProj, ...prev]);
      addToast('Project created', newProj.title, 'success');
      return newProj;
    },
    [addToast]
  );

  const updateProject = useCallback((id: string, updates: Partial<ProjectItem>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  }, []);

  const toggleKeyResult = useCallback((projectId: string, krId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const updatedKrs = p.keyResults.map((kr) =>
          kr.id === krId ? { ...kr, done: !kr.done } : kr
        );
        const doneCount = updatedKrs.filter((kr) => kr.done).length;
        const progress = updatedKrs.length > 0 ? Math.round((doneCount / updatedKrs.length) * 100) : p.progress;
        return {
          ...p,
          keyResults: updatedKrs,
          progress,
        };
      })
    );
  }, []);

  const deleteProject = useCallback(
    (id: string) => {
      const target = projects.find((p) => p.id === id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      addToast('Project archived', target?.title, 'info');
    },
    [projects, addToast]
  );

  // Tasks Handlers
  const createTask = useCallback(
    (taskData: Omit<TaskItem, 'id' | 'createdAt'>): TaskItem => {
      const newTask: TaskItem = {
        id: 'task-' + Date.now(),
        createdAt: new Date().toISOString(),
        ...taskData,
      };
      setTasks((prev) => [newTask, ...prev]);
      addToast('Task added', newTask.title, 'success');
      return newTask;
    },
    [addToast]
  );

  const toggleTask = useCallback(
    (taskId: string) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === taskId) {
            const nextDone = !t.completed;
            if (nextDone) {
              addToast('Completed task', t.title, 'success');
            }
            return { ...t, completed: nextDone };
          }
          return t;
        })
      );
    },
    [addToast]
  );

  const updateTask = useCallback((taskId: string, updates: Partial<TaskItem>) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t)));
  }, []);

  const setTaskPriority = useCallback((taskId: string, priority: TaskPriority) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, priority } : t)));
  }, []);

  const deleteTask = useCallback(
    (taskId: string) => {
      const target = tasks.find((t) => t.id === taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      addToast('Task removed', target?.title, 'info');
    },
    [tasks, addToast]
  );

  // Reminders Handlers
  const createReminder = useCallback(
    (reminderData: Omit<ReminderItem, 'id'>): ReminderItem => {
      const newRem: ReminderItem = {
        id: 'rem-' + Date.now(),
        ...reminderData,
      };
      setReminders((prev) => [newRem, ...prev]);
      addToast('Reminder set', newRem.title, 'success');
      return newRem;
    },
    [addToast]
  );

  const toggleReminder = useCallback((reminderId: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === reminderId ? { ...r, completed: !r.completed } : r))
    );
  }, []);

  const deleteReminder = useCallback((reminderId: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== reminderId));
  }, []);

  // Widgets Handlers
  const updateWidgetConfig = useCallback((id: string, updates: Partial<WidgetConfig>) => {
    setWidgets((prev) => prev.map((w) => (w.id === id ? { ...w, ...updates } : w)));
  }, []);

  const reorderWidgets = useCallback((orderedIds: string[]) => {
    setWidgets((prev) => {
      const lookup = new Map(prev.map((w) => [w.id, w]));
      return orderedIds.map((id, index) => {
        const item = lookup.get(id);
        return item ? { ...item, order: index } : ({} as WidgetConfig);
      }).filter(Boolean);
    });
  }, []);

  const resetWidgetsToDefault = useCallback(() => {
    setWidgets(INITIAL_WIDGETS);
    addToast('Widgets reset to default layout', undefined, 'info');
  }, [addToast]);

  const openFile = useCallback(
    (fileId: string | null) => {
      setActiveFileId(fileId);
      if (fileId) {
        setActiveView('files');
      }
    },
    []
  );

  const resetAllSystemData = useCallback(() => {
    setFiles(INITIAL_FILES);
    setProjects(INITIAL_PROJECTS);
    setTasks(INITIAL_TASKS);
    setReminders(INITIAL_REMINDERS);
    setWidgets(INITIAL_WIDGETS);
    localStorage.clear();
    addToast('Operating system reset to clean state', undefined, 'info');
  }, [addToast]);

  return (
    <OSContext.Provider
      value={{
        activeView,
        setActiveView,
        theme,
        setTheme,
        gradientPreset,
        setGradientPreset,
        sidebarCollapsed,
        setSidebarCollapsed,
        commandPaletteOpen,
        setCommandPaletteOpen,
        quickCaptureModalOpen,
        setQuickCaptureModalOpen,
        customizeWidgetsModalOpen,
        setCustomizeWidgetsModalOpen,
        settingsModalOpen,
        setSettingsModalOpen,
        organizerModalOpen,
        setOrganizerModalOpen,
        vaultDocumentsModalOpen,
        setVaultDocumentsModalOpen,
        activeFileId,
        openFile,
        files,
        createFile,
        createFolder,
        moveFile,
        updateFile,
        deleteFile,
        togglePinFile,
        markCaptureDealtWith,
        quickCaptureNote,
        handleDropUpload,
        projects,
        createProject,
        updateProject,
        toggleKeyResult,
        deleteProject,
        tasks,
        createTask,
        toggleTask,
        updateTask,
        setTaskPriority,
        deleteTask,
        reminders,
        createReminder,
        toggleReminder,
        deleteReminder,
        widgets,
        updateWidgetConfig,
        reorderWidgets,
        resetWidgetsToDefault,
        toasts,
        addToast,
        removeToast,
        resetAllSystemData,
      }}
    >
      {children}
    </OSContext.Provider>
  );
};

export const useOS = (): OSContextType => {
  const context = useContext(OSContext);
  if (!context) {
    throw new Error('useOS must be used within an OSProvider');
  }
  return context;
};
