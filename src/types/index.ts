export type AppView = 'dashboard' | 'files' | 'projects' | 'tasks' | 'reminders';

export type OSTheme = 'obsidian' | 'slate' | 'light';

export type GradientPreset = 'smoky-vanilla' | 'warm-horizon' | 'velvet-dusk' | 'aurora-bronze';

export interface FileItem {
  id: string;
  name: string;
  parentId: string | null; // null represents root
  type: 'folder' | 'file';
  extension?: 'md' | 'txt' | 'json' | 'doc';
  content?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  pinned?: boolean;
  isInboxCapture?: boolean;
  wasQuickCaptured?: boolean;
  dealtWith?: boolean;
  dealtWithAt?: string;
  sizeBytes?: number;
}

export type TaskPriority = 'p1' | 'p2' | 'p3' | 'normal';
export type TaskDomain = 'work' | 'home' | 'personal';

export interface GoalItem {
  id: string;
  title: string;
  description: string;
  category: TaskDomain;
  targetQuarter: string;
  color: string;
}

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  priority: TaskPriority;
  dueDate: string;
  projectId?: string;
  goalId?: string;
  goalTitle?: string;
  domain?: TaskDomain;
  linkedFileId?: string;
  timeEstimate?: string;
  category?: string;
  createdAt: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'active' | 'in_review' | 'completed' | 'on_hold';
  progress: number; // 0 - 100
  targetDate: string;
  color: string;
  keyResults: { id: string; text: string; done: boolean }[];
  fileIds: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface ReminderItem {
  id: string;
  title: string;
  dueTime: string;
  urgency: 'critical' | 'important' | 'routine';
  completed: boolean;
  category: string;
  notes?: string;
}

export type WidgetSize = 'compact' | 'normal' | 'wide' | 'full';

export interface WidgetConfig {
  id: string;
  title: string;
  visible: boolean;
  order: number;
  size: WidgetSize;
  description: string;
}

export interface OSToast {
  id: string;
  title: string;
  message?: string;
  type?: 'success' | 'info' | 'alert';
}
