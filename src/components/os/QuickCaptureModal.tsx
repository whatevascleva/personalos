import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Save,
  FolderOpen,
  Tag,
  FolderSync,
} from 'lucide-react';
import { useOS } from '../../store/useOSStore';

export const QuickCaptureModal: React.FC = () => {
  const {
    quickCaptureModalOpen,
    setQuickCaptureModalOpen,
    quickCaptureNote,
    files,
    setOrganizerModalOpen,
  } = useOS();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string>('folder-inbox');
  const [tag, setTag] = useState<string>('quick-capture');

  if (!quickCaptureModalOpen) return null;

  const folders = files.filter((f) => f.type === 'folder');

  const handleCapture = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() && !title.trim()) return;

    quickCaptureNote({
      title: title.trim(),
      content: content.trim(),
      folderId: selectedFolderId,
      tags: [tag, 'inbox', 'quick-capture'],
    });

    setTitle('');
    setContent('');
    setQuickCaptureModalOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleCapture();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-xl glass-panel rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#CEB7AB]/15 flex items-center justify-between bg-[#120B06]/80">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#64504A]/30 border border-[#CEB7AB]/25 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-[#CEB7AB]" />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-[#FAF4F0]">
                Quick Capture · Second Brain Ingestion
              </h2>
              <p className="text-[11px] text-[#A89E97]">
                Immediately saved as a permanent Markdown document in your file vault.
              </p>
            </div>
          </div>

          <button
            onClick={() => setQuickCaptureModalOpen(false)}
            className="p-1.5 rounded-lg text-[#8A8C8D] hover:text-[#FAF4F0] hover:bg-[#64504A]/30 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Capture Body */}
        <form onSubmit={handleCapture} className="p-5 space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title or core idea (e.g. Distributed Log Strategy)..."
            autoFocus
            className="w-full px-3 py-2 text-xs glass-input rounded-lg placeholder:text-[#8A8C8D]"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={5}
            placeholder="Write notes, dump bullets, format markdown... (Press ⌘+Enter to save immediately)"
            className="w-full px-3 py-2 text-xs glass-input rounded-lg placeholder:text-[#8A8C8D] font-sans leading-relaxed resize-none"
          />

          {/* Options Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
            <div className="flex items-center gap-3">
              {/* Folder */}
              <div className="flex items-center gap-1.5 text-[#A89E97]">
                <FolderOpen className="w-3.5 h-3.5 text-[#CEB7AB]" />
                <select
                  value={selectedFolderId}
                  onChange={(e) => setSelectedFolderId(e.target.value)}
                  className="bg-[#120B06] border border-[#CEB7AB]/20 text-[#FAF4F0] text-[11px] rounded-lg px-2 py-1 focus:outline-none"
                >
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tag */}
              <div className="flex items-center gap-1.5 text-[#A89E97]">
                <Tag className="w-3.5 h-3.5 text-[#8A8C8D]" />
                <select
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="bg-[#120B06] border border-[#CEB7AB]/20 text-[#FAF4F0] text-[11px] rounded-lg px-2 py-1 focus:outline-none"
                >
                  <option value="quick-capture">#quick-capture</option>
                  <option value="idea">#idea</option>
                  <option value="todo">#todo</option>
                  <option value="meeting">#meeting</option>
                  <option value="research">#research</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setQuickCaptureModalOpen(false);
                  setOrganizerModalOpen(true);
                }}
                className="text-[11px] text-[#CEB7AB] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <FolderSync className="w-3 h-3" />
                <span>Open Brain Inbox</span>
              </button>

              <button
                type="submit"
                disabled={!content.trim() && !title.trim()}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#CEB7AB] hover:bg-[#DFCCC1] disabled:opacity-40 text-[#120B06] rounded-lg text-xs font-semibold shadow-md shadow-[#CEB7AB]/20 cursor-pointer active:scale-95 transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save to Vault</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
