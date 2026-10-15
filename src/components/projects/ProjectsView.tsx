import React, { useState, useMemo } from 'react';
import {
  Target,
  Plus,
  CheckCircle2,
  Circle,
  FileText,
  Calendar,
  Layers,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Trash2,
  Kanban,
  LayoutGrid,
  List,
  Search,
  X,
  Edit2,
  Paperclip,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useOS } from '../../store/useOSStore';
import { ProjectItem } from '../../types';

// Stage Views requested by user: ALL Projects, Completed Projects, etc. or Grouped by Status/Stage
export type ProjectStageView = 'all' | 'active' | 'in_review' | 'completed' | 'on_hold' | 'grouped';
export type ProjectLayoutMode = 'cards' | 'board' | 'table';

const STATUS_CONFIG: Record<
  ProjectItem['status'],
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  active: {
    label: 'In Flight / Active',
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-300',
    border: 'border-indigo-500/20',
    dot: 'bg-indigo-400',
  },
  in_review: {
    label: 'In Review & QA',
    bg: 'bg-amber-500/10',
    text: 'text-amber-300',
    border: 'border-amber-500/20',
    dot: 'bg-amber-400',
  },
  completed: {
    label: 'Shipped / Completed',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-300',
    border: 'border-emerald-500/20',
    dot: 'bg-emerald-400',
  },
  on_hold: {
    label: 'Backlog / On Hold',
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    border: 'border-slate-500/20',
    dot: 'bg-slate-400',
  },
};

const PRIORITY_CONFIG: Record<
  ProjectItem['priority'],
  { label: string; bg: string }
