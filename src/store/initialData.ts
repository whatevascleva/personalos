import { FileItem, ProjectItem, TaskItem, ReminderItem, WidgetConfig, GoalItem } from '../types';

export const INITIAL_FILES: FileItem[] = [
  // Core PARA Folders
  {
    id: 'folder-inbox',
    name: '00_Inbox',
    parentId: null,
    type: 'folder',
    tags: ['inbox', 'capture'],
    createdAt: '2026-10-10T08:00:00Z',
    updatedAt: '2026-10-14T20:30:00Z',
  },
  {
    id: 'folder-projects',
    name: '01_Projects',
    parentId: null,
    type: 'folder',
    tags: ['active', 'initiatives'],
    createdAt: '2026-10-10T08:00:00Z',
    updatedAt: '2026-10-14T18:00:00Z',
  },
  {
    id: 'folder-areas',
    name: '02_Areas',
    parentId: null,
    type: 'folder',
    tags: ['standards', 'domains'],
    createdAt: '2026-10-10T08:00:00Z',
    updatedAt: '2026-10-12T14:00:00Z',
  },
  {
    id: 'folder-resources',
    name: '03_Resources',
    parentId: null,
    type: 'folder',
    tags: ['references', 'knowledge'],
    createdAt: '2026-10-10T08:00:00Z',
    updatedAt: '2026-10-13T10:00:00Z',
  },
  {
    id: 'folder-archive',
    name: '04_Archive',
    parentId: null,
    type: 'folder',
    tags: ['completed', 'history'],
    createdAt: '2026-10-10T08:00:00Z',
    updatedAt: '2026-10-10T08:00:00Z',
  },

  // Project Subfolders
  {
    id: 'folder-proj-aether',
    name: 'Aether_OS_Launch',
    parentId: 'folder-projects',
    type: 'folder',
    tags: ['launch', 'q4'],
    createdAt: '2026-10-11T09:00:00Z',
    updatedAt: '2026-10-14T19:00:00Z',
  },
  {
    id: 'folder-proj-brand',
    name: 'Design_System_Spec',
    parentId: 'folder-projects',
    type: 'folder',
    tags: ['design', 'ui-ux'],
    createdAt: '2026-10-11T09:30:00Z',
    updatedAt: '2026-10-13T11:00:00Z',
  },

  // Inbox Captured Notes (from Quick Capture - Needs Organization)
  {
    id: 'file-inbox-1',
    name: 'Sync Notes - Architecture Review.md',
    parentId: 'folder-inbox',
    type: 'file',
    extension: 'md',
    tags: ['architecture', 'unorganized', 'second-brain'],
    isInboxCapture: true,
    wasQuickCaptured: true,
    dealtWith: false,
    pinned: true,
    createdAt: '2026-10-14T16:20:00Z',
    updatedAt: '2026-10-14T16:20:00Z',
    content: `# Sync Notes - Architecture Review
*Captured via Quick Capture*

- **Latency Target**: Client side state resolution < 16ms
- **Memory Footprint**: Keep file tree normalized with memoized lookup maps
- **Action Item**: Add fuzzy index for command palette across files & tasks
- **Quote**: "The mind is for having ideas, not holding them." — David Allen

### Next Step
File this note under \`01_Projects/Aether_OS_Launch\` once the action items are assigned.`,
  },
  {
    id: 'file-inbox-2',
    name: 'Idea - Bi-directional Backlink Indexer.md',
    parentId: 'folder-inbox',
    type: 'file',
    extension: 'md',
    tags: ['brainstorm', 'unorganized'],
    isInboxCapture: true,
    wasQuickCaptured: true,
    dealtWith: false,
    pinned: false,
    createdAt: '2026-10-14T18:45:00Z',
    updatedAt: '2026-10-14T18:45:00Z',
    content: `# Bi-directional Backlink Indexer
*Captured via Quick Capture*

Explore auto-extracting \`[[wiki-links]]\` from markdown content dynamically so notes link together like a graph database.

- [x] Test regex parser on markdown text
- [ ] Render linked mentions pane in file viewer
- [ ] Add visual node cluster preview`,
  },
  {
    id: 'file-inbox-3',
    name: 'Client Feedback - Performance Metrics.md',
    parentId: 'folder-inbox',
    type: 'file',
    extension: 'md',
    tags: ['feedback', 'unorganized', 'metrics'],
    isInboxCapture: true,
    wasQuickCaptured: true,
    dealtWith: false,
    pinned: false,
    createdAt: '2026-10-14T20:15:00Z',
    updatedAt: '2026-10-14T20:15:00Z',
    content: `# Client Feedback - Performance Metrics
*Captured via Quick Capture*

- Users love the instant responsiveness of the command palette.
- Request: Make sure notes awaiting review are immediately visible at the top of Second Brain.
- Ensure all notes can be explored without pre-selected filters.`,
  },

  // Notes That Were Quickly Captured & Dealt With (Triaged & Organized into Folders)
  {
    id: 'file-dealt-1',
    name: 'Capture - Dark Mode Color Contrast Audit.md',
    parentId: 'folder-proj-brand',
    type: 'file',
    extension: 'md',
    tags: ['design', 'contrast', 'quick-capture', 'ui-ux'],
    isInboxCapture: false,
    wasQuickCaptured: true,
    dealtWith: true,
    dealtWithAt: '2026-10-14T19:30:00Z',
    pinned: false,
    createdAt: '2026-10-14T14:10:00Z',
    updatedAt: '2026-10-14T19:30:00Z',
    content: `# Capture - Dark Mode Color Contrast Audit
*Quick Captured & Dealt With*

Filed into: \`01_Projects / Design_System_Spec\`

- Tested slate and obsidian surfaces with WCAG 2.1 AA tokens.
- All primary typography exceeds 7:1 contrast ratio.
- Border luminescence balanced at 6-8% white opacity for effortless elevation.`,
  },
  {
    id: 'file-dealt-2',
    name: 'Capture - SQLite WASM Persistence Patterns.md',
    parentId: 'folder-resources',
    type: 'file',
    extension: 'md',
    tags: ['storage', 'wasm', 'quick-capture', 'reference'],
    isInboxCapture: false,
    wasQuickCaptured: true,
    dealtWith: true,
    dealtWithAt: '2026-10-14T17:10:00Z',
    pinned: false,
    createdAt: '2026-10-14T11:05:00Z',
    updatedAt: '2026-10-14T17:10:00Z',
    content: `# Capture - SQLite WASM Persistence Patterns
*Quick Captured & Dealt With*

Filed into: \`03_Resources\`

- Evaluated OPFS (Origin Private File System) vs indexedDB for offline blob storage.
- Standard serialization in local state ensures immediate render with zero network hop.`,
  },
  {
    id: 'file-dealt-3',
    name: 'Capture - Product Launch Checklist Sprint.md',
    parentId: 'folder-proj-aether',
    type: 'file',
    extension: 'md',
    tags: ['launch', 'ops', 'quick-capture'],
    isInboxCapture: false,
    wasQuickCaptured: true,
    dealtWith: true,
    dealtWithAt: '2026-10-14T18:00:00Z',
    pinned: false,
    createdAt: '2026-10-14T13:40:00Z',
    updatedAt: '2026-10-14T18:00:00Z',
    content: `# Capture - Product Launch Checklist Sprint
*Quick Captured & Dealt With*

Filed into: \`01_Projects / Aether_OS_Launch\`

- Finalize top 3 priority task triage flows.
- Verify Second Brain quick capture routing.
- Check responsive side navigation states across mobile and wide viewports.`,
  },

  // Files in Projects
  {
    id: 'file-proj-1',
    name: 'Executive_Launch_Manifesto.md',
    parentId: 'folder-proj-aether',
    type: 'file',
    extension: 'md',
    tags: ['manifesto', 'launch', 'strategy'],
    pinned: true,
    createdAt: '2026-10-11T10:00:00Z',
    updatedAt: '2026-10-14T15:00:00Z',
    content: `# Executive Launch Manifesto

## Purpose
AetherOS is designed as a frictionless command center. By uniting drag-and-drop file hierarchy with executive task triage, it functions as a high-fidelity second brain.

## Core Pillars
1. **Zero Distraction**: Anti-slop UI, single-elevation surfaces, strict typographic hierarchy.
2. **Speed Over Ceremony**: Instant quick capture from anywhere with immediate file serialization.
3. **Executive Focus**: Top 3 priority constraints to avoid decision paralysis.

## Verification Checklist
- [x] Responsive side navigation with icon states
- [x] Draggable and customizable widget layout
- [x] Drag & drop file management system with folder nesting
- [x] Quick capture saving directly into \`00_Inbox\`
- [x] Tabular numeral alignment for telemetry and metrics`,
  },
  {
    id: 'file-proj-2',
    name: 'Design_Tokens_and_Spacing.json',
    parentId: 'folder-proj-brand',
    type: 'file',
    extension: 'json',
    tags: ['tokens', 'tailwind', 'spec'],
    createdAt: '2026-10-12T11:20:00Z',
    updatedAt: '2026-10-13T17:40:00Z',
    content: `{
  "system": "Aether UI/UX",
  "radius": {
    "outer": "12px",
    "inner": "8px"
  },
  "typography": {
    "display": "Plus Jakarta Sans",
    "mono": "JetBrains Mono"
  },
  "elevation": "single-tier-subtle",
  "contrast": "WCAG AA Compliant"
}`,
  },

  // Files in Resources
  {
    id: 'file-res-1',
    name: 'Mental_Models_Index.md',
    parentId: 'folder-resources',
    type: 'file',
    extension: 'md',
    tags: ['thinking', 'frameworks'],
    createdAt: '2026-10-13T09:15:00Z',
    updatedAt: '2026-10-13T09:15:00Z',
    content: `# Core Mental Models for Operating Systems

### 1. Inversion
Instead of asking "how do I add more widgets?", ask "what friction points must be eliminated to make capture effortless?"

### 2. First Principles
Files are documents with paths, tags, and timestamps. By eliminating backend roundtrips for capture, thoughts become permanent instantly.

### 3. The Rule of Three
High achievers never attempt 10 equal tasks in a day. Constrain daily output to 3 mission-critical breakthroughs.`,
  },
];

