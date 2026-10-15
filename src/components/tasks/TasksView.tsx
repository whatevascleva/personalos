import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  Clock,
  ExternalLink,
  Trash2,
  Flame,
  Briefcase,
  Home,
  Target,
  Trophy,
  Layers,
  Search,
  X,
  Calendar,
  Tag,
  Edit2,
  FolderGit2,
  Sparkles,
} from 'lucide-react';
import { useOS } from '../../store/useOSStore';
import { TaskItem, TaskPriority, TaskDomain, GoalItem } from '../../types';
import { INITIAL_GOALS } from '../../store/initialData';

export type TaskOrganizationMode = 'all' | 'projects' | 'goals' | 'work' | 'home';

export const TasksView: React.FC = () => {
  const {
    tasks,
    createTask,
    toggleTask,
    updateTask,
    deleteTask,
    setTaskPriority,
    openFile,
    projects,
  } = useOS();

  // Active Organization Mode requested by user:
  // "organize tasks also by Projects, Goals, Work Related, Home related, etc."
  const [orgMode, setOrgMode] = useState<TaskOrganizationMode>('all');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');

  // New Task Form State
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('p1');
  const [newDue, setNewDue] = useState('Today, 18:00');
  const [newTimeEst, setNewTimeEst] = useState('30m');
  const [newDomain, setNewDomain] = useState<TaskDomain>('work');
  const [newProjectId, setNewProjectId] = useState<string>('');
  const [newGoalId, setNewGoalId] = useState<string>('');
  const [newCategory, setNewCategory] = useState('');

  // Inline editing state
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  // Available goals
  const goals: GoalItem[] = INITIAL_GOALS;

  // Infer domain helper
  const getTaskDomain = (task: TaskItem): TaskDomain => {
    if (task.domain) return task.domain;
    const cat = (task.category || '').toLowerCase();
    if (
      cat.includes('home') ||
      cat.includes('family') ||
      cat.includes('household') ||
      cat.includes('personal') ||
      cat.includes('hvac') ||
      cat.includes('living')
    ) {
      return 'home';
    }
    return 'work';
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // 1. Organization Mode filter
      if (orgMode === 'work' && getTaskDomain(task) !== 'work') return false;
      if (orgMode === 'home' && getTaskDomain(task) !== 'home' && getTaskDomain(task) !== 'personal') return false;

      // 2. Subcategory filter (within Work or Home)
      if (selectedSubCategory !== 'all' && task.category !== selectedSubCategory) {
        return false;
      }

      // 3. Status filter
      if (filterStatus === 'pending' && task.completed) return false;
      if (filterStatus === 'completed' && !task.completed) return false;

      // 4. Priority filter
      if (filterPriority !== 'all' && task.priority !== filterPriority) return false;

      // 5. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesCategory = task.category?.toLowerCase().includes(q);
        const matchesProject = projects.some(
          (p) => p.id === task.projectId && p.title.toLowerCase().includes(q)
        );
        const matchesGoal =
          task.goalTitle?.toLowerCase().includes(q) ||
          goals.some((g) => g.id === task.goalId && g.title.toLowerCase().includes(q));

        if (!matchesTitle && !matchesCategory && !matchesProject && !matchesGoal) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, orgMode, selectedSubCategory, filterStatus, filterPriority, searchQuery, projects, goals]);

  // Priority metadata mapping
  const priorityMeta: Record<
    TaskPriority,
    { label: string; textClass: string; bgClass: string; borderClass: string }
  > = {
    p1: {
      label: 'P1 Focus',
      textClass: 'text-rose-400',
      bgClass: 'bg-rose-500/10',
      borderClass: 'border-rose-500/20',
    },
    p2: {
      label: 'P2 High',
      textClass: 'text-amber-400',
      bgClass: 'bg-amber-500/10',
      borderClass: 'border-amber-500/20',
    },
    p3: {
      label: 'P3 Core',
      textClass: 'text-[#CEB7AB]',
      bgClass: 'bg-[#64504A]/30',
      borderClass: 'border-[#CEB7AB]/25',
    },
    normal: {
      label: 'Normal',
      textClass: 'text-[#8A8C8D]',
      bgClass: 'bg-[#120B06]/60',
      borderClass: 'border-[#CEB7AB]/10',
    },
  };

  // Top Focus Tasks (P1, P2, P3)
  const topFocusTasks = useMemo(() => {
    return tasks
      .filter((t) => t.priority === 'p1' || t.priority === 'p2' || t.priority === 'p3')
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const prioOrder: Record<TaskPriority, number> = { p1: 1, p2: 2, p3: 3, normal: 4 };
        return prioOrder[a.priority] - prioOrder[b.priority];
      });
  }, [tasks]);

  // Metrics summary
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    const workCount = tasks.filter((t) => getTaskDomain(t) === 'work').length;
    const homeCount = tasks.filter((t) => getTaskDomain(t) === 'home' || getTaskDomain(t) === 'personal').length;
    return { total, completed, pending, workCount, homeCount };
  }, [tasks]);

  // Unique categories for sub-filter in Work and Home modes
  const currentSubCategories = useMemo(() => {
    if (orgMode === 'work') {
      const cats = tasks
        .filter((t) => getTaskDomain(t) === 'work' && t.category)
        .map((t) => t.category!);
      return Array.from(new Set(cats));
    }
    if (orgMode === 'home') {
      const cats = tasks
        .filter(
          (t) =>
            (getTaskDomain(t) === 'home' || getTaskDomain(t) === 'personal') &&
            t.category
        )
        .map((t) => t.category!);
      return Array.from(new Set(cats));
    }
    return [];
  }, [tasks, orgMode]);

  // Submit New Task
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const matchedGoal = goals.find((g) => g.id === newGoalId);

    createTask({
      title: newTitle.trim(),
      priority: newPriority,
      dueDate: newDue,
      completed: false,
      timeEstimate: newTimeEst,
      domain: newDomain,
      projectId: newProjectId || undefined,
      goalId: newGoalId || undefined,
      goalTitle: matchedGoal?.title || undefined,
      category:
        newCategory.trim() ||
        (newDomain === 'home' ? 'Household' : 'General'),
    });

    setNewTitle('');
    setNewCategory('');
    setNewProjectId('');
    setNewGoalId('');
    setIsAdding(false);
  };

  // Submit Inline Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editingTask.title.trim()) return;

    const matchedGoal = goals.find((g) => g.id === editingTask.goalId);

    updateTask(editingTask.id, {
      title: editingTask.title.trim(),
      priority: editingTask.priority,
      dueDate: editingTask.dueDate,
      timeEstimate: editingTask.timeEstimate,
      domain: editingTask.domain,
      projectId: editingTask.projectId || undefined,
      goalId: editingTask.goalId || undefined,
      goalTitle: matchedGoal?.title || editingTask.goalTitle || undefined,
      category: editingTask.category,
    });

    setEditingTask(null);
  };

  // Quick helper to open Create Modal with prefilled project or goal or domain
  const handleOpenAddForContext = (context: {
    domain?: TaskDomain;
    projectId?: string;
    goalId?: string;
  }) => {
    if (context.domain) setNewDomain(context.domain);
    if (context.projectId) {
      setNewProjectId(context.projectId);
      setNewDomain('work');
    }
    if (context.goalId) {
      setNewGoalId(context.goalId);
      const g = goals.find((x) => x.id === context.goalId);
      if (g) setNewDomain(g.category === 'home' ? 'home' : 'work');
    }
    setIsAdding(true);
  };

  // Render a single task row item
  const renderTaskRow = (task: TaskItem) => {
    const prio = priorityMeta[task.priority];
    const project = projects.find((p) => p.id === task.projectId);
    const domain = getTaskDomain(task);

    return (
      <div
        key={task.id}
        className="p-3.5 hover:bg-[#64504A]/25 transition-colors flex items-center justify-between gap-3 text-xs group border-b border-[#CEB7AB]/10 last:border-b-0"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={() => toggleTask(task.id)}
            className="text-[#8A8C8D] hover:text-emerald-400 cursor-pointer shrink-0 transition-transform active:scale-90"
            title={task.completed ? 'Mark incomplete' : 'Mark complete'}
          >
            {task.completed ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Circle className="w-4 h-4 text-[#8A8C8D] group-hover:text-[#FAF4F0]" />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`font-medium ${
                  task.completed ? 'line-through text-[#8A8C8D]' : 'text-[#FAF4F0]'
                }`}
              >
                {task.title}
              </span>

              {/* Domain tag */}
              <span
                className={`text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase tracking-wider ${
                  domain === 'home'
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                    : 'bg-[#64504A]/30 text-[#CEB7AB] border-[#CEB7AB]/25'
                }`}
              >
                {domain === 'home' ? 'Home' : 'Work'}
              </span>

              {/* Category tag */}
              {task.category && (
                <span className="text-[10px] font-mono text-[#A89E97] bg-[#120B06]/80 px-1.5 py-0.2 rounded border border-[#CEB7AB]/10">
                  {task.category}
                </span>
              )}
            </div>

            {/* Contextual Sub-line: Due Date, Time Est, Project, Goal, Specs */}
            <div className="flex items-center gap-2 mt-1 text-[11px] text-[#A89E97] font-mono tabular-nums flex-wrap">
              <span className="flex items-center gap-1 text-[#A89E97]">
                <Clock className="w-3 h-3 text-[#8A8C8D] shrink-0" />
                <span>{task.dueDate}</span>
              </span>

              {task.timeEstimate && (
                <>
                  <span aria-hidden="true" className="text-[#64504A]">·</span>
                  <span>{task.timeEstimate}</span>
                </>
              )}

              {project && (
                <>
                  <span aria-hidden="true" className="text-[#64504A]">·</span>
                  <span className="flex items-center gap-1 text-[#DFCCC1] truncate max-w-[150px]">
                    <div
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="truncate">{project.title}</span>
                  </span>
                </>
              )}

              {task.goalTitle && (
                <>
                  <span aria-hidden="true" className="text-[#64504A]">·</span>
                  <span className="text-[#CEB7AB] truncate max-w-[180px] flex items-center gap-1">
                    <Trophy className="w-2.5 h-2.5 shrink-0 text-[#CEB7AB]" />
                    <span className="truncate">{task.goalTitle}</span>
                  </span>
                </>
              )}

              {task.linkedFileId && (
                <>
                  <span aria-hidden="true" className="text-[#64504A]">·</span>
                  <button
                    onClick={() => openFile(task.linkedFileId!)}
                    className="text-[#CEB7AB] hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Spec</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Priority Selector & Quick Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={task.priority}
            onChange={(e) => setTaskPriority(task.id, e.target.value as TaskPriority)}
            className={`font-mono text-[10px] px-2 py-0.5 rounded border focus:outline-none cursor-pointer transition-colors ${prio.bgClass} ${prio.textClass} ${prio.borderClass}`}
          >
            <option value="p1" className="bg-[#120B06] text-rose-400">P1 Focus</option>
            <option value="p2" className="bg-[#120B06] text-amber-400">P2 High</option>
            <option value="p3" className="bg-[#120B06] text-[#CEB7AB]">P3 Core</option>
            <option value="normal" className="bg-[#120B06] text-[#8A8C8D]">Normal</option>
          </select>

          <button
            onClick={() => setEditingTask(task)}
            className="p-1 text-[#8A8C8D] hover:text-[#FAF4F0] rounded hover:bg-[#64504A]/30 transition-colors cursor-pointer"
            title="Edit task details, project, or goal"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => deleteTask(task.id)}
            className="p-1 text-[#8A8C8D] hover:text-rose-400 rounded hover:bg-[#64504A]/30 transition-colors cursor-pointer"
            title="Delete task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none">
      {/* Top Header */}
      <div className="px-6 py-4 border-b border-[#CEB7AB]/15 bg-[#120B06]/75 backdrop-blur-xl shrink-0 shadow-[0_4px_20px_-4px_rgba(18,11,6,0.6)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-sm md:text-base font-bold text-[#FAF4F0] tracking-tight">
                High-Priority Tasks Matrix
              </h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-[#CEB7AB]/15 text-[#CEB7AB] border border-[#CEB7AB]/25">
                {stats.pending} pending · {stats.completed} completed
              </span>
            </div>
            <p className="text-xs text-[#A89E97] mt-1">
              Multi-dimensional task organization: prioritize by Top 3 Focus, Projects, Goals, Work, and Home.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Search */}
            <div className="relative w-48 md:w-64">
              <Search className="w-3.5 h-3.5 text-[#8A8C8D] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks, projects, goals..."
                className="w-full pl-8 pr-7 py-1.5 glass-input rounded-lg text-xs placeholder:text-[#8A8C8D]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8A8C8D] hover:text-[#FAF4F0]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Create Task Button */}
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#CEB7AB] hover:bg-[#DFCCC1] text-[#120B06] text-xs font-semibold shadow-md shadow-[#CEB7AB]/20 cursor-pointer shrink-0 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ORGANIZATION TABS BAR (ALL TASKS, BY PROJECTS, BY GOALS, WORK, HOME)
         ========================================================================= */}
      <div className="px-6 py-2.5 border-b border-[#CEB7AB]/15 bg-[#18100A]/55 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Left: Organization Mode Tabs */}
        <div className="flex items-center gap-1 bg-[#120B06]/80 border border-[#CEB7AB]/15 p-1 rounded-xl text-xs overflow-x-auto max-w-full shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          {/* ALL TASKS */}
          <button
            onClick={() => {
              setOrgMode('all');
              setSelectedSubCategory('all');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
              orgMode === 'all'
                ? 'bg-[#CEB7AB] text-[#120B06] font-semibold shadow-xs'
                : 'text-[#A89E97] hover:text-[#FAF4F0] hover:bg-[#64504A]/25'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Tasks</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                orgMode === 'all'
                  ? 'bg-[#120B06]/20 text-[#120B06] font-bold'
                  : 'bg-[#120B06] text-[#CEB7AB] border border-[#CEB7AB]/15'
              }`}
            >
              {stats.total}
            </span>
          </button>

          {/* BY PROJECTS */}
          <button
            onClick={() => {
              setOrgMode('projects');
              setSelectedSubCategory('all');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
              orgMode === 'projects'
                ? 'bg-[#CEB7AB] text-[#120B06] font-semibold shadow-xs'
                : 'text-[#A89E97] hover:text-[#FAF4F0] hover:bg-[#64504A]/25'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>By Projects</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                orgMode === 'projects'
                  ? 'bg-[#120B06]/20 text-[#120B06] font-bold'
                  : 'bg-[#120B06] text-[#CEB7AB] border border-[#CEB7AB]/15'
              }`}
            >
              {projects.length}
            </span>
          </button>

          {/* BY GOALS */}
          <button
            onClick={() => {
              setOrgMode('goals');
              setSelectedSubCategory('all');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
              orgMode === 'goals'
                ? 'bg-[#CEB7AB] text-[#120B06] font-semibold shadow-xs'
                : 'text-[#A89E97] hover:text-[#FAF4F0] hover:bg-[#64504A]/25'
            }`}
          >
            <Trophy className={`w-3.5 h-3.5 ${orgMode === 'goals' ? 'text-[#120B06]' : 'text-[#CEB7AB]'}`} />
            <span>By Goals</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                orgMode === 'goals'
                  ? 'bg-[#120B06]/20 text-[#120B06] font-bold'
                  : 'bg-[#120B06] text-[#CEB7AB] border border-[#CEB7AB]/15'
              }`}
            >
              {goals.length}
            </span>
          </button>

          {/* WORK RELATED */}
          <button
            onClick={() => {
              setOrgMode('work');
              setSelectedSubCategory('all');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
              orgMode === 'work'
                ? 'bg-[#CEB7AB] text-[#120B06] font-semibold shadow-xs'
                : 'text-[#A89E97] hover:text-[#FAF4F0] hover:bg-[#64504A]/25'
            }`}
          >
            <Briefcase className={`w-3.5 h-3.5 ${orgMode === 'work' ? 'text-[#120B06]' : 'text-[#CEB7AB]'}`} />
            <span>Work Related</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                orgMode === 'work'
                  ? 'bg-[#120B06]/20 text-[#120B06] font-bold'
                  : 'bg-[#120B06] text-[#CEB7AB] border border-[#CEB7AB]/15'
              }`}
            >
              {stats.workCount}
            </span>
          </button>

          {/* HOME RELATED */}
          <button
            onClick={() => {
              setOrgMode('home');
              setSelectedSubCategory('all');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
              orgMode === 'home'
                ? 'bg-[#CEB7AB] text-[#120B06] font-semibold shadow-xs'
                : 'text-[#A89E97] hover:text-[#FAF4F0] hover:bg-[#64504A]/25'
            }`}
          >
            <Home className={`w-3.5 h-3.5 ${orgMode === 'home' ? 'text-[#120B06]' : 'text-emerald-400'}`} />
            <span>Home Related</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                orgMode === 'home'
                  ? 'bg-[#120B06]/20 text-[#120B06] font-bold'
                  : 'bg-[#120B06] text-[#CEB7AB] border border-[#CEB7AB]/15'
              }`}
            >
              {stats.homeCount}
            </span>
          </button>
        </div>

        {/* Right side: Status Filter & Priority Filter */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Status Buttons */}
          <div className="flex items-center bg-[#120B06]/80 border border-[#CEB7AB]/15 rounded-lg p-0.5">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-2 py-1 rounded cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-[#64504A]/50 text-[#CEB7AB] font-medium'
                  : 'text-[#8A8C8D] hover:text-[#FAF4F0]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-2 py-1 rounded cursor-pointer ${
                filterStatus === 'pending'
                  ? 'bg-[#64504A]/50 text-[#CEB7AB] font-medium'
                  : 'text-[#8A8C8D] hover:text-[#FAF4F0]'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-2 py-1 rounded cursor-pointer ${
                filterStatus === 'completed'
                  ? 'bg-[#64504A]/50 text-[#CEB7AB] font-medium'
                  : 'text-[#8A8C8D] hover:text-[#FAF4F0]'
              }`}
            >
              Completed
            </button>
          </div>

          {/* Priority dropdown */}
          <div className="flex items-center gap-1.5 bg-[#120B06]/80 border border-[#CEB7AB]/15 px-2 py-1 rounded-lg">
            <span className="text-[11px] text-[#A89E97]">Priority:</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-transparent text-[#FAF4F0] font-mono text-[11px] focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#120B06]">All</option>
              <option value="p1" className="bg-[#120B06]">P1 - Highest</option>
              <option value="p2" className="bg-[#120B06]">P2 - High</option>
              <option value="p3" className="bg-[#120B06]">P3 - Focus</option>
              <option value="normal" className="bg-[#120B06]">Backlog</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sub-category Filter Bar (Optional, when browsing Work or Home) */}
      {(orgMode === 'work' || orgMode === 'home') && currentSubCategories.length > 0 && (
        <div className="px-6 py-2 bg-[#120B06]/60 border-b border-[#CEB7AB]/10 flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-[#A89E97] font-mono shrink-0">Filter Category:</span>
          <button
            onClick={() => setSelectedSubCategory('all')}
            className={`px-2.5 py-0.5 rounded-full border cursor-pointer whitespace-nowrap transition-colors ${
              selectedSubCategory === 'all'
                ? 'bg-[#CEB7AB] text-[#120B06] font-semibold border-transparent'
                : 'bg-[#120B06]/80 border-[#CEB7AB]/15 text-[#A89E97] hover:text-[#FAF4F0]'
            }`}
          >
            All Categories
          </button>
          {currentSubCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedSubCategory(cat)}
              className={`px-2.5 py-0.5 rounded-full border cursor-pointer whitespace-nowrap transition-colors ${
                selectedSubCategory === cat
                  ? 'bg-[#CEB7AB] text-[#120B06] font-semibold border-transparent'
                  : 'bg-[#120B06]/80 border-[#CEB7AB]/15 text-[#A89E97] hover:text-[#FAF4F0]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* =========================================================================
          MAIN SCROLLABLE WORKSPACE
         ========================================================================= */}
      <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
        {/* TOP 3 MISSION-CRITICAL FOCUS BANNER (Shown in All, Work, or Home mode when pending focus tasks exist) */}
        {orgMode === 'all' && (
          <div className="p-4 rounded-2xl glass-card border border-[#CEB7AB]/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#CEB7AB]" />
                <h2 className="font-bold text-[#FAF4F0]">
                  Top 3 Mission-Critical Focus
                </h2>
              </div>
              <span className="text-xs text-[#A89E97] font-mono">
                {topFocusTasks.filter((t) => t.completed).length}/
                {Math.min(3, topFocusTasks.length)} Completed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {topFocusTasks.slice(0, 3).map((task) => {
                const prio = priorityMeta[task.priority];
                const domain = getTaskDomain(task);

                return (
                  <div
                    key={task.id}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between text-xs transition-all ${
                      task.completed
                        ? 'bg-[#120B06]/30 border-white/[0.04] opacity-50'
                        : 'glass-subcard hover:border-[#CEB7AB]/35'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${prio.bgClass} ${prio.textClass}`}
                          >
                            {prio.label}
                          </span>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase ${
                              domain === 'home'
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                                : 'bg-[#64504A]/30 text-[#CEB7AB] border-[#CEB7AB]/25'
                            }`}
                          >
                            {domain}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleTask(task.id)}
                          className="text-[#8A8C8D] hover:text-emerald-400 cursor-pointer"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      <h3
                        className={`font-semibold text-xs leading-snug ${
                          task.completed ? 'line-through text-[#8A8C8D]' : 'text-[#FAF4F0]'
                        }`}
                      >
                        {task.title}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#CEB7AB]/10 text-[10px] text-[#A89E97] font-mono mt-2">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#8A8C8D]" />
                        <span>{task.dueDate}</span>
                      </div>
                      {task.linkedFileId && (
                        <button
                          onClick={() => openFile(task.linkedFileId!)}
                          className="text-[#CEB7AB] hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>Spec</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* INLINE CREATE DRAWER */}
        {isAdding && (
          <form
            onSubmit={handleCreate}
            className="p-5 rounded-2xl glass-panel space-y-3 text-xs shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#FAF4F0] flex items-center gap-2">
                <Plus className="w-3.5 h-3.5 text-[#CEB7AB]" />
                <span>Create New Action Item</span>
              </span>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-[#A89E97] hover:text-[#FAF4F0] cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Task description (e.g. Complete quarterly architecture audit, Replace HVAC filter...)"
              autoFocus
              className="w-full px-3 py-2 glass-input rounded-lg placeholder:text-[#8A8C8D]"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
              {/* Domain (Work vs Home) */}
              <div>
                <label className="text-[10px] text-[#A89E97] block mb-1">Domain / Context</label>
                <select
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value as TaskDomain)}
                  className="w-full bg-[#120B06] border border-[#CEB7AB]/20 rounded-lg p-2 text-[#FAF4F0] text-xs focus:outline-none"
                >
                  <option value="work">💼 Work Related</option>
                  <option value="home">🏡 Home Related</option>
                  <option value="personal">👤 Personal</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="text-[10px] text-[#A89E97] block mb-1">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                  className="w-full bg-[#120B06] border border-[#CEB7AB]/20 rounded-lg p-2 text-[#FAF4F0] text-xs focus:outline-none"
                >
                  <option value="p1">P1 - Highest</option>
                  <option value="p2">P2 - High</option>
                  <option value="p3">P3 - Focus</option>
                  <option value="normal">Normal Backlog</option>
                </select>
              </div>

              {/* Associated Project */}
              <div>
                <label className="text-[10px] text-[#A89E97] block mb-1">Associated Project</label>
                <select
                  value={newProjectId}
                  onChange={(e) => setNewProjectId(e.target.value)}
                  className="w-full bg-[#120B06] border border-[#CEB7AB]/20 rounded-lg p-2 text-[#FAF4F0] text-xs focus:outline-none"
                >
                  <option value="">No Project (Standalone)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Strategic Goal */}
              <div>
                <label className="text-[10px] text-[#A89E97] block mb-1">Strategic Goal</label>
                <select
                  value={newGoalId}
                  onChange={(e) => setNewGoalId(e.target.value)}
                  className="w-full bg-[#120B06] border border-[#CEB7AB]/20 rounded-lg p-2 text-[#FAF4F0] text-xs focus:outline-none"
                >
                  <option value="">No Goal</option>
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Due Date & Time Estimate */}
              <div>
                <label className="text-[10px] text-[#A89E97] block mb-1">Due Deadline</label>
                <input
                  type="text"
                  value={newDue}
                  onChange={(e) => setNewDue(e.target.value)}
                  placeholder="Today, 18:00"
                  className="w-full glass-input rounded-lg p-2 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Category / Tag (e.g. Architecture, HVAC, Finance)"
                  className="px-2.5 py-1.5 glass-input rounded-lg text-xs w-56 placeholder:text-[#8A8C8D]"
                />
                <input
                  type="text"
                  value={newTimeEst}
                  onChange={(e) => setNewTimeEst(e.target.value)}
                  placeholder="Est (e.g. 45m)"
                  className="px-2.5 py-1.5 glass-input rounded-lg text-xs w-24 placeholder:text-[#8A8C8D]"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 text-[#A89E97] hover:text-[#FAF4F0] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#CEB7AB] hover:bg-[#DFCCC1] text-[#120B06] rounded-lg font-semibold cursor-pointer shadow-xs active:scale-95 transition-all"
                >
                  Add Task
                </button>
              </div>
            </div>
          </form>
        )}

        {/* =====================================================================
            ORGANIZATION VIEW RENDERING
           ===================================================================== */}

        {orgMode === 'projects' ? (
          /* ===================================================================
              1. ORGANIZED BY PROJECTS
             =================================================================== */
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-[#CEB7AB]/15">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-[#CEB7AB]" />
                <h2 className="text-sm font-bold text-[#FAF4F0]">
                  Tasks Grouped by Active Projects
                </h2>
              </div>
              <span className="text-xs text-[#A89E97] font-mono">
                {projects.length} project tracks
              </span>
            </div>

            {projects.map((proj) => {
              const projTasks = filteredTasks.filter((t) => t.projectId === proj.id);
              const doneCount = projTasks.filter((t) => t.completed).length;

              return (
                <div
                  key={proj.id}
                  className="rounded-2xl glass-card overflow-hidden shadow-sm"
                >
                  {/* Project Section Header */}
                  <div className="px-4 py-3 bg-[#120B06]/85 border-b border-[#CEB7AB]/15 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: proj.color }}
                      />
                      <h3 className="font-bold text-[#FAF4F0] truncate">
                        {proj.title}
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#120B06] text-[#A89E97] border border-[#CEB7AB]/10 uppercase">
                        {proj.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 font-mono text-[11px] text-[#A89E97]">
                        <span>Progress:</span>
                        <div className="w-20 bg-[#120B06] h-1.5 rounded-full overflow-hidden border border-[#CEB7AB]/10">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${proj.progress}%`, backgroundColor: proj.color }}
                          />
                        </div>
                        <span className="text-[#FAF4F0] font-semibold">{proj.progress}%</span>
                      </div>

                      <span className="font-mono text-[11px] text-[#A89E97]">
                        {doneCount}/{projTasks.length} done
                      </span>

                      <button
                        onClick={() => handleOpenAddForContext({ projectId: proj.id })}
                        className="text-xs text-[#CEB7AB] hover:text-[#FAF4F0] font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Task</span>
                      </button>
                    </div>
                  </div>

                  {/* Tasks List */}
                  <div>
                    {projTasks.map((t) => renderTaskRow(t))}
                    {projTasks.length === 0 && (
                      <div className="py-6 text-center text-xs text-[#8A8C8D]">
                        No tasks assigned to this project yet.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Standalone Tasks (Not associated with a project) */}
            {(() => {
              const standaloneTasks = filteredTasks.filter((t) => !t.projectId);
              return (
                <div className="rounded-2xl glass-card overflow-hidden shadow-sm">
                  <div className="px-4 py-3 bg-[#120B06]/85 border-b border-[#CEB7AB]/15 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#8A8C8D]" />
                      <h3 className="font-bold text-[#FAF4F0]">
                        Standalone & Non-Project Tasks
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#120B06] text-[#A89E97] border border-[#CEB7AB]/10">
                        {standaloneTasks.length}
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenAddForContext({})}
                      className="text-xs text-[#CEB7AB] hover:text-[#FAF4F0] font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Task</span>
                    </button>
                  </div>

                  <div>
                    {standaloneTasks.map((t) => renderTaskRow(t))}
                    {standaloneTasks.length === 0 && (
                      <div className="py-6 text-center text-xs text-[#8A8C8D]">
                        All tasks are organized into projects.
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        ) : orgMode === 'goals' ? (
          /* ===================================================================
              2. ORGANIZED BY GOALS
             =================================================================== */
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-[#CEB7AB]/15">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#CEB7AB]" />
                <h2 className="text-sm font-bold text-[#FAF4F0]">
                  Tasks Grouped by Strategic Goals
                </h2>
              </div>
              <span className="text-xs text-[#A89E97] font-mono">
                {goals.length} quarterly targets
              </span>
            </div>

            {goals.map((goal) => {
              const goalTasks = filteredTasks.filter(
                (t) => t.goalId === goal.id || t.goalTitle?.toLowerCase() === goal.title.toLowerCase()
              );
              const doneCount = goalTasks.filter((t) => t.completed).length;
              const goalProgress =
                goalTasks.length > 0 ? Math.round((doneCount / goalTasks.length) * 100) : 0;

              return (
                <div
                  key={goal.id}
                  className="rounded-2xl glass-card overflow-hidden shadow-sm"
                >
                  {/* Goal Header */}
                  <div className="px-4 py-3 bg-[#120B06]/85 border-b border-[#CEB7AB]/15 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: goal.color }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-[#FAF4F0] truncate">
                            {goal.title}
                          </h3>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#120B06] text-[#A89E97] border border-[#CEB7AB]/10">
                            {goal.targetQuarter}
                          </span>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase ${
                              goal.category === 'home'
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                                : 'bg-[#64504A]/30 text-[#CEB7AB] border-[#CEB7AB]/25'
                            }`}
                          >
                            {goal.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#A89E97] mt-0.5 truncate max-w-lg">
                          {goal.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 font-mono text-[11px] text-[#A89E97]">
                        <span>Goal Completion:</span>
                        <div className="w-20 bg-[#120B06] h-1.5 rounded-full overflow-hidden border border-[#CEB7AB]/10">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${goalProgress}%`, backgroundColor: goal.color }}
                          />
                        </div>
                        <span className="text-[#FAF4F0] font-semibold">{goalProgress}%</span>
                      </div>

                      <span className="font-mono text-[11px] text-[#A89E97]">
                        {doneCount}/{goalTasks.length} done
                      </span>

                      <button
                        onClick={() => handleOpenAddForContext({ goalId: goal.id })}
                        className="text-xs text-[#CEB7AB] hover:text-[#FAF4F0] font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Task</span>
                      </button>
                    </div>
                  </div>

                  {/* Tasks List */}
                  <div>
                    {goalTasks.map((t) => renderTaskRow(t))}
                    {goalTasks.length === 0 && (
                      <div className="py-6 text-center text-xs text-[#8A8C8D]">
                        No tasks assigned to this strategic goal yet.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* General Tasks without a goal */}
            {(() => {
              const unassignedTasks = filteredTasks.filter(
                (t) =>
                  !t.goalId &&
                  !goals.some(
                    (g) => g.title.toLowerCase() === (t.goalTitle || '').toLowerCase()
                  )
              );
              return (
                <div className="rounded-2xl glass-card overflow-hidden shadow-sm">
                  <div className="px-4 py-3 bg-[#120B06]/85 border-b border-[#CEB7AB]/15 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#8A8C8D]" />
                      <h3 className="font-bold text-xs md:text-sm text-[#FAF4F0]">
                        General Execution Tasks (No Goal Assigned)
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#120B06] text-[#A89E97] border border-[#CEB7AB]/10">
                        {unassignedTasks.length}
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenAddForContext({})}
                      className="text-xs text-[#CEB7AB] hover:text-[#FAF4F0] font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Task</span>
                    </button>
                  </div>

                  <div>
                    {unassignedTasks.map((t) => renderTaskRow(t))}
                    {unassignedTasks.length === 0 && (
                      <div className="py-6 text-center text-xs text-[#8A8C8D]">
                        All tasks are linked to strategic goals.
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        ) : orgMode === 'work' ? (
          /* ===================================================================
              3. WORK RELATED TASKS
             =================================================================== */
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-[#CEB7AB]/15">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#CEB7AB]" />
                <h2 className="text-sm font-bold text-[#FAF4F0]">
                  Work Related Initiatives & Action Items
                </h2>
              </div>
              <span className="text-xs text-[#A89E97] font-mono">
                {filteredTasks.length} work tasks
              </span>
            </div>

            <div className="rounded-2xl glass-card overflow-hidden shadow-sm">
              {filteredTasks.map((t) => renderTaskRow(t))}
              {filteredTasks.length === 0 && (
                <div className="py-12 text-center text-xs text-[#8A8C8D]">
                  No work-related tasks match current filters.
                </div>
              )}
            </div>
          </div>
        ) : orgMode === 'home' ? (
          /* ===================================================================
              4. HOME RELATED TASKS
             =================================================================== */
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-[#CEB7AB]/15">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-[#FAF4F0]">
                  Home Related, Living & Household Action Items
                </h2>
              </div>
              <span className="text-xs text-[#A89E97] font-mono">
                {filteredTasks.length} home tasks
              </span>
            </div>

            <div className="rounded-2xl glass-card overflow-hidden shadow-sm">
              {filteredTasks.map((t) => renderTaskRow(t))}
              {filteredTasks.length === 0 && (
                <div className="py-12 text-center text-xs text-[#8A8C8D]">
                  No home-related tasks match current filters.
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ===================================================================
              5. ALL TASKS (GENERAL BACKLOG & PRIORITY LIST)
             =================================================================== */
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#A89E97] pb-1">
              <span className="font-mono">
                Showing {filteredTasks.length} of {tasks.length} total tasks
              </span>
              <span className="font-mono text-[11px] text-[#8A8C8D]">
                Sorted by priority & deadline
              </span>
            </div>

            <div className="rounded-2xl glass-card overflow-hidden shadow-sm">
              {filteredTasks.map((t) => renderTaskRow(t))}
              {filteredTasks.length === 0 && (
                <div className="py-12 text-center text-xs text-[#8A8C8D]">
                  No tasks match current filter.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          EDIT TASK MODAL
         ========================================================================= */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg glass-panel rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-[#CEB7AB]/15 flex items-center justify-between bg-[#120B06]/80">
              <h3 className="font-bold text-sm text-[#FAF4F0] flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#CEB7AB]" />
                <span>Edit Task Assignment</span>
              </h3>
              <button
                onClick={() => setEditingTask(null)}
                className="text-[#8A8C8D] hover:text-[#FAF4F0] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#DFCCC1] mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full px-3 py-2 glass-input rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#DFCCC1] mb-1">
                    Domain / Context
                  </label>
                  <select
                    value={editingTask.domain || 'work'}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, domain: e.target.value as TaskDomain })
                    }
                    className="w-full bg-[#120B06] border border-[#CEB7AB]/20 rounded-lg px-2.5 py-2 text-[#FAF4F0] focus:outline-none"
                  >
                    <option value="work">💼 Work Related</option>
                    <option value="home">🏡 Home Related</option>
                    <option value="personal">👤 Personal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#DFCCC1] mb-1">
                    Priority
                  </label>
                  <select
                    value={editingTask.priority}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, priority: e.target.value as TaskPriority })
                    }
                    className="w-full bg-[#120B06] border border-[#CEB7AB]/20 rounded-lg px-2.5 py-2 text-[#FAF4F0] focus:outline-none"
                  >
                    <option value="p1">P1 - Highest</option>
                    <option value="p2">P2 - High</option>
                    <option value="p3">P3 - Focus</option>
                    <option value="normal">Normal Backlog</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#DFCCC1] mb-1">
                    Associated Project
                  </label>
                  <select
                    value={editingTask.projectId || ''}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, projectId: e.target.value || undefined })
                    }
                    className="w-full bg-[#120B06] border border-[#CEB7AB]/20 rounded-lg px-2.5 py-2 text-[#FAF4F0] focus:outline-none"
                  >
                    <option value="">No Project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#DFCCC1] mb-1">
                    Strategic Goal
                  </label>
                  <select
                    value={editingTask.goalId || ''}
                    onChange={(e) => {
                      const g = goals.find((x) => x.id === e.target.value);
                      setEditingTask({
                        ...editingTask,
                        goalId: e.target.value || undefined,
                        goalTitle: g?.title || undefined,
                      });
                    }}
                    className="w-full bg-[#120B06] border border-[#CEB7AB]/20 rounded-lg px-2.5 py-2 text-[#FAF4F0] focus:outline-none"
                  >
                    <option value="">No Goal</option>
                    {goals.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#DFCCC1] mb-1">
                    Due Date
                  </label>
                  <input
                    type="text"
                    value={editingTask.dueDate}
                    onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                    className="w-full glass-input rounded-lg px-2.5 py-1.5"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#DFCCC1] mb-1">
                    Time Estimate
                  </label>
                  <input
                    type="text"
                    value={editingTask.timeEstimate || ''}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, timeEstimate: e.target.value })
                    }
                    placeholder="30m"
                    className="w-full glass-input rounded-lg px-2.5 py-1.5"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#DFCCC1] mb-1">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    value={editingTask.category || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, category: e.target.value })}
                    placeholder="Engineering"
                    className="w-full glass-input rounded-lg px-2.5 py-1.5"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#CEB7AB]/10">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-3.5 py-1.5 text-[#A89E97] hover:text-[#FAF4F0] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#CEB7AB] hover:bg-[#DFCCC1] text-[#120B06] font-semibold rounded-lg shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