> = {
  high: { label: 'High Priority', bg: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
  medium: { label: 'Medium', bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  low: { label: 'Low', bg: 'bg-slate-500/15 text-slate-300 border-slate-500/30' },
};

export const ProjectsView: React.FC = () => {
  const {
    projects,
    createProject,
    updateProject,
    deleteProject,
    toggleKeyResult,
    openFile,
    files,
  } = useOS();

  // Stage View: 'all' | 'active' | 'in_review' | 'completed' | 'on_hold' | 'grouped'
  const [stageView, setStageView] = useState<ProjectStageView>('all');
  // Layout Mode: 'cards' | 'board' | 'table'
  const [layoutMode, setLayoutMode] = useState<ProjectLayoutMode>('cards');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  // Form fields
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('Engineering');
  const [formStatus, setFormStatus] = useState<ProjectItem['status']>('active');
  const [formPriority, setFormPriority] = useState<ProjectItem['priority']>('high');
  const [formColor, setFormColor] = useState('#6366F1');
  const [formTargetDate, setFormTargetDate] = useState('Nov 15, 2026');
  const [formKeyResults, setFormKeyResults] = useState<{ id: string; text: string; done: boolean }[]>([
    { id: 'kr-1', text: 'Initial technical scoping & architecture spec', done: true },
    { id: 'kr-2', text: 'Core implementation & quality assurance review', done: false },
  ]);
  const [formNewKrText, setFormNewKrText] = useState('');
  const [formSelectedFileIds, setFormSelectedFileIds] = useState<string[]>([]);

  // Drag and drop state for board
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ProjectItem['status'] | null>(null);

  // Categories list
  const allCategories = useMemo(() => {
    const defaultCats = ['Engineering', 'Design', 'Research', 'Operations'];
    const customCats = projects.map((p) => p.category);
    return Array.from(new Set([...defaultCats, ...customCats]));
  }, [projects]);

  // Overall metric counts (calculated before stage filter)
  const stats = useMemo(() => {
    const active = projects.filter((p) => p.status === 'active').length;
    const inReview = projects.filter((p) => p.status === 'in_review').length;
    const completed = projects.filter((p) => p.status === 'completed').length;
    const onHold = projects.filter((p) => p.status === 'on_hold').length;
    const avgProgress =
      projects.length > 0
        ? Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length)
        : 0;
    return { active, inReview, completed, onHold, total: projects.length, avgProgress };
  }, [projects]);

  // Filtered projects based on search, category, priority, and stage view
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.keyResults.some((kr) => kr.text.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = selectedCategory === 'all' || project.category === selectedCategory;
      const matchesPriority = selectedPriority === 'all' || project.priority === selectedPriority;

      // Stage view filter: if 'grouped' or 'all', don't filter by status here; otherwise filter to specific status
      const matchesStage =
        stageView === 'all' ||
        stageView === 'grouped' ||
        project.status === stageView;

      return matchesSearch && matchesCat && matchesPriority && matchesStage;
    });
  }, [projects, searchQuery, selectedCategory, selectedPriority, stageView]);

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingProjectId(null);
    setFormTitle('');
    setFormDescription('');
    setFormCategory('Engineering');
    setFormStatus(stageView !== 'all' && stageView !== 'grouped' ? stageView : 'active');
    setFormPriority('high');
    setFormColor('#6366F1');
    setFormTargetDate('Nov 20, 2026');
    setFormKeyResults([
      { id: 'kr-init-1', text: 'System architecture definition', done: true },
      { id: 'kr-init-2', text: 'Implementation and telemetry verification', done: false },
    ]);
    setFormSelectedFileIds([]);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (project: ProjectItem) => {
    setEditingProjectId(project.id);
    setFormTitle(project.title);
    setFormDescription(project.description);
    setFormCategory(project.category);
    setFormStatus(project.status);
    setFormPriority(project.priority);
    setFormColor(project.color);
    setFormTargetDate(project.targetDate);
    setFormKeyResults([...project.keyResults]);
    setFormSelectedFileIds([...project.fileIds]);
    setIsModalOpen(true);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const completedKrs = formKeyResults.filter((kr) => kr.done).length;
    const calculatedProgress =
      formKeyResults.length > 0
        ? Math.round((completedKrs / formKeyResults.length) * 100)
        : 50;

    if (editingProjectId) {
      updateProject(editingProjectId, {
        title: formTitle.trim(),
        description: formDescription.trim(),
        category: formCategory,
        status: formStatus,
        priority: formPriority,
        color: formColor,
        targetDate: formTargetDate.trim(),
        keyResults: formKeyResults,
        fileIds: formSelectedFileIds,
        progress: calculatedProgress,
      });
    } else {
      createProject({
        title: formTitle.trim(),
        description: formDescription.trim(),
        category: formCategory,
        status: formStatus,
        priority: formPriority,
        color: formColor,
        targetDate: formTargetDate.trim(),
        keyResults: formKeyResults,
        fileIds: formSelectedFileIds,
        progress: calculatedProgress,
      });
    }

    setIsModalOpen(false);
  };

  const handleAddKeyResult = () => {
    if (!formNewKrText.trim()) return;
    setFormKeyResults((prev) => [
      ...prev,
      { id: 'kr-' + Date.now(), text: formNewKrText.trim(), done: false },
    ]);
    setFormNewKrText('');
  };

  const handleRemoveKeyResult = (id: string) => {
    setFormKeyResults((prev) => prev.filter((kr) => kr.id !== id));
  };

  // Stage sections definitions
  const stageSections: { status: ProjectItem['status']; label: string; count: number }[] = [
    { status: 'active', label: 'In Flight / Active', count: stats.active },
    { status: 'in_review', label: 'In Review & QA', count: stats.inReview },
    { status: 'completed', label: 'Shipped / Completed', count: stats.completed },
    { status: 'on_hold', label: 'Backlog / On Hold', count: stats.onHold },
  ];

  // Drag and drop handlers for Board
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedProjectId(id);
  };

  const handleDragOver = (e: React.DragEvent, status: ProjectItem['status']) => {
    e.preventDefault();
    setDragOverColumn(status);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: ProjectItem['status']) => {
    e.preventDefault();
    setDragOverColumn(null);
    const id = e.dataTransfer.getData('text/plain') || draggedProjectId;
    if (id) {
      updateProject(id, { status: targetStatus });
    }
    setDraggedProjectId(null);
  };

  // Quick move column step
  const handleStepColumn = (project: ProjectItem, direction: 'left' | 'right') => {
    const statuses: ProjectItem['status'][] = ['on_hold', 'active', 'in_review', 'completed'];
    const currentIndex = statuses.indexOf(project.status);
    if (direction === 'left' && currentIndex > 0) {
      updateProject(project.id, { status: statuses[currentIndex - 1] });
    } else if (direction === 'right' && currentIndex < statuses.length - 1) {
      updateProject(project.id, { status: statuses[currentIndex + 1] });
    }
  };

  // =========================================================================
  // SMALLER / COMPACT PROJECT CARD COMPONENT
  // =========================================================================
  const renderCompactCard = (project: ProjectItem) => {
    const linkedDocs = files.filter((f) => project.fileIds.includes(f.id));
    const completedKrs = project.keyResults.filter((kr) => kr.done).length;

    return (
      <div
        key={project.id}
        className="p-3.5 rounded-xl glass-card hover:border-[#CEB7AB]/35 transition-all flex flex-col justify-between group shadow-xs relative overflow-hidden"
      >
        {/* Subtle accent color bar on top */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5 opacity-80"
          style={{ backgroundColor: project.color }}
        />

        {/* Top: Accent, Domain, Priority, and Quick Actions */}
        <div>
          <div className="flex items-center justify-between gap-1.5 mb-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: project.color }}
              />
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#A89E97] bg-[#120B06]/70 px-1.5 py-0.5 rounded border border-[#CEB7AB]/10 truncate">
                {project.category}
              </span>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${
                  PRIORITY_CONFIG[project.priority].bg
                }`}
              >
                {project.priority.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                onClick={() => handleOpenEditModal(project)}
                className="p-1 text-[#8A8C8D] hover:text-[#FAF4F0] rounded hover:bg-[#64504A]/30 transition-colors"
                title="Edit Project"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                onClick={() => deleteProject(project.id)}
                className="p-1 text-[#8A8C8D] hover:text-rose-400 rounded hover:bg-[#64504A]/30 transition-colors"
                title="Archive Project"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Title & Short Description */}
          <h3
            onClick={() => handleOpenEditModal(project)}
            className="font-semibold text-xs md:text-sm text-[#FAF4F0] hover:text-[#CEB7AB] transition-colors cursor-pointer line-clamp-1"
          >
            {project.title}
          </h3>
          {project.description && (
            <p className="text-[11px] text-[#A89E97] mt-1 line-clamp-1 leading-snug">
              {project.description}
            </p>
          )}
        </div>

        {/* Middle: Progress Meter & Compact Key Results */}
        <div className="my-2.5 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#A89E97]">
            <span>Progress</span>
            <span className="font-semibold text-[#FAF4F0] tabular-nums">
              {project.progress}%
            </span>
          </div>
          <div className="w-full bg-[#120B06] h-1.5 rounded-full overflow-hidden border border-[#CEB7AB]/10">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${project.progress}%`,
                backgroundColor: project.color,
              }}
            />
          </div>

          {/* Compact Key Results Preview */}
          {project.keyResults.length > 0 && (
            <div className="pt-1.5 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#A89E97]">
                <span>Key Results</span>
                <span className="tabular-nums">
                  {completedKrs}/{project.keyResults.length}
                </span>
              </div>
              <div className="space-y-0.5">
                {project.keyResults.slice(0, 2).map((kr) => (
                  <div
                    key={kr.id}
                    onClick={() => toggleKeyResult(project.id, kr.id)}
                    className="flex items-center gap-1.5 text-[#A89E97] hover:text-[#FAF4F0] cursor-pointer select-none text-[10px] py-0.5"
                  >
                    {kr.done ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-3 h-3 text-[#8A8C8D] shrink-0" />
                    )}
                    <span
                      className={`truncate ${
                        kr.done ? 'line-through text-[#8A8C8D]' : 'text-[#DFCCC1]'
                      }`}
                    >
                      {kr.text}
                    </span>
                  </div>
                ))}
                {project.keyResults.length > 2 && (
                  <button
                    onClick={() => handleOpenEditModal(project)}
                    className="text-[10px] text-[#CEB7AB] hover:underline font-mono"
                  >
                    +{project.keyResults.length - 2} more key results
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Footer: Stage Selector & Target Date / Linked Specs */}
        <div className="pt-2 border-t border-[#CEB7AB]/10 flex items-center justify-between gap-1 text-[10px]">
          {/* Status Dropdown */}
          <select
            value={project.status}
            onChange={(e) =>
              updateProject(project.id, {
                status: e.target.value as ProjectItem['status'],
              })
            }
            className={`text-[10px] font-medium rounded px-1.5 py-0.5 border cursor-pointer focus:outline-none ${
              STATUS_CONFIG[project.status].bg
            } ${STATUS_CONFIG[project.status].text} ${
              STATUS_CONFIG[project.status].border
            }`}
          >
            <option value="active" className="bg-[#120B06] text-[#FAF4F0]">
              Active
            </option>
            <option value="in_review" className="bg-[#120B06] text-[#FAF4F0]">
              In Review
            </option>
            <option value="completed" className="bg-[#120B06] text-[#FAF4F0]">
              Completed
            </option>
            <option value="on_hold" className="bg-[#120B06] text-[#FAF4F0]">
              On Hold
            </option>
          </select>

          {/* Target Date & Specs Chip */}
          <div className="flex items-center gap-2 font-mono text-[#A89E97]">
            {linkedDocs.length > 0 && (
              <button
                onClick={() => openFile(linkedDocs[0].id)}
                className="flex items-center gap-1 text-[#CEB7AB] hover:text-[#FAF4F0] transition-colors"
                title={`${linkedDocs.length} linked Second Brain doc(s)`}
              >
                <Paperclip className="w-2.5 h-2.5 text-[#CEB7AB]" />
                <span>{linkedDocs.length}</span>
              </button>
            )}

            <div className="flex items-center gap-1">
              <Calendar className="w-2.5 h-2.5 text-[#8A8C8D]" />
              <span>{project.targetDate}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-transparent">
      {/* =========================================================================
          TOP HEADER: Clean Title "Projects", Subtitle, Search & "+ New Project"
         ========================================================================= */}
      <div className="px-6 py-4 border-b border-[#CEB7AB]/15 bg-[#120B06]/75 backdrop-blur-xl shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#FAF4F0] flex items-center gap-2">
                <span>Projects</span>
              </h1>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#64504A]/30 text-[#CEB7AB] border border-[#CEB7AB]/20">
                {stats.total} total · {stats.avgProgress}% avg progress
              </span>
            </div>
            <p className="text-xs text-[#A89E97] mt-1">
              Strategic initiatives, milestone roadmaps, and linked Second Brain specifications.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Search in Header */}
            <div className="relative w-48 md:w-64">
              <Search className="w-3.5 h-3.5 text-[#8A8C8D] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
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

            {/* New Project Trigger */}
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#CEB7AB] hover:bg-[#DFCCC1] text-[#120B06] text-xs font-semibold shadow-md shadow-[#CEB7AB]/20 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Project</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          BAR OF DIFFERENT VIEWS (RIGHT ABOVE THE PROJECT CARDS)
         ========================================================================= */}
      <div className="px-6 py-2.5 border-b border-[#CEB7AB]/15 bg-[#18100A]/55 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Left: Stage/Status View Tabs */}
        <div className="flex items-center gap-1 bg-[#120B06]/80 border border-[#CEB7AB]/15 p-1 rounded-xl text-xs overflow-x-auto max-w-full shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          {/* ALL Projects */}
          <button
            onClick={() => setStageView('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
              stageView === 'all'
                ? 'bg-[#CEB7AB] text-[#120B06] font-semibold shadow-xs'
                : 'text-[#A89E97] hover:text-[#FAF4F0] hover:bg-[#64504A]/25'
            }`}
          >
            <span>ALL Projects</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                stageView === 'all'
                  ? 'bg-[#120B06]/20 text-[#120B06] font-bold'
                  : 'bg-[#120B06] text-[#CEB7AB] border border-[#CEB7AB]/15'
              }`}
            >
              {stats.total}
            </span>
          </button>

          {/* Active Projects */}
          <button
            onClick={() => setStageView('active')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
              stageView === 'active'
                ? 'bg-[#CEB7AB] text-[#120B06] font-semibold shadow-xs'
                : 'text-[#A89E97] hover:text-[#FAF4F0] hover:bg-[#64504A]/25'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${stageView === 'active' ? 'bg-[#120B06]' : 'bg-[#CEB7AB]'}`} />
            <span>Active</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                stageView === 'active'
                  ? 'bg-[#120B06]/20 text-[#120B06] font-bold'
                  : 'bg-[#120B06] text-[#CEB7AB] border border-[#CEB7AB]/15'
              }`}
            >
              {stats.active}
            </span>
          </button>

          {/* In Review */}
          <button
            onClick={() => setStageView('in_review')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
              stageView === 'in_review'
                ? 'bg-[#CEB7AB] text-[#120B06] font-semibold shadow-xs'
                : 'text-[#A89E97] hover:text-[#FAF4F0] hover:bg-[#64504A]/25'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${stageView === 'in_review' ? 'bg-[#120B06]' : 'bg-amber-400'}`} />
            <span>In Review</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                stageView === 'in_review'
                  ? 'bg-[#120B06]/20 text-[#120B06] font-bold'
                  : 'bg-[#120B06] text-[#CEB7AB] border border-[#CEB7AB]/15'
              }`}
            >
              {stats.inReview}
            </span>
          </button>

          {/* Completed Projects */}
          <button
            onClick={() => setStageView('completed')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
              stageView === 'completed'
                ? 'bg-[#CEB7AB] text-[#120B06] font-semibold shadow-xs'
                : 'text-[#A89E97] hover:text-[#FAF4F0] hover:bg-[#64504A]/25'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${stageView === 'completed' ? 'bg-[#120B06]' : 'bg-emerald-400'}`} />
            <span>Completed</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                stageView === 'completed'
                  ? 'bg-[#120B06]/20 text-[#120B06] font-bold'
                  : 'bg-[#120B06] text-[#CEB7AB] border border-[#CEB7AB]/15'
              }`}
            >
              {stats.completed}
            </span>
          </button>

          {/* On Hold */}
          <button
            onClick={() => setStageView('on_hold')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
              stageView === 'on_hold'
                ? 'bg-[#CEB7AB] text-[#120B06] font-semibold shadow-xs'
                : 'text-[#A89E97] hover:text-[#FAF4F0] hover:bg-[#64504A]/25'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${stageView === 'on_hold' ? 'bg-[#120B06]' : 'bg-[#8A8C8D]'}`} />
            <span>On Hold</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                stageView === 'on_hold'
                  ? 'bg-[#120B06]/20 text-[#120B06] font-bold'
                  : 'bg-[#120B06] text-[#CEB7AB] border border-[#CEB7AB]/15'
              }`}
            >
              {stats.onHold}
            </span>
          </button>

          {/* Grouped by Status / Stage */}
          <button
            onClick={() => setStageView('grouped')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
              stageView === 'grouped'
                ? 'bg-[#CEB7AB] text-[#120B06] font-semibold shadow-xs'
                : 'text-[#A89E97] hover:text-[#FAF4F0] hover:bg-[#64504A]/25'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Grouped by Stage</span>
          </button>
        </div>

        {/* Right: Domain Filter & Layout Mode (Cards, Board, Table) */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Domain Filter */}
          <div className="flex items-center gap-1.5 bg-[#120B06]/80 border border-[#CEB7AB]/15 px-2 py-1 rounded-lg text-xs">
            <span className="text-[11px] text-[#A89E97]">Domain:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-[#FAF4F0] font-mono text-[11px] focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#120B06]">
                All Domains
              </option>
              {allCategories.map((cat) => (
                <option key={cat} value={cat} className="bg-[#120B06]">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5 bg-[#120B06]/80 border border-[#CEB7AB]/15 px-2 py-1 rounded-lg text-xs">
            <span className="text-[11px] text-[#A89E97]">Priority:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-transparent text-[#FAF4F0] font-mono text-[11px] focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#120B06]">
                All
              </option>
              <option value="high" className="bg-[#120B06]">
                High
              </option>
              <option value="medium" className="bg-[#120B06]">
                Medium
              </option>
              <option value="low" className="bg-[#120B06]">
                Low
              </option>
            </select>
          </div>

          {/* Layout Mode Switcher */}
          <div className="flex items-center bg-[#120B06]/80 border border-[#CEB7AB]/15 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setLayoutMode('cards')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                layoutMode === 'cards'
                  ? 'bg-[#64504A]/50 text-[#CEB7AB]'
                  : 'text-[#8A8C8D] hover:text-[#FAF4F0]'
              }`}
              title="Compact Cards layout"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setLayoutMode('board')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                layoutMode === 'board'
                  ? 'bg-[#64504A]/50 text-[#CEB7AB]'
                  : 'text-[#8A8C8D] hover:text-[#FAF4F0]'
              }`}
              title="Kanban Board layout"
            >
              <Kanban className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setLayoutMode('table')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                layoutMode === 'table'
                  ? 'bg-[#64504A]/50 text-[#CEB7AB]'
                  : 'text-[#8A8C8D] hover:text-[#FAF4F0]'
              }`}
              title="Table Spreadsheet layout"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MAIN CONTENT AREA: SMALLER PROJECT CARDS / GROUPED STAGES / BOARD / TABLE
         ========================================================================= */}
      <div className="flex-1 overflow-y-auto p-5 md:p-6">
        {filteredProjects.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-white/[0.1] bg-slate-900/20 max-w-lg mx-auto my-12">
            <Target className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-200">No matching projects</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No projects match the current search or filters. You can clear your filters or create a new project.
            </p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedPriority('all');
                  setStageView('all');
                }}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg cursor-pointer"
              >
                Reset Filters
              </button>
              <button
                onClick={handleOpenCreateModal}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg cursor-pointer"
              >
                + New Project
              </button>
            </div>
          </div>
        ) : layoutMode === 'table' ? (
          /* =====================================================================
              TABLE SPREADSHEET LAYOUT
             ===================================================================== */
          <div className="rounded-xl border border-white/[0.08] bg-slate-900/40 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-slate-950/70 text-slate-400 font-mono text-[10px]">
                    <th className="py-2.5 px-3.5 font-semibold">Project Title</th>
                    <th className="py-2.5 px-3.5 font-semibold">Domain</th>
                    <th className="py-2.5 px-3.5 font-semibold">Stage / Status</th>
                    <th className="py-2.5 px-3.5 font-semibold">Priority</th>
                    <th className="py-2.5 px-3.5 font-semibold">Progress</th>
                    <th className="py-2.5 px-3.5 font-semibold">Key Results</th>
                    <th className="py-2.5 px-3.5 font-semibold">Target Date</th>
                    <th className="py-2.5 px-3.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredProjects.map((project) => {
                    const completedKrs = project.keyResults.filter((kr) => kr.done).length;
                    return (
                      <tr
                        key={project.id}
                        className="hover:bg-slate-900/60 transition-colors group"
                      >
                        <td className="py-2.5 px-3.5 font-medium text-slate-100 max-w-xs">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: project.color }}
                            />
                            <span
                              onClick={() => handleOpenEditModal(project)}
                              className="hover:text-indigo-300 cursor-pointer font-semibold truncate"
                            >
                              {project.title}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3.5 font-mono text-slate-300">
                          <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-white/[0.04] text-[10px]">
                            {project.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5">
                          <select
                            value={project.status}
                            onChange={(e) =>
                              updateProject(project.id, {
                                status: e.target.value as ProjectItem['status'],
                              })
                            }
                            className={`text-[10px] font-medium rounded px-1.5 py-0.5 border cursor-pointer focus:outline-none ${
                              STATUS_CONFIG[project.status].bg
                            } ${STATUS_CONFIG[project.status].text} ${
                              STATUS_CONFIG[project.status].border
                            }`}
                          >
                            <option value="active" className="bg-slate-900 text-slate-200">
                              Active
                            </option>
                            <option value="in_review" className="bg-slate-900 text-slate-200">
                              In Review
                            </option>
                            <option value="completed" className="bg-slate-900 text-slate-200">
                              Completed
                            </option>
                            <option value="on_hold" className="bg-slate-900 text-slate-200">
                              On Hold
                            </option>
                          </select>
                        </td>
                        <td className="py-2.5 px-3.5">
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                              PRIORITY_CONFIG[project.priority].bg
                            }`}
                          >
                            {project.priority.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 min-w-[120px]">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-white/[0.04]">
                              <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{
                                  width: `${project.progress}%`,
                                  backgroundColor: project.color,
                                }}
                              />
                            </div>
                            <span className="font-mono text-[10px] tabular-nums text-slate-300">
                              {project.progress}%
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3.5 font-mono text-[10px] text-slate-400">
                          {completedKrs}/{project.keyResults.length} done
                        </td>
                        <td className="py-2.5 px-3.5 font-mono text-[10px] text-slate-400 whitespace-nowrap">
                          {project.targetDate}
                        </td>
                        <td className="py-2.5 px-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditModal(project)}
                              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => deleteProject(project.id)}
                              className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
                              title="Archive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : layoutMode === 'board' ? (
          /* =====================================================================
              KANBAN BOARD LAYOUT (COLUMNS BY STAGE)
             ===================================================================== */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            {stageSections.map(({ status, label, count }) => {
              const colProjects = filteredProjects.filter((p) => p.status === status);
              const isOver = dragOverColumn === status;

              return (
                <div
                  key={status}
                  onDragOver={(e) => handleDragOver(e, status)}
                  onDragLeave={() => setDragOverColumn(null)}
                  onDrop={(e) => handleDrop(e, status)}
                  className={`rounded-xl bg-slate-900/40 border transition-all p-3 flex flex-col min-h-[360px] ${
                    isOver
                      ? 'border-indigo-500/60 bg-indigo-950/20 ring-2 ring-indigo-500/30'
                      : 'border-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${STATUS_CONFIG[status].dot}`} />
                      <span className="font-semibold text-xs text-slate-200">{label}</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400 tabular-nums px-2 py-0.5 rounded-full bg-slate-950 border border-white/[0.04]">
                      {colProjects.length}
                    </span>
                  </div>

                  <div className="space-y-2.5 flex-1">
                    {colProjects.map((p) => (
                      <div
                        key={p.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, p.id)}
                        className="cursor-grab active:cursor-grabbing"
                      >
                        {renderCompactCard(p)}
                      </div>
                    ))}
                    {colProjects.length === 0 && (
                      <div className="py-8 text-center border border-dashed border-white/[0.06] rounded-lg text-slate-500 text-xs">
                        No projects
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : stageView === 'grouped' ? (
          /* =====================================================================
              GROUPED BY STATUS / STAGE SECTIONS
             ===================================================================== */
          <div className="space-y-7">
            {stageSections.map(({ status, label }) => {
              const sectionProjects = filteredProjects.filter((p) => p.status === status);

              return (
                <div key={status} className="space-y-3">
                  {/* Stage Section Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${STATUS_CONFIG[status].dot}`} />
                      <h2 className="font-bold text-[#FAF4F0]">
                        {label}
                      </h2>
                      <span className="font-mono text-[10px] text-slate-400 px-2 py-0.5 rounded-full bg-slate-900 border border-white/[0.06]">
                        {sectionProjects.length} project{sectionProjects.length === 1 ? '' : 's'}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setFormStatus(status);
                        handleOpenCreateModal();
                      }}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add to {label.split(' / ')[0]}</span>
                    </button>
                  </div>

                  {/* Section Compact Cards Grid */}
                  {sectionProjects.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                      {sectionProjects.map((p) => renderCompactCard(p))}
                    </div>
                  ) : (
                    <div className="py-6 px-4 text-center rounded-xl border border-dashed border-white/[0.06] bg-slate-900/20 text-slate-500 text-xs">
                      No initiatives currently in this stage.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* =====================================================================
              COMPACT PROJECT CARDS GRID (ALL, ACTIVE, IN REVIEW, COMPLETED, ON HOLD)
             ===================================================================== */
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
              <span className="font-mono">
                Showing {filteredProjects.length} project{filteredProjects.length === 1 ? '' : 's'}
              </span>
              <span className="font-mono text-[11px] text-slate-500">
                Sorted by priority & timeline
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
              {filteredProjects.map((p) => renderCompactCard(p))}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          CREATE / EDIT PROJECT MODAL
         ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl glass-panel rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#CEB7AB]/15 flex items-center justify-between bg-[#120B06]/80">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: formColor }}
                />
                <h3 className="font-bold text-sm md:text-base text-[#FAF4F0]">
                  {editingProjectId ? 'Edit Project Initiative' : 'New Project Initiative'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#8A8C8D] hover:text-[#FAF4F0] p-1 rounded-lg hover:bg-[#64504A]/30 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveProject} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {/* Title */}
              <div>
                <label className="block text-[11px] font-semibold text-[#DFCCC1] mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. AetherOS Next-Gen Architecture..."
                  className="w-full px-3 py-2 glass-input rounded-lg placeholder:text-[#8A8C8D]"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-semibold text-[#DFCCC1] mb-1">
                  Executive Scope & Outcome
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Outline key deliverables, business context, and operational milestones..."
                  className="w-full px-3 py-2 glass-input rounded-lg placeholder:text-[#8A8C8D] resize-none"
                />
              </div>

              {/* Metadata Row: Category, Status, Priority, Target Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#DFCCC1] mb-1">
                    Domain
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-[#120B06] border border-[#CEB7AB]/20 rounded-lg px-2.5 py-2 text-[#FAF4F0] focus:outline-none"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Research">Research</option>
                    <option value="Operations">Operations</option>
                    <option value="Strategy">Strategy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#DFCCC1] mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as ProjectItem['status'])}
                    className="w-full bg-[#120B06] border border-[#CEB7AB]/20 rounded-lg px-2.5 py-2 text-[#FAF4F0] focus:outline-none"
                  >
                    <option value="active">In Flight / Active</option>
                    <option value="in_review">In Review & QA</option>
                    <option value="completed">Shipped / Completed</option>
                    <option value="on_hold">Backlog / On Hold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#DFCCC1] mb-1">
                    Priority
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as ProjectItem['priority'])}
                    className="w-full bg-[#120B06] border border-[#CEB7AB]/20 rounded-lg px-2.5 py-2 text-[#FAF4F0] focus:outline-none"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#DFCCC1] mb-1">
                    Target Date
                  </label>
                  <input
                    type="text"
                    value={formTargetDate}
                    onChange={(e) => setFormTargetDate(e.target.value)}
                    placeholder="e.g. Dec 15, 2026"
                    className="w-full glass-input rounded-lg px-2.5 py-1.5"
                  />
                </div>
              </div>

              {/* Accent Color Picker */}
              <div>
                <label className="block text-[11px] font-semibold text-[#DFCCC1] mb-1.5">
                  Accent Color
                </label>
                <div className="flex items-center gap-2">
                  {[
                    { name: 'Dark Vanilla', hex: '#CEB7AB' },
                    { name: 'Umber Bronze', hex: '#64504A' },
                    { name: 'Indigo Silk', hex: '#6366F1' },
                    { name: 'Emerald', hex: '#10B981' },
                    { name: 'Amber', hex: '#F59E0B' },
                    { name: 'Rose', hex: '#EC4899' },
                  ].map((colorOption) => (
                    <button
                      key={colorOption.hex}
                      type="button"
                      onClick={() => setFormColor(colorOption.hex)}
                      className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                        formColor === colorOption.hex
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-[#120B06] scale-110'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: colorOption.hex }}
                      title={colorOption.name}
                    />
                  ))}
                  <span className="font-mono text-[10px] text-[#A89E97] ml-2">{formColor}</span>
                </div>
              </div>

              {/* Key Results Manager */}
              <div className="space-y-2 pt-2 border-t border-[#CEB7AB]/10">
                <label className="block text-[11px] font-semibold text-[#DFCCC1]">
                  Key Results & Milestones
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formNewKrText}
                    onChange={(e) => setFormNewKrText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddKeyResult();
                      }
                    }}
                    placeholder="Add milestone key result..."
                    className="flex-1 px-3 py-1.5 glass-input rounded-lg placeholder:text-[#8A8C8D]"
                  />
                  <button
                    type="button"
                    onClick={handleAddKeyResult}
                    className="px-3.5 py-1.5 bg-[#64504A]/40 hover:bg-[#64504A]/60 text-[#FAF4F0] border border-[#CEB7AB]/25 rounded-lg font-medium cursor-pointer"
                  >
                    + Add
                  </button>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {formKeyResults.map((kr) => (
                    <div
                      key={kr.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-[#120B06]/60 border border-[#CEB7AB]/10"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <button
                          type="button"
                          onClick={() =>
                            setFormKeyResults((prev) =>
                              prev.map((k) => (k.id === kr.id ? { ...k, done: !k.done } : k))
                            )
                          }
                          className="cursor-pointer"
                        >
                          {kr.done ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Circle className="w-4 h-4 text-[#8A8C8D]" />
                          )}
                        </button>
                        <span className={kr.done ? 'line-through text-[#8A8C8D]' : 'text-[#FAF4F0]'}>
                          {kr.text}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyResult(kr.id)}
                        className="text-[#8A8C8D] hover:text-rose-400 p-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Linked Specs Selector */}
              <div className="space-y-2 pt-2 border-t border-[#CEB7AB]/10">
                <label className="block text-[11px] font-semibold text-[#DFCCC1]">
                  Attach Second Brain Specifications
                </label>
                <div className="max-h-36 overflow-y-auto space-y-1 bg-[#120B06]/60 p-2 rounded-xl border border-[#CEB7AB]/10">
                  {files
                    .filter((f) => f.type === 'file')
                    .map((file) => {
                      const isSelected = formSelectedFileIds.includes(file.id);
                      return (
                        <label
                          key={file.id}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#64504A]/25 cursor-pointer text-[#FAF4F0] text-[11px]"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormSelectedFileIds((prev) => [...prev, file.id]);
                              } else {
                                setFormSelectedFileIds((prev) => prev.filter((id) => id !== file.id));
                              }
                            }}
                            className="rounded border-[#CEB7AB]/30 bg-[#120B06] text-[#CEB7AB] focus:ring-0"
                          />
                          <FileText className="w-3 h-3 text-[#CEB7AB] shrink-0" />
                          <span className="truncate">{file.name}</span>
                        </label>
                      );
                    })}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#CEB7AB]/15">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-[#A89E97] hover:text-[#FAF4F0] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#CEB7AB] hover:bg-[#DFCCC1] text-[#120B06] rounded-lg font-semibold shadow-md shadow-[#CEB7AB]/20 cursor-pointer active:scale-95 transition-all"
                >
                  {editingProjectId ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