export const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: 'proj-1',
    title: 'AetherOS System Launch',
    description: 'Ship version 1.0 of the personal web operating system with customizable dashboard widgets and second brain file triage.',
    category: 'Engineering',
    status: 'active',
    progress: 84,
    targetDate: 'Oct 24, 2026',
    color: '#C97D8B', // Rose Quartz
    priority: 'high',
    fileIds: ['file-proj-1', 'file-inbox-1'],
    keyResults: [
      { id: 'kr-1', text: 'Draggable file tree with folder drop targets', done: true },
      { id: 'kr-2', text: 'Interactive customizable widget dashboard grid', done: true },
      { id: 'kr-3', text: 'Second Brain quick capture with direct disk save', done: true },
      { id: 'kr-4', text: 'Zero latency keyboard shortcut integration (⌘K / ⌘N)', done: false },
    ],
  },
  {
    id: 'proj-2',
    title: 'Design System & Token Spec',
    description: 'Standardize dark slate aesthetic, single-elevation cards, zero-pill metadata, and tabular figures.',
    category: 'Design',
    status: 'active',
    progress: 68,
    targetDate: 'Nov 02, 2026',
    color: '#DF9FA8', // Petal Blush
    priority: 'medium',
    fileIds: ['file-proj-2'],
    keyResults: [
      { id: 'kr-5', text: 'Audit typography hierarchy with Plus Jakarta Sans', done: true },
      { id: 'kr-6', text: 'Replace colored chip pills with clean text separators', done: true },
      { id: 'kr-7', text: 'Polish responsive 1440px desktop layout', done: false },
    ],
  },
  {
    id: 'proj-3',
    title: 'Knowledge Vault Architecture',
    description: 'Implement PARA second-brain hierarchy with instant search and triage mode.',
    category: 'Research',
    status: 'in_review',
    progress: 92,
    targetDate: 'Oct 18, 2026',
    color: '#D4AA8C', // Champagne Silk
    priority: 'high',
    fileIds: ['file-res-1', 'file-inbox-2'],
    keyResults: [
      { id: 'kr-8', text: 'Create PARA folder schemas and icons', done: true },
      { id: 'kr-9', text: 'Wire markdown editor with live preview', done: true },
      { id: 'kr-10', text: 'Build 1-click organizer triage modal', done: true },
    ],
  },
];

