import React from 'react';
import {
  FileText,
  Pin,
  ChevronRight,
  FolderTree,
  ExternalLink,
} from 'lucide-react';
import { useOS } from '../../../store/useOSStore';

export const RecentFilesWidget: React.FC = () => {
  const { files, openFile, setActiveView } = useOS();

  // Get pinned files and recently updated files
  const fileDocuments = files.filter((f) => f.type === 'file');
  const pinnedFiles = fileDocuments.filter((f) => f.pinned);
  const recentFiles = fileDocuments
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);

  return (
    <div className="bg-slate-900/50 border border-white/[0.08] rounded-xl p-5 backdrop-blur-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-sm text-slate-100 tracking-tight">
              Recent Vault Documents
            </h3>
          </div>
          <button
            onClick={() => setActiveView('files')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-0.5 cursor-pointer"
          >
            <span>File Tree</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-3.5">
          Quick access to recent drafts, pinned specifications, and second brain syntheses.
        </p>

        {/* Pinned row if any */}
        {pinnedFiles.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-medium mb-1.5">
              <Pin className="w-3 h-3" />
              <span>Pinned Notes</span>
            </div>
            <div className="space-y-1.5">
              {pinnedFiles.slice(0, 2).map((file) => (
                <div
                  key={file.id}
                  onClick={() => openFile(file.id)}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 hover:bg-slate-950 border border-amber-500/20 hover:border-amber-500/40 transition-all cursor-pointer group text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                    <span className="font-medium text-slate-200 group-hover:text-amber-200 truncate">
                      {file.name}
                    </span>
                  </div>
                  <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-amber-300 transition-colors shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent files list */}
        <div className="space-y-1.5">
          <div className="text-[11px] text-slate-400 mb-1">Recently Modified</div>
          {recentFiles.map((file) => {
            const folder = files.find((f) => f.id === file.parentId);
            return (
              <div
                key={file.id}
                onClick={() => openFile(file.id)}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 hover:bg-slate-950/80 border border-white/[0.04] hover:border-slate-700 transition-all cursor-pointer group text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="font-mono text-[10px] text-slate-500 uppercase px-1 py-0.5 rounded bg-slate-900 border border-white/[0.04]">
                    {file.extension || 'md'}
                  </span>
                  <span className="text-slate-300 group-hover:text-white truncate">
                    {file.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono shrink-0">
                  <span className="truncate max-w-[90px]">{folder?.name || 'Root'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
        <span>Vault: {fileDocuments.length} Documents</span>
        <button
          onClick={() => setActiveView('files')}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer"
        >
          <FolderTree className="w-3 h-3" />
          <span>Open Explorer</span>
        </button>
      </div>
    </div>
  );
};
