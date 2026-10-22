import React from 'react';
import { useOS } from '../../../store/useOSStore';
import { getDomainStyle } from '../../projects/ProjectsView';

export const ActiveProjectsWidget: React.FC = () => {
  const { projects, toggleKeyResult, setActiveView, openFile, files } = useOS();

  const activeProjects = projects.filter((p) => p.status === 'active').slice(0, 3);

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col justify-between h-full shadow-[0_8px_32px_rgba(56,38,41,0.06)] border border-white/60">
      {/* Header - No icons, No description */}
      <div>
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#382629]/10">
          <h3 className="font-semibold text-sm tracking-tight text-[#382629]">
            Active Projects
          </h3>
          <button
            onClick={() => setActiveView('projects')}
            className="text-xs text-[#C97D8B] hover:text-[#382629] font-medium transition-colors cursor-pointer"
          >
            View All
          </button>
        </div>

        {/* Projects Cards - Unified color palette, no data counter numbers */}
        <div className="space-y-3">
          {activeProjects.map((project) => {
            const linkedDocs = files.filter((f) => project.fileIds.includes(f.id));

            return (
              <div
                key={project.id}
                className="p-3.5 rounded-xl bg-white/50 border border-[#DF9FA8]/30 hover:border-[#C97D8B]/50 transition-all text-xs space-y-2.5 backdrop-blur-md shadow-sm"
              >
                {/* Title & Progress Bar (Visual bar without numerical percentage) */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2 h-2 rounded-full shrink-0 bg-[#C97D8B]" />
                      <span className="font-semibold text-xs text-[#382629] truncate">{project.title}</span>
                    </div>
                    {(() => {
                      const domainStyle = getDomainStyle(project.category);
                      return (
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${domainStyle.bg} ${domainStyle.text} ${domainStyle.border}`}>
                          {project.category}
                        </span>
                      );
                    })()}
                  </div>

                  {/* Progress bar purely visual */}
                  <div className="w-full bg-[#382629]/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-[#DF9FA8] to-[#C97D8B]"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Key Results / Milestones */}
                {project.keyResults.length > 0 && (
                  <div className="space-y-1.5 pt-0.5">
                    {project.keyResults.slice(0, 2).map((kr) => (
                      <div
                        key={kr.id}
                        onClick={() => toggleKeyResult(project.id, kr.id)}
                        className="flex items-center gap-2 text-[#382629]/70 hover:text-[#382629] cursor-pointer select-none group"
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded-full border transition-all flex items-center justify-center shrink-0 ${
                            kr.done
                              ? 'bg-[#C97D8B] border-[#C97D8B]'
                              : 'border-[#382629]/30 group-hover:border-[#C97D8B] bg-white/40'
                          }`}
                        >
                          {kr.done && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span
                          className={`text-[11px] truncate ${
                            kr.done ? 'line-through text-[#382629]/40' : 'text-[#382629]'
                          }`}
                        >
                          {kr.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer Metadata - Linked spec link, no numbers */}
                {linkedDocs.length > 0 && (
                  <div className="pt-1.5 border-t border-[#382629]/10 text-[11px] text-[#382629]/70 flex items-center justify-between">
                    <span>Linked Spec:</span>
                    <button
                      onClick={() => openFile(linkedDocs[0].id)}
                      className="text-[#C97D8B] hover:underline truncate max-w-[150px] cursor-pointer font-medium"
                    >
                      {linkedDocs[0].name}
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {activeProjects.length === 0 && (
            <div className="py-6 text-center text-xs text-[#382629]/60">
              No active projects in progress.
            </div>
          )}
        </div>
      </div>

      {/* Footer Link - No counter numbers */}
      <div className="mt-4 pt-3 border-t border-[#382629]/10 flex items-center justify-between text-xs text-[#382629]/70">
        <span className="font-medium">Strategic Tracks</span>
        <button
          onClick={() => setActiveView('projects')}
          className="text-xs text-[#C97D8B] hover:text-[#382629] font-medium cursor-pointer transition-colors"
        >
          View Kanban & Details →
        </button>
      </div>
    </div>
  );
};