export const INITIAL_GOALS: GoalItem[] = [
  {
    id: 'goal-1',
    title: 'Ship AetherOS v1.0 Launch',
    description: 'Execute frictionless personal OS with instant capture & widget customizer',
    category: 'work',
    targetQuarter: 'Q4 2026',
    color: '#C97D8B',
  },
  {
    id: 'goal-2',
    title: 'Standardize Design Tokens & Accessibility',
    description: 'Achieve 100% WCAG AA token compliance across Slate & Obsidian themes',
    category: 'work',
    targetQuarter: 'Q4 2026',
    color: '#DF9FA8',
  },
  {
    id: 'goal-3',
    title: 'Personal Knowledge Vault & Second Brain',
    description: 'Establish frictionless capture and weekly synthesis in PARA hierarchy',
    category: 'personal',
    targetQuarter: 'Q4 2026',
    color: '#D4AA8C',
  },
  {
    id: 'goal-4',
    title: 'Home Office Ergonomics & Automation',
    description: 'Build zero-friction sit-stand workspace, ambient lighting & smart climate',
    category: 'home',
    targetQuarter: 'Q4 2026',
    color: '#E8BAC2',
  },
  {
    id: 'goal-5',
    title: 'Household Financial Clarity & Living Ops',
    description: 'Streamline monthly expenses, solar metrics, seasonal maintenance & family logistics',
    category: 'home',
    targetQuarter: 'Q1 2027',
    color: '#382629',
  },
];

