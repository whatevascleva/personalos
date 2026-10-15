import React, { useState } from 'react';
import {
  Sparkles,
  Save,
  FolderOpen,
  Tag,
  ArrowRight,
  FileText,
  FolderSync,
  Check,
} from 'lucide-react';
import { useOS } from '../../../store/useOSStore';

export const QuickCaptureWidget: React.FC = () => {
  const { files, quickCaptureNote, setOrganizerModalOpen, openFile } = useOS();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string>('folder-inbox');
  const [selectedTag, setSelectedTag] = useState<string>('quick-capture');
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  // Available folders
  const folders = files.filter((f) => f.type === 'folder');

  // Recent captures in inbox
  const recentCaptures = files
    .filter((f) => f.type === 'file' && (f.parentId === 'folder-inbox' || f.isInboxCapture))
    .slice(0, 3);

  const handleCapture = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() && !title.trim()) return;

    quickCaptureNote({
      title: title.trim() || `Capture - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      content: content.trim(),
      folderId: selectedFolderId,
      tags: [selectedTag, 'inbox', 'second-brain'],
    });

    setTitle('');
    setContent('');
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 2400);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleCapture();
    }
  };

  return (
    <div className="bg-slate-900/50 border border-white/[0.08] rounded-xl p-5 backdrop-blur-sm flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <h3 className="font-semibold text-sm text-slate-100 tracking-tight">
              Quick Capture · Second Brain
            </h3>
          </div>
          <button
            onClick={() => setOrganizerModalOpen(true)}
            className="flex items-center gap-1.5 text-xs text-amber-400/90 hover:text-amber-300 transition-colors font-medium cursor-pointer"
          >
            <FolderSync className="w-3.5 h-3.5" />
            <span>Triage Inbox ({recentCaptures.length})</span>
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-3.5">
          Save ideas, sync notes, and research fragments directly into your file vault for later organization.
        </p>

        {/* Input Form */}
        <form onSubmit={handleCapture} className="space-y-2.5">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title or topic (e.g. Distributed Consensus Thoughts)..."
            className="w-full px-3 py-2 text-xs bg-slate-950/70 border border-white/[0.08] rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/60 transition-colors"
          />

          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={3}
              placeholder="Dump raw thoughts, bullet points, markdown checklists, or links... (Press ⌘+Enter to save)"
              className="w-full px-3 py-2 text-xs bg-slate-950/70 border border-white/[0.08] rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/60 resize-none font-sans transition-colors leading-relaxed"
            />
          </div>

          {/* Metadata selectors & submit row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
            <div className="flex items-center gap-3">
              {/* Folder Selector */}
              <div className="flex items-center gap-1.5 text-slate-400">
                <FolderOpen className="w-3 h-3 text-slate-500" />
                <select
                  value={selectedFolderId}
                  onChange={(e) => setSelectedFolderId(e.target.value)}
                  className="bg-slate-950/80 border border-white/[0.08] text-slate-300 text-[11px] rounded px-2 py-1 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tag Selector */}
              <div className="flex items-center gap-1.5 text-slate-400">
                <Tag className="w-3 h-3 text-slate-500" />
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="bg-slate-950/80 border border-white/[0.08] text-slate-300 text-[11px] rounded px-2 py-1 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="quick-capture">#quick-capture</option>
                  <option value="idea">#idea</option>
                  <option value="research">#research</option>
                  <option value="meeting">#meeting</option>
                  <option value="todo">#todo</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={!content.trim() && !title.trim()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isSavedRecently
                  ? 'bg-emerald-600 text-white'
                  : content.trim() || title.trim()
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isSavedRecently ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Saved to Vault!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save to File System</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Recent Captures Preview */}
      {recentCaptures.length > 0 && (
        <div className="mt-4 pt-3 border-t border-white/[0.06]">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
            <span>Recent Inbox Captures</span>
            <span className="font-mono text-[10px] text-slate-500">{recentCaptures.length} files awaiting triage</span>
          </div>
          <div className="space-y-1.5">
            {recentCaptures.map((file) => (
              <div
                key={file.id}
                onClick={() => openFile(file.id)}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 hover:bg-slate-950/80 border border-white/[0.04] hover:border-indigo-500/30 transition-all cursor-pointer group text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 shrink-0" />
                  <span className="font-medium text-slate-300 group-hover:text-white truncate">
                    {file.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 text-[11px] text-slate-500">
                  <span className="font-mono text-[10px]">
                    {new Date(file.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-slate-300 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
