import React from 'react';
import {
  Target,
  ChevronRight,
  CheckCircle2,
  Circle,
  FileText,
  Calendar,
} from 'lucide-react';
import { useOS } from '../../../store/useOSStore';

export const ActiveProjectsWidget: React.FC = () => {
  const { projects, toggleKeyResult, setActiveView, openFile, files } = useOS();

  const activeProjects = projects.filter((p) => p.status === 'active').slice(0, 3);

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col justify-between h-full shadow-[0_8px_32px_rgba(18,11,6,0.4)]">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#64504A]/30 border border-[#CEB7AB]/25 flex items-center justify-center">
              <Target className="w-4 h-4 text-[#CEB7AB]" />
            </div>
            <h3 className="font-semibold text-[#FAF4F0]">
              Projects
            </h3>
          </div>
          <button
            onClick={() => setActiveView('projects')}
            className="text-xs text-[#CEB7AB] hover:text-[#FAF4F0] font-medium flex items-center gap-0.5 cursor-pointer"
          >
            <span>View All</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <p className="text-xs text-[#A89E97] mb-3.5">
          High-level operational tracks, milestone progression, and linked technical specifications.
        </p>

        {/* Projects Cards */}
        <div className="space-y-3">
          {activeProjects.map((project) => {
            const linkedDocs = files.filter((f) => project.fileIds.includes(f.id));
            const completedKrs = project.keyResults.filter((kr) => kr.done).length;

            return (
              <div
                key={project.id}
                className="p-3.5 rounded-xl bg-[#120B06]/60 border border-[#CEB7AB]/10 hover:border-[#CEB7AB]/30 transition-all text-xs space-y-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
              >
                {/* Title & Progress Bar */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: project.color }}
                      />
                      <span className="font-medium text-[#FAF4F0] truncate">{project.title}</span>
                    </div>
                    <span className="font-mono text-[11px] text-[#CEB7AB] tabular-nums shrink-0">
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
                </div>

                {/* Key Results / Milestones */}
                {project.keyResults.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {project.keyResults.slice(0, 2).map((kr) => (
                      <div
                        key={kr.id}
                        onClick={() => toggleKeyResult(project.id, kr.id)}
                        className="flex items-center gap-2 text-[#A89E97] hover:text-[#FAF4F0] cursor-pointer select-none group"
                      >
                        {kr.done ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-[#8A8C8D] group-hover:text-[#CEB7AB] shrink-0" />
                        )}
                        <span
                          className={`text-[11px] truncate ${
                            kr.done ? 'line-through text-[#8A8C8D]' : 'text-[#DFCCC1]'
                          }`}
                        >
                          {kr.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer Metadata */}
                <div className="flex items-center justify-between text-[11px] text-[#A89E97] pt-1.5 border-t border-[#CEB7AB]/10">
                  <div className="flex items-center gap-1.5 font-mono tabular-nums">
                    <Calendar className="w-3 h-3 text-[#CEB7AB]/70" />
                    <span>Target: {project.targetDate}</span>
                  </div>

                  {linkedDocs.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3 h-3 text-[#CEB7AB]/70" />
                      <button
                        onClick={() => openFile(linkedDocs[0].id)}
                        className="text-[#CEB7AB] hover:underline truncate max-w-[130px] cursor-pointer"
                      >
                        {linkedDocs[0].name}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {activeProjects.length === 0 && (
            <div className="py-6 text-center border border-dashed border-[#CEB7AB]/20 rounded-xl text-xs text-[#8A8C8D]">
              No active projects in progress.
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-[#CEB7AB]/15 flex items-center justify-between text-xs text-[#A89E97]">
        <span>Active Tracks: {projects.length} Total</span>
        <button
          onClick={() => setActiveView('projects')}
          className="text-xs text-[#CEB7AB] hover:text-[#FAF4F0] font-medium cursor-pointer"
        >
          View Kanban & Details →
        </button>
      </div>
    </div>
  );
};