export const INITIAL_TASKS: TaskItem[] = [
  // Top 3 High Priority Tasks (P1, P2, P3)
  {
    id: 'task-1',
    title: 'Review AetherOS file system drag-and-drop mechanics',
    completed: false,
    priority: 'p1',
    dueDate: 'Today, 18:00',
    projectId: 'proj-1',
    goalId: 'goal-1',
    goalTitle: 'Ship AetherOS v1.0 Launch',
    domain: 'work',
    linkedFileId: 'file-proj-1',
    timeEstimate: '45m',
    category: 'Architecture',
    createdAt: '2026-10-14T09:00:00Z',
  },
  {
    id: 'task-2',
    title: 'Triage unprocessed quick-capture notes from 00_Inbox',
    completed: false,
    priority: 'p2',
    dueDate: 'Today, 20:00',
    projectId: 'proj-3',
    goalId: 'goal-3',
    goalTitle: 'Personal Knowledge Vault & Second Brain',
    domain: 'work',
    linkedFileId: 'file-inbox-1',
    timeEstimate: '25m',
    category: 'Second Brain',
    createdAt: '2026-10-14T10:30:00Z',
  },
  {
    id: 'task-3',
    title: 'Finalize customizable dashboard widget reordering & sizes',
    completed: false,
    priority: 'p3',
    dueDate: 'Tomorrow, 12:00',
    projectId: 'proj-1',
    goalId: 'goal-1',
    goalTitle: 'Ship AetherOS v1.0 Launch',
    domain: 'work',
    timeEstimate: '35m',
    category: 'Engineering',
    createdAt: '2026-10-14T11:00:00Z',
  },

  // Supporting Work Tasks
  {
    id: 'task-4',
    title: 'Benchmark markdown rendering engine performance',
    completed: true,
    priority: 'normal',
    dueDate: 'Yesterday',
    projectId: 'proj-1',
    goalId: 'goal-1',
    goalTitle: 'Ship AetherOS v1.0 Launch',
    domain: 'work',
    timeEstimate: '30m',
    category: 'Performance',
    createdAt: '2026-10-13T14:00:00Z',
  },
  {
    id: 'task-5',
    title: 'Audit WCAG AA color contrast across Slate & Obsidian themes',
    completed: false,
    priority: 'normal',
    dueDate: 'Oct 17',
    projectId: 'proj-2',
    goalId: 'goal-2',
    goalTitle: 'Standardize Design Tokens & Accessibility',
    domain: 'work',
    timeEstimate: '1h',
    category: 'Accessibility',
    createdAt: '2026-10-14T14:30:00Z',
  },
  {
    id: 'task-6',
    title: 'Draft weekly second brain synthesis document',
    completed: false,
    priority: 'normal',
    dueDate: 'Oct 18',
    projectId: 'proj-3',
    goalId: 'goal-3',
    goalTitle: 'Personal Knowledge Vault & Second Brain',
    domain: 'work',
    timeEstimate: '45m',
    category: 'Reflect',
    createdAt: '2026-10-14T15:00:00Z',
  },

  // Home-Related Tasks
  {
    id: 'task-home-1',
    title: 'Replace HVAC air filters and calibrate smart thermostat schedule',
    completed: false,
    priority: 'p2',
    dueDate: 'Saturday, 11:00',
    goalId: 'goal-4',
    goalTitle: 'Home Office Ergonomics & Automation',
    domain: 'home',
    timeEstimate: '30m',
    category: 'Home Maintenance',
    createdAt: '2026-10-14T16:00:00Z',
  },
  {
    id: 'task-home-2',
    title: 'Review monthly household utility audit & solar grid generation',
    completed: false,
    priority: 'normal',
    dueDate: 'Sunday, 15:00',
    goalId: 'goal-5',
    goalTitle: 'Household Financial Clarity & Living Ops',
    domain: 'home',
    timeEstimate: '40m',
    category: 'Finance & Admin',
    createdAt: '2026-10-14T16:30:00Z',
  },
  {
    id: 'task-home-3',
    title: 'Set up dual-monitor arm & cable management tray for home desk',
    completed: true,
    priority: 'normal',
    dueDate: 'Oct 12',
    goalId: 'goal-4',
    goalTitle: 'Home Office Ergonomics & Automation',
    domain: 'home',
    timeEstimate: '1h 15m',
    category: 'Home Workspace',
    createdAt: '2026-10-12T10:00:00Z',
  },
  {
    id: 'task-home-4',
    title: 'Schedule annual family wellness & preventive biometric checkups',
    completed: false,
    priority: 'p3',
    dueDate: 'Next Monday',
    goalId: 'goal-5',
    goalTitle: 'Household Financial Clarity & Living Ops',
    domain: 'home',
    timeEstimate: '20m',
    category: 'Health & Family',
    createdAt: '2026-10-14T17:00:00Z',
  },
];

