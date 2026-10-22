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
  Trophy,
  Layers,
  Search,
  X,
  Edit2,
  FolderGit2,
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

  // Active Organization Mode
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

  // Priority metadata mapping in single Rose & Silk palette
  const priorityMeta: Record<
    TaskPriority,
    { label: string; textClass: string; bgClass: string; borderClass: string }
  > = {
    p1: {
      label: 'P1 Focus',
      textClass: 'text-[#382629]',
      bgClass: 'bg-[#DF9FA8]/30',
      borderClass: 'border-[#DF9FA8]/50',
    },
    p2: {
      label: 'P2 High',
      textClass: 'text-[#382629]',
      bgClass: 'bg-[#D4AA8C]/30',
      borderClass: 'border-[#D4AA8C]/50',
    },
    p3: {
      label: 'P3 Core',
      textClass: 'text-[#382629]',
      bgClass: 'bg-[#DF9FA8]/20',
      borderClass: 'border-[#DF9FA8]/35',
    },
    normal: {
      label: 'Normal',
      textClass: 'text-[#382629]/70',
      bgClass: 'bg-white/60',
      borderClass: 'border-[#382629]/15',
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

  // Render a single task row item with clear, high-contrast rosewood text
  const renderTaskRow = (task: TaskItem) => {
    const prio = priorityMeta[task.priority];
    const project = projects.find((p) => p.id === task.projectId);
    const domain = getTaskDomain(task);

    return (
      <div
        key={task.id}
        className="p-3.5 hover:bg-[#DF9FA8]/15 transition-colors flex items-center justify-between gap-3 text-xs group border-b border-[#382629]/10 last:border-b-0"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={() => toggleTask(task.id)}
            className="text-[#382629]/40 hover:text-[#C97D8B] cursor-pointer shrink-0 transition-transform active:scale-90"
            title={task.completed ? 'Mark incomplete' : 'Mark complete'}
          >
            {task.completed ? (
              <CheckCircle2 className="w-4 h-4 text-[#C97D8B]" />
            ) : (
              <Circle className="w-4 h-4 text-[#382629]/35 group-hover:text-[#382629]" />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`font-semibold text-xs ${
                  task.completed ? 'line-through text-[#382629]/40' : 'text-[#382629]'
                }`}
              >
                {task.title}
              </span>

              {/* Domain tag */}
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase tracking-wider bg-[#DF9FA8]/20 text-[#382629] border-[#DF9FA8]/30">
                {domain === 'home' ? 'Home' : 'Work'}
              </span>

              {/* Category tag */}
              {task.category && (
                <span className="text-[10px] font-mono text-[#382629]/70 bg-white/70 px-1.5 py-0.2 rounded border border-[#DF9FA8]/25">
                  {task.category}
                </span>
              )}
            </div>

            {/* Contextual Sub-line */}
            <div className="flex items-center gap-2 mt-1 text-[11px] text-[#382629]/65 font-mono flex-wrap">
              <span className="flex items-center gap-1 text-[#382629]/70">
                <Clock className="w-3 h-3 text-[#C97D8B] shrink-0" />
                <span>{task.dueDate}</span>
              </span>

              {task.timeEstimate && (
                <>
                  <span>·</span>
                  <span>{task.timeEstimate}</span>
                </>
              )}

              {project && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-[#382629] font-medium truncate max-w-[150px]">
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
                  <span>·</span>
                  <span className="text-[#C97D8B] truncate max-w-[180px] flex items-center gap-1 font-medium">
                    <Trophy className="w-2.5 h-2.5 shrink-0 text-[#C97D8B]" />
                    <span className="truncate">{task.goalTitle}</span>
                  </span>
                </>
              )}

              {task.linkedFileId && (
                <>
                  <span>·</span>
                  <button
                    onClick={() => openFile(task.linkedFileId!)}
                    className="text-[#C97D8B] hover:text-[#382629] hover:underline flex items-center gap-0.5 cursor-pointer font-medium"
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
            <option value="p1">P1 Focus</option>
            <option value="p2">P2 High</option>
            <option value="p3">P3 Core</option>
            <option value="normal">Normal</option>
          </select>

          <button
            onClick={() => setEditingTask(task)}
            className="p-1 text-[#382629]/50 hover:text-[#382629] rounded hover:bg-[#DF9FA8]/20 transition-colors cursor-pointer"
            title="Edit task"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => deleteTask(task.id)}
            className="p-1 text-[#382629]/40 hover:text-rose-500 rounded hover:bg-[#DF9FA8]/20 transition-colors cursor-pointer"
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
      {/* =========================================================================
          TOP HEADER: High-Priority Tasks Matrix (Styled in Liquid Glass Rose & Silk)
         ========================================================================= */}
      <div className="px-6 py-4 border-b border-[#382629]/10 bg-white/60 backdrop-blur-xl shrink-0 shadow-[0_2px_12px_rgba(56,38,41,0.03)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-sm md:text-base font-bold text-[#382629] tracking-tight">
                High-Priority Tasks Matrix
              </h1>
            </div>
            <p className="text-xs text-[#382629]/70 mt-1">
              Multi-dimensional task organization: prioritize by Top 3 Focus, Projects, Goals, Work, and Home.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Search */}
            <div className="relative w-48 md:w-64">
              <Search className="w-3.5 h-3.5 text-[#382629]/40 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks, projects, goals..."
                className="w-full pl-8 pr-7 py-1.5 glass-input rounded-lg text-xs placeholder:text-[#382629]/40 text-[#382629] border-[#DF9FA8]/30 focus:border-[#C97D8B]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#382629]/50 hover:text-[#382629]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Create Task Button */}
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#DF9FA8] to-[#C97D8B] hover:brightness-105 text-white text-xs font-semibold shadow-md shadow-[#C97D8B]/20 cursor-pointer shrink-0 transition-all active:scale-95"
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
      <div className="px-6 py-2.5 border-b border-[#382629]/10 bg-white/40 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Left: Organization Mode Tabs */}
        <div className="flex items-center gap-1 bg-white/60 border border-[#DF9FA8]/30 p-1 rounded-xl text-xs overflow-x-auto max-w-full shadow-sm">
          <button
            onClick={() => {
              setOrgMode('all');
              setSelectedSubCategory('all');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
              orgMode === 'all'
                ? 'bg-[#C97D8B] text-white font-semibold shadow-xs'
                : 'text-[#382629]/70 hover:text-[#382629] hover:bg-[#DF9FA8]/15'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Tasks</span>
          </button>

          <button
            onClick={() => {
              setOrgMode('projects');
              setSelectedSubCategory('all');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
              orgMode === 'projects'
                ? 'bg-[#C97D8B] text-white font-semibold shadow-xs'
                : 'text-[#382629]/70 hover:text-[#382629] hover:bg-[#DF9FA8]/15'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>By Projects</span>
          </button>

          <button
            onClick={() => {
              setOrgMode('goals');
              setSelectedSubCategory('all');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
              orgMode === 'goals'
                ? 'bg-[#C97D8B] text-white font-semibold shadow-xs'
                : 'text-[#382629]/70 hover:text-[#382629] hover:bg-[#DF9FA8]/15'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>By Goals</span>
          </button>

          <button
            onClick={() => {
              setOrgMode('work');
              setSelectedSubCategory('all');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
              orgMode === 'work'
                ? 'bg-[#C97D8B] text-white font-semibold shadow-xs'
                : 'text-[#382629]/70 hover:text-[#382629] hover:bg-[#DF9FA8]/15'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Work Related</span>
          </button>

          <button
            onClick={() => {
              setOrgMode('home');
              setSelectedSubCategory('all');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
              orgMode === 'home'
                ? 'bg-[#C97D8B] text-white font-semibold shadow-xs'
                : 'text-[#382629]/70 hover:text-[#382629] hover:bg-[#DF9FA8]/15'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home Related</span>
          </button>
        </div>

        {/* Right side: Status Filter & Priority Filter */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center bg-white/60 border border-[#DF9FA8]/30 rounded-lg p-0.5">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                filterStatus === 'all'
                  ? 'bg-[#C97D8B] text-white font-medium shadow-xs'
                  : 'text-[#382629]/70 hover:text-[#382629]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                filterStatus === 'pending'
                  ? 'bg-[#C97D8B] text-white font-medium shadow-xs'
                  : 'text-[#382629]/70 hover:text-[#382629]'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                filterStatus === 'completed'
                  ? 'bg-[#C97D8B] text-white font-medium shadow-xs'
                  : 'text-[#382629]/70 hover:text-[#382629]'
              }`}
            >
              Completed
            </button>
          </div>

          <div className="flex items-center gap-1 bg-white/60 border border-[#DF9FA8]/30 px-2 py-1 rounded-lg">
            <span className="text-[11px] text-[#382629]/70">Priority:</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-transparent text-[#382629] font-mono text-[11px] focus:outline-none cursor-pointer"
            >
              <option value="all">All</option>
              <option value="p1">P1 Focus</option>
              <option value="p2">P2 High</option>
              <option value="p3">P3 Core</option>
              <option value="normal">Normal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sub-category Filter Bar (Optional, when browsing Work or Home) */}
      {(orgMode === 'work' || orgMode === 'home') && currentSubCategories.length > 0 && (
        <div className="px-6 py-2 bg-white/40 border-b border-[#382629]/10 flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-[#382629]/70 font-mono shrink-0">Filter Category:</span>
          <button
            onClick={() => setSelectedSubCategory('all')}
            className={`px-2.5 py-0.5 rounded-full border cursor-pointer whitespace-nowrap transition-colors ${
              selectedSubCategory === 'all'
                ? 'bg-[#C97D8B] text-white font-semibold border-transparent shadow-xs'
                : 'bg-white/60 border-[#DF9FA8]/30 text-[#382629]/70 hover:text-[#382629]'
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
                  ? 'bg-[#C97D8B] text-white font-semibold border-transparent shadow-xs'
                  : 'bg-white/60 border-[#DF9FA8]/30 text-[#382629]/70 hover:text-[#382629]'
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
        {/* TOP 3 MISSION-CRITICAL FOCUS BANNER (High-Contrast, Visible Rosewood Text) */}
        {orgMode === 'all' && (
          <div className="p-4 rounded-2xl glass-card border border-white/80 space-y-3 bg-white/70 shadow-sm">
            <div className="flex items-center justify-between pb-1 border-b border-[#382629]/10">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#C97D8B]" />
                <h2 className="font-bold text-sm text-[#382629]">
                  Top 3 Mission-Critical Focus
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {topFocusTasks.slice(0, 3).map((task) => {
                const prio = priorityMeta[task.priority];
                const domain = getTaskDomain(task);

                return (
                  <div
                    key={task.id}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between text-xs transition-all backdrop-blur-md ${
                      task.completed
                        ? 'bg-white/40 border-white/60 opacity-60 shadow-xs'
                        : 'bg-white/80 hover:bg-white border-white/90 hover:border-[#DF9FA8]/50 shadow-sm'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${prio.bgClass} ${prio.textClass} ${prio.borderClass}`}
                          >
                            {prio.label}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase bg-[#DF9FA8]/20 text-[#382629] border-[#DF9FA8]/30">
                            {domain}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleTask(task.id)}
                          className="text-[#382629]/40 hover:text-[#C97D8B] cursor-pointer"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-[#C97D8B]" />
                          ) : (
                            <Circle className="w-4 h-4 text-[#382629]/35 hover:text-[#382629]" />
                          )}
                        </button>
                      </div>

                      <h3
                        className={`font-semibold text-xs leading-snug ${
                          task.completed ? 'line-through text-[#382629]/40' : 'text-[#382629]'
                        }`}
                      >
                        {task.title}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#382629]/10 text-[10px] text-[#382629]/65 font-mono mt-2">
                      <div className="flex items-center gap-1 text-[#382629]/70">
                        <Clock className="w-3 h-3 text-[#C97D8B]" />
                        <span>{task.dueDate}</span>
                      </div>
                      {task.linkedFileId && (
                        <button
                          onClick={() => openFile(task.linkedFileId!)}
                          className="text-[#C97D8B] hover:text-[#382629] hover:underline flex items-center gap-0.5 cursor-pointer font-medium"
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
            className="p-5 rounded-2xl glass-panel space-y-3 text-xs shadow-xl border border-white/80 bg-white/85"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#382629] flex items-center gap-2">
                <Plus className="w-3.5 h-3.5 text-[#C97D8B]" />
                <span>Create New Action Item</span>
              </span>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-[#382629]/60 hover:text-[#382629] cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Task description..."
              autoFocus
              className="w-full px-3 py-2 glass-input rounded-lg text-[#382629] placeholder:text-[#382629]/40"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
              <div>
                <label className="text-[10px] text-[#382629]/70 block mb-1">Domain / Context</label>
                <select
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value as TaskDomain)}
                  className="w-full bg-white/80 border border-[#DF9FA8]/30 rounded-lg p-2 text-[#382629] text-xs focus:outline-none"
                >
                  <option value="work">💼 Work Related</option>
                  <option value="home">🏡 Home Related</option>
                  <option value="personal">👤 Personal</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-[#382629]/70 block mb-1">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                  className="w-full bg-white/80 border border-[#DF9FA8]/30 rounded-lg p-2 text-[#382629] text-xs focus:outline-none"
                >
                  <option value="p1">P1 - Highest</option>
                  <option value="p2">P2 - High</option>
                  <option value="p3">P3 - Focus</option>
                  <option value="normal">Normal Backlog</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-[#382629]/70 block mb-1">Associated Project</label>
                <select
                  value={newProjectId}
                  onChange={(e) => setNewProjectId(e.target.value)}
                  className="w-full bg-white/80 border border-[#DF9FA8]/30 rounded-lg p-2 text-[#382629] text-xs focus:outline-none"
                >
                  <option value="">No Project (Standalone)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-[#382629]/70 block mb-1">Strategic Goal</label>
                <select
                  value={newGoalId}
                  onChange={(e) => setNewGoalId(e.target.value)}
                  className="w-full bg-white/80 border border-[#DF9FA8]/30 rounded-lg p-2 text-[#382629] text-xs focus:outline-none"
                >
                  <option value="">No Goal</option>
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-[#382629]/70 block mb-1">Due Deadline</label>
                <input
                  type="text"
                  value={newDue}
                  onChange={(e) => setNewDue(e.target.value)}
                  placeholder="Today, 18:00"
                  className="w-full glass-input rounded-lg p-2 text-xs text-[#382629]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Category (e.g. Architecture)"
                  className="px-2.5 py-1.5 glass-input rounded-lg text-xs w-56 placeholder:text-[#382629]/40 text-[#382629]"
                />
                <input
                  type="text"
                  value={newTimeEst}
                  onChange={(e) => setNewTimeEst(e.target.value)}
                  placeholder="Est (e.g. 45m)"
                  className="px-2.5 py-1.5 glass-input rounded-lg text-xs w-24 placeholder:text-[#382629]/40 text-[#382629]"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 text-[#382629]/60 hover:text-[#382629] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-gradient-to-r from-[#DF9FA8] to-[#C97D8B] hover:brightness-105 text-white rounded-lg font-semibold cursor-pointer shadow-xs active:scale-95 transition-all"
                >
                  Add Task
                </button>
              </div>
            </div>
          </form>
        )}

        {/* =====================================================================
            ORGANIZATION VIEW RENDERING (ALL, PROJECTS, GOALS, WORK, HOME)
           ===================================================================== */}

        {orgMode === 'projects' ? (
          /* 1. ORGANIZED BY PROJECTS */
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-[#382629]/10">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-[#C97D8B]" />
                <h2 className="text-sm font-bold text-[#382629]">
                  Tasks Grouped by Active Projects
                </h2>
              </div>
            </div>

            {projects.map((proj) => {
              const projTasks = filteredTasks.filter((t) => t.projectId === proj.id);

              return (
                <div
                  key={proj.id}
                  className="rounded-2xl glass-card overflow-hidden shadow-sm border border-white/60 bg-white/70"
                >
                  <div className="px-4 py-3 bg-white/80 border-b border-[#382629]/10 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: proj.color }}
                      />
                      <h3 className="font-bold text-[#382629] truncate">
                        {proj.title}
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#DF9FA8]/20 text-[#382629]/80 border border-[#DF9FA8]/30 uppercase">
                        {proj.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleOpenAddForContext({ projectId: proj.id })}
                        className="text-xs text-[#C97D8B] hover:text-[#382629] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Task</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    {projTasks.map((t) => renderTaskRow(t))}
                    {projTasks.length === 0 && (
                      <div className="py-6 text-center text-xs text-[#382629]/50">
                        No tasks assigned to this project yet.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Standalone Tasks */}
            {(() => {
              const standaloneTasks = filteredTasks.filter((t) => !t.projectId);
              return (
                <div className="rounded-2xl glass-card overflow-hidden shadow-sm border border-white/60 bg-white/70">
                  <div className="px-4 py-3 bg-white/80 border-b border-[#382629]/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#C97D8B]" />
                      <h3 className="font-bold text-[#382629]">
                        Standalone Tasks
                      </h3>
                    </div>

                    <button
                      onClick={() => handleOpenAddForContext({})}
                      className="text-xs text-[#C97D8B] hover:text-[#382629] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Task</span>
                    </button>
                  </div>

                  <div>
                    {standaloneTasks.map((t) => renderTaskRow(t))}
                    {standaloneTasks.length === 0 && (
                      <div className="py-6 text-center text-xs text-[#382629]/50">
                        All tasks are organized into projects.
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        ) : orgMode === 'goals' ? (
          /* 2. ORGANIZED BY GOALS */
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-[#382629]/10">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#C97D8B]" />
                <h2 className="text-sm font-bold text-[#382629]">
                  Tasks Grouped by Strategic Goals
                </h2>
              </div>
            </div>

            {goals.map((goal) => {
              const goalTasks = filteredTasks.filter(
                (t) => t.goalId === goal.id || t.goalTitle?.toLowerCase() === goal.title.toLowerCase()
              );

              return (
                <div
                  key={goal.id}
                  className="rounded-2xl glass-card overflow-hidden shadow-sm border border-white/60 bg-white/70"
                >
                  <div className="px-4 py-3 bg-white/80 border-b border-[#382629]/10 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: goal.color }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-[#382629] truncate">
                            {goal.title}
                          </h3>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#DF9FA8]/20 text-[#382629]/80 border border-[#DF9FA8]/30">
                            {goal.targetQuarter}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#382629]/70 mt-0.5 truncate max-w-lg">
                          {goal.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleOpenAddForContext({ goalId: goal.id })}
                        className="text-xs text-[#C97D8B] hover:text-[#382629] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Task</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    {goalTasks.map((t) => renderTaskRow(t))}
                    {goalTasks.length === 0 && (
                      <div className="py-6 text-center text-xs text-[#382629]/50">
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
                <div className="rounded-2xl glass-card overflow-hidden shadow-sm border border-white/60 bg-white/70">
                  <div className="px-4 py-3 bg-white/80 border-b border-[#382629]/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#C97D8B]" />
                      <h3 className="font-bold text-xs md:text-sm text-[#382629]">
                        General Tasks
                      </h3>
                    </div>

                    <button
                      onClick={() => handleOpenAddForContext({})}
                      className="text-xs text-[#C97D8B] hover:text-[#382629] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Task</span>
                    </button>
                  </div>

                  <div>
                    {unassignedTasks.map((t) => renderTaskRow(t))}
                    {unassignedTasks.length === 0 && (
                      <div className="py-6 text-center text-xs text-[#382629]/50">
                        All tasks are linked to strategic goals.
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        ) : orgMode === 'work' ? (
          /* 3. WORK RELATED TASKS */
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-[#382629]/10">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#C97D8B]" />
                <h2 className="text-sm font-bold text-[#382629]">
                  Work Related Initiatives & Action Items
                </h2>
              </div>
            </div>

            <div className="rounded-2xl glass-card overflow-hidden shadow-sm border border-white/60 bg-white/70">
              {filteredTasks.map((t) => renderTaskRow(t))}
              {filteredTasks.length === 0 && (
                <div className="py-12 text-center text-xs text-[#382629]/50">
                  No work-related tasks match current filters.
                </div>
              )}
            </div>
          </div>
        ) : orgMode === 'home' ? (
          /* 4. HOME RELATED TASKS */
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-[#382629]/10">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-[#C97D8B]" />
                <h2 className="text-sm font-bold text-[#382629]">
                  Home Related Action Items
                </h2>
              </div>
            </div>

            <div className="rounded-2xl glass-card overflow-hidden shadow-sm border border-white/60 bg-white/70">
              {filteredTasks.map((t) => renderTaskRow(t))}
              {filteredTasks.length === 0 && (
                <div className="py-12 text-center text-xs text-[#382629]/50">
                  No home-related tasks match current filters.
                </div>
              )}
            </div>
          </div>
        ) : (
          /* 5. ALL TASKS */
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#382629]/60 pb-1">
              <span className="font-medium">
                Action Items
              </span>
              <span className="text-[11px] text-[#382629]/50">
                Sorted by priority & deadline
              </span>
            </div>

            <div className="rounded-2xl glass-card overflow-hidden shadow-sm border border-white/60 bg-white/70">
              {filteredTasks.map((t) => renderTaskRow(t))}
              {filteredTasks.length === 0 && (
                <div className="py-12 text-center text-xs text-[#382629]/50">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg glass-panel rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-white/80 bg-white/85">
            <div className="px-5 py-4 border-b border-[#382629]/10 flex items-center justify-between bg-white/60">
              <h3 className="font-bold text-sm text-[#382629] flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#C97D8B]" />
                <span>Edit Task Assignment</span>
              </h3>
              <button
                onClick={() => setEditingTask(null)}
                className="text-[#382629]/50 hover:text-[#382629] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#382629] mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full px-3 py-2 glass-input rounded-lg text-[#382629]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#382629] mb-1">
                    Domain / Context
                  </label>
                  <select
                    value={editingTask.domain || 'work'}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, domain: e.target.value as TaskDomain })
                    }
                    className="w-full bg-white/80 border border-[#DF9FA8]/30 rounded-lg px-2.5 py-2 text-[#382629] focus:outline-none"
                  >
                    <option value="work">💼 Work Related</option>
                    <option value="home">🏡 Home Related</option>
                    <option value="personal">👤 Personal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#382629] mb-1">
                    Priority
                  </label>
                  <select
                    value={editingTask.priority}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, priority: e.target.value as TaskPriority })
                    }
                    className="w-full bg-white/80 border border-[#DF9FA8]/30 rounded-lg px-2.5 py-2 text-[#382629] focus:outline-none"
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
                  <label className="block text-[11px] font-semibold text-[#382629] mb-1">
                    Associated Project
                  </label>
                  <select
                    value={editingTask.projectId || ''}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, projectId: e.target.value || undefined })
                    }
                    className="w-full bg-white/80 border border-[#DF9FA8]/30 rounded-lg px-2.5 py-2 text-[#382629] focus:outline-none"
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
                  <label className="block text-[11px] font-semibold text-[#382629] mb-1">
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
                    className="w-full bg-white/80 border border-[#DF9FA8]/30 rounded-lg px-2.5 py-2 text-[#382629] focus:outline-none"
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
                  <label className="block text-[11px] font-semibold text-[#382629] mb-1">
                    Due Date
                  </label>
                  <input
                    type="text"
                    value={editingTask.dueDate}
                    onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                    className="w-full glass-input rounded-lg px-2.5 py-1.5 text-[#382629]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#382629] mb-1">
                    Time Estimate
                  </label>
                  <input
                    type="text"
                    value={editingTask.timeEstimate || ''}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, timeEstimate: e.target.value })
                    }
                    placeholder="30m"
                    className="w-full glass-input rounded-lg px-2.5 py-1.5 text-[#382629]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#382629] mb-1">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    value={editingTask.category || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, category: e.target.value })}
                    placeholder="Engineering"
                    className="w-full glass-input rounded-lg px-2.5 py-1.5 text-[#382629]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#382629]/10">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-3.5 py-1.5 text-[#382629]/60 hover:text-[#382629] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-gradient-to-r from-[#DF9FA8] to-[#C97D8B] hover:brightness-105 text-white font-semibold rounded-lg shadow-xs cursor-pointer active:scale-95 transition-all"
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
