import React, { useState } from 'react';
import {
  X,
  FolderSync,
  FolderOpen,
  ArrowRight,
  CheckCircle2,
  Tag,
  CheckSquare,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { useOS } from '../../store/useOSStore';
import { FileItem } from '../../types';

export const SecondBrainOrganizerModal: React.FC = () => {
  const {
    organizerModalOpen,
    setOrganizerModalOpen,
    files,
    moveFile,
    updateFile,
    createTask,
    openFile,
    addToast,
  } = useOS();

  // Find all unorganized / inbox files
  const unorganizedNotes = files.filter(
    (f) =>
      f.type === 'file' &&
      (f.parentId === 'folder-inbox' || f.isInboxCapture || f.tags.includes('unorganized'))
  );

  const [currentIndex, setCurrentIndex] = useState(0);

  if (!organizerModalOpen) return null;

  const currentFile: FileItem | undefined = unorganizedNotes[currentIndex];

  const destinationFolders = files.filter(
    (f) => f.type === 'folder' && f.id !== 'folder-inbox'
  );

  const handleFileToFolder = (targetFolderId: string) => {
    if (!currentFile) return;

    // Update tags to remove unorganized & move
    const cleanTags = currentFile.tags.filter((t) => t !== 'unorganized');
    updateFile(currentFile.id, {
      parentId: targetFolderId,
      isInboxCapture: false,
      wasQuickCaptured: true,
      dealtWith: true,
      dealtWithAt: new Date().toISOString(),
      tags: cleanTags,
    });
    moveFile(currentFile.id, targetFolderId);

    const folderName = files.find((f) => f.id === targetFolderId)?.name || 'Folder';
    addToast(`Triaged into ${folderName}`, currentFile.name, 'success');

    if (currentIndex >= unorganizedNotes.length - 1) {
      setCurrentIndex(Math.max(0, unorganizedNotes.length - 2));
    }
  };

  const handleSpawnTask = () => {
    if (!currentFile) return;
    createTask({
      title: `Action: ${currentFile.name.replace('.md', '')}`,
      priority: 'p2',
      dueDate: 'Today, 20:00',
      completed: false,
      linkedFileId: currentFile.id,
      category: 'Inbox Triage',
      timeEstimate: '30m',
    });
    addToast('Task created from capture', currentFile.name, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-4xl glass-panel rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[88vh] bg-white/95 border border-white/80">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#382629]/10 flex items-center justify-between bg-white/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#DF9FA8]/25 border border-[#DF9FA8]/35 flex items-center justify-center">
              <FolderSync className="w-4 h-4 text-[#C97D8B]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm text-[#382629]">
                  Brain Inbox Triage
                </h2>
                <span className="font-mono text-xs text-[#382629] bg-[#DF9FA8]/25 px-2 py-0.5 rounded border border-[#DF9FA8]/35">
                  Queue
                </span>
              </div>
              <p className="text-xs text-[#382629]/70">
                Process captured fragments, assign permanent folders, and extract actionable next steps.
              </p>
            </div>
          </div>

          <button
            onClick={() => setOrganizerModalOpen(false)}
            className="p-1.5 rounded-lg text-[#382629]/50 hover:text-[#382629] hover:bg-[#DF9FA8]/20 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        {unorganizedNotes.length > 0 && currentFile ? (
          <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 overflow-y-auto">
            {/* Note Preview Pane (Col 7) */}
            <div className="md:col-span-7 flex flex-col space-y-3">
              <div className="flex items-center justify-between text-xs text-[#382629]/70 pb-2 border-b border-[#382629]/10">
                <div className="flex items-center gap-1.5 font-bold text-[#382629]">
                  <FileText className="w-3.5 h-3.5 text-[#C97D8B]" />
                  <span className="truncate">{currentFile.name}</span>
                </div>
                <button
                  onClick={() => {
                    setOrganizerModalOpen(false);
                    openFile(currentFile.id);
                  }}
                  className="flex items-center gap-1 text-[#C97D8B] hover:underline cursor-pointer text-[11px] font-medium"
                >
                  <span>Open Full Editor</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {/* Note Content Box */}
              <div className="p-4 rounded-xl bg-white/70 border border-[#DF9FA8]/30 text-xs text-[#382629] font-mono leading-relaxed h-[320px] overflow-y-auto whitespace-pre-wrap shadow-inner">
                {currentFile.content || '(Empty capture)'}
              </div>

              {/* Tags Ribbon */}
              <div className="flex items-center gap-1.5 text-xs text-[#382629]/70">
                <Tag className="w-3 h-3 text-[#C97D8B]" />
                <span>Tags:</span>
                <div className="flex items-center gap-1 flex-wrap">
                  {currentFile.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-[#382629] border border-[#DF9FA8]/30"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pagination between items */}
              {unorganizedNotes.length > 1 && (
                <div className="flex items-center justify-between pt-2 text-xs text-[#382629]/70">
                  <span>
                    Note {currentIndex + 1} of {unorganizedNotes.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      disabled={currentIndex === 0}
                      onClick={() => setCurrentIndex((prev) => prev - 1)}
                      className="px-2.5 py-1 bg-white/80 hover:bg-white border border-[#DF9FA8]/30 disabled:opacity-30 rounded text-[11px] cursor-pointer text-[#382629] shadow-xs"
                    >
                      Previous
                    </button>
                    <button
                      disabled={currentIndex === unorganizedNotes.length - 1}
                      onClick={() => setCurrentIndex((prev) => prev + 1)}
                      className="px-2.5 py-1 bg-white/80 hover:bg-white border border-[#DF9FA8]/30 disabled:opacity-30 rounded text-[11px] cursor-pointer text-[#382629] shadow-xs"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Filing Targets Pane (Col 5) */}
            <div className="md:col-span-5 flex flex-col justify-between space-y-4 border-t md:border-t-0 md:border-l border-[#DF9FA8]/25 md:pl-6 pt-4 md:pt-0">
              <div>
                <h3 className="text-xs font-bold text-[#382629] mb-2 uppercase tracking-wider">
                  1-Click Second Brain Filing
                </h3>
                <p className="text-[11px] text-[#382629]/70 mb-3">
                  Assign this capture to its PARA category or active project folder:
                </p>

                <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
                  {destinationFolders.map((folder) => (
                    <button
                      key={folder.id}
                      onClick={() => handleFileToFolder(folder.id)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/70 hover:bg-white border border-[#DF9FA8]/25 hover:border-[#C97D8B]/40 text-[#382629] hover:text-[#C97D8B] transition-all text-xs cursor-pointer group text-left shadow-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FolderOpen className="w-3.5 h-3.5 text-[#C97D8B] shrink-0" />
                        <span className="font-semibold truncate">{folder.name}</span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-[#382629]/40 group-hover:text-[#C97D8B] transition-transform group-hover:translate-x-0.5 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Extraction Actions */}
              <div className="pt-3 border-t border-[#382629]/10 space-y-2">
                <button
                  onClick={handleSpawnTask}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-[#DF9FA8] to-[#C97D8B] text-white text-xs font-semibold hover:brightness-105 shadow-md shadow-[#C97D8B]/20 transition-all cursor-pointer active:scale-95"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-white" />
                  <span>Extract Action Item as Task</span>
                </button>

                <button
                  onClick={() => handleFileToFolder('folder-archive')}
                  className="w-full text-center py-1 text-[#382629]/60 hover:text-[#382629] text-[11px] cursor-pointer"
                >
                  Archive Note (No Action Needed)
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#DF9FA8]/25 border border-[#DF9FA8]/35 flex items-center justify-center mx-auto text-[#C97D8B]">
              <CheckCircle2 className="w-6 h-6 text-[#C97D8B]" />
            </div>
            <h3 className="text-base font-bold text-[#382629]">
              Inbox Zero Reached!
            </h3>
            <p className="text-xs text-[#382629]/70 max-w-md mx-auto">
              All quick captures have been filed and organized into your permanent second-brain vault.
            </p>
            <button
              onClick={() => setOrganizerModalOpen(false)}
              className="mt-2 px-5 py-2 bg-gradient-to-r from-[#DF9FA8] to-[#C97D8B] text-white rounded-lg text-xs font-semibold cursor-pointer active:scale-95 transition-all shadow-md shadow-[#C97D8B]/20 hover:brightness-105"
            >
              Return to Workspace
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