export const INITIAL_REMINDERS: ReminderItem[] = [
  {
    id: 'rem-1',
    title: 'Product sync with Core Systems engineering lead',
    dueTime: 'Today at 16:30',
    urgency: 'critical',
    completed: false,
    category: 'Calendar',
    notes: 'Walk through file drag-and-drop performance benchmarks and widget state persistence.',
  },
  {
    id: 'rem-2',
    title: 'Backup second brain archive to offline cold vault',
    dueTime: 'Tonight at 22:00',
    urgency: 'important',
    completed: false,
    category: 'Security',
    notes: 'Ensure all JSON and markdown dumps are verified before weekly rollover.',
  },
  {
    id: 'rem-3',
    title: 'Review quarterly goals & key result targets',
    dueTime: 'Friday at 09:00',
    urgency: 'routine',
    completed: false,
    category: 'Strategy',
    notes: 'Check progress on AetherOS launch sprint.',
  },
  {
    id: 'rem-4',
    title: 'Check server-side bundle size limit',
    dueTime: 'Saturday at 11:00',
    urgency: 'routine',
    completed: true,
    category: 'DevOps',
    notes: 'Kept under 250kb initial bundle.',
  },
];

export const INITIAL_WIDGETS: WidgetConfig[] = [
  {
    id: 'top_tasks',
    title: 'Top 3 High Priority Focus Tasks',
    visible: true,
    order: 0,
    size: 'full',
    description: 'Executive triage view constrained to P1, P2, and P3 missions.',
  },
  {
    id: 'daily_horizon',
    title: 'Daily Horizon & System Pulse',
    visible: true,
    order: 1,
    size: 'compact',
    description: 'Date, focus mindset, daily capture velocity, and task completion.',
  },
  {
    id: 'reminders',
    title: 'Important Reminders & Alerts',
    visible: true,
    order: 2,
    size: 'compact',
    description: 'Time-critical alerts and meeting commitments.',
  },
  {
    id: 'active_projects',
    title: 'Active Initiatives & Projects',
    visible: true,
    order: 3,
    size: 'compact',
    description: 'Progress meters, key milestone targets, and linked documents.',
  },
];
