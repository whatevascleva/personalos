import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Download,
  Trash2,
  FolderOpen,
  Tag,
  Eye,
  Edit3,
  Columns,
  Pin,
  Clock,
  FileText,
  CheckSquare,
} from 'lucide-react';
import { useOS } from '../../store/useOSStore';

interface FileEditorModalProps {
  fileId?: string | null;
  onClose?: () => void;
}

export const FileEditorModal: React.FC<FileEditorModalProps> = ({ fileId, onClose }) => {
  const {
    files,
    updateFile,
    deleteFile,
    togglePinFile,
    createTask,
    addToast,
    activeFileId,
    openFile,
  } = useOS();

  const effectiveFileId = fileId !== undefined ? fileId : activeFileId;
  const handleClose = onClose || (() => openFile(null));

  const file = files.find((f) => f.id === effectiveFileId);

  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');

  useEffect(() => {
    if (file) {
      setName(file.name);
      setContent(file.content || '');
      setTags(file.tags || []);
      setParentId(file.parentId);
    }
  }, [file]);

  if (!file) return null;

  const folders = files.filter((f) => f.type === 'folder');

  const handleSave = () => {
    updateFile(file.id, {
      name: name.trim() || file.name,
      content,
      tags,
      parentId,
    });
    addToast('Document saved', name, 'success');
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name.endsWith('.md') ? name : `${name}.md`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Exported to local computer', a.download, 'info');
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTagInput.trim()) {
      e.preventDefault();
      const clean = newTagInput.trim().replace(/^#/, '');
      if (!tags.includes(clean)) {
        setTags([...tags, clean]);
      }
      setNewTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleCreateTaskFromNote = () => {
    createTask({
      title: `Action: ${name.replace('.md', '')}`,
      priority: 'p2',
      dueDate: 'Tomorrow, 12:00',
      completed: false,
      linkedFileId: file.id,
      category: 'Second Brain',
      timeEstimate: '30m',
    });
    addToast('Task created from note', name, 'success');
  };

  // Word count & read time
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  // Simple clean markdown parser for preview
  const renderSimpleMarkdown = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-2 text-xs text-[#FAF4F0] leading-relaxed font-sans">
        {lines.map((line, idx) => {
          if (line.startsWith('# ')) {
            return (
              <h1 key={idx} className="text-base font-bold text-[#FAF4F0] border-b border-[#CEB7AB]/15 pb-1 mt-3 mb-2">
                {line.replace('# ', '')}
              </h1>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h2 key={idx} className="text-sm font-semibold text-[#CEB7AB] border-b border-[#CEB7AB]/10 pb-0.5 mt-3 mb-1.5">
                {line.replace('## ', '')}
              </h2>
            );
          }
          if (line.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-xs font-semibold text-[#DFCCC1] mt-2 mb-1">
                {line.replace('### ', '')}
              </h3>
            );
          }
          if (line.startsWith('- [ ] ')) {
            return (
              <div key={idx} className="flex items-center gap-2 pl-2 text-xs text-[#DFCCC1]">
                <div className="w-3.5 h-3.5 border border-[#CEB7AB]/30 rounded bg-[#120B06]" />
                <span>{line.replace('- [ ] ', '')}</span>
              </div>
            );
          }
          if (line.startsWith('- [x] ') || line.startsWith('- [X] ')) {
            return (
              <div key={idx} className="flex items-center gap-2 pl-2 text-xs text-[#8A8C8D] line-through">
                <div className="w-3.5 h-3.5 bg-[#CEB7AB] rounded flex items-center justify-center text-[9px] text-[#120B06] font-bold">
                  ✓
                </div>
                <span>{line.replace(/- \[[xX]\] /, '')}</span>
              </div>
            );
          }
          if (line.startsWith('- ')) {
            return (
              <li key={idx} className="ml-4 list-disc text-xs text-[#DFCCC1]">
                {line.replace('- ', '')}
              </li>
            );
          }
          if (line.startsWith('> ')) {
            return (
              <blockquote key={idx} className="pl-3 py-1 my-1 border-l-2 border-[#CEB7AB] text-[#DFCCC1] italic bg-[#120B06]/60 rounded-r">
                {line.replace('> ', '')}
              </blockquote>
            );
          }
          if (line.startsWith('---')) {
            return <hr key={idx} className="my-3 border-[#CEB7AB]/15" />;
          }
          if (!line.trim()) {
            return <div key={idx} className="h-2" />;
          }
          return <p key={idx}>{line}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-5xl h-[88vh] glass-panel rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Editor Top Bar */}
        <div className="px-5 py-3.5 border-b border-[#CEB7AB]/15 flex items-center justify-between gap-4 bg-[#120B06]/80">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-7 h-7 rounded-lg bg-[#64504A]/30 border border-[#CEB7AB]/25 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-[#CEB7AB]" />
            </div>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Filename..."
              className="text-sm font-semibold text-[#FAF4F0] bg-transparent border-b border-transparent hover:border-[#64504A] focus:border-[#CEB7AB] focus:outline-none px-1 py-0.5 min-w-[200px] flex-1 truncate"
            />

            <button
              onClick={() => togglePinFile(file.id)}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                file.pinned
                  ? 'bg-[#CEB7AB]/20 border-[#CEB7AB]/40 text-[#CEB7AB]'
                  : 'text-[#8A8C8D] hover:text-[#FAF4F0] border-transparent hover:bg-[#64504A]/30'
              }`}
              title={file.pinned ? 'Unpin note' : 'Pin note'}
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mode Toggles & Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Segmented Control */}
            <div className="hidden sm:flex items-center bg-[#120B06]/80 border border-[#CEB7AB]/15 rounded-xl p-0.5 text-xs">
              <button
                onClick={() => setViewMode('edit')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                  viewMode === 'edit'
                    ? 'bg-[#CEB7AB] text-[#120B06] font-semibold'
                    : 'text-[#A89E97] hover:text-[#FAF4F0]'
                }`}
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                  viewMode === 'split'
                    ? 'bg-[#CEB7AB] text-[#120B06] font-semibold'
                    : 'text-[#A89E97] hover:text-[#FAF4F0]'
                }`}
              >
                <Columns className="w-3 h-3" />
                <span>Split</span>
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                  viewMode === 'preview'
                    ? 'bg-[#CEB7AB] text-[#120B06] font-semibold'
                    : 'text-[#A89E97] hover:text-[#FAF4F0]'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Preview</span>
              </button>
            </div>

            <button
              onClick={handleCreateTaskFromNote}
              className="hidden md:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#DFCCC1] hover:text-[#FAF4F0] bg-[#64504A]/30 hover:bg-[#64504A]/50 border border-[#CEB7AB]/20 rounded-lg cursor-pointer transition-colors"
              title="Spawn actionable task linked to this document"
            >
              <CheckSquare className="w-3 h-3 text-[#CEB7AB]" />
              <span>Link Task</span>
            </button>

            <button
              onClick={handleDownload}
              className="p-1.5 text-[#8A8C8D] hover:text-[#FAF4F0] hover:bg-[#64504A]/30 rounded-lg border border-transparent hover:border-[#CEB7AB]/15 cursor-pointer"
              title="Download Markdown file"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                deleteFile(file.id);
                handleClose();
              }}
              className="p-1.5 text-[#8A8C8D] hover:text-rose-400 hover:bg-[#64504A]/30 rounded-lg cursor-pointer"
              title="Delete document"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#CEB7AB] hover:bg-[#DFCCC1] text-[#120B06] rounded-lg text-xs font-semibold shadow-md shadow-[#CEB7AB]/20 cursor-pointer active:scale-95 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>

            <button
              onClick={handleClose}
              className="p-1.5 text-[#8A8C8D] hover:text-[#FAF4F0] hover:bg-[#64504A]/30 rounded-lg cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Location & Tags Ribbon */}
        <div className="px-5 py-2 border-b border-[#CEB7AB]/10 bg-[#120B06]/50 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            {/* Folder Move */}
            <div className="flex items-center gap-1.5 text-[#A89E97]">
              <FolderOpen className="w-3.5 h-3.5 text-[#CEB7AB]" />
              <span className="text-[11px]">Folder:</span>
              <select
                value={parentId || ''}
                onChange={(e) => setParentId(e.target.value || null)}
                className="bg-[#120B06] border border-[#CEB7AB]/20 text-[#FAF4F0] text-xs rounded-lg px-2 py-0.5 focus:outline-none cursor-pointer"
              >
                <option value="">Root / Unassigned</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags Ribbon */}
            <div className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#8A8C8D]" />
              <div className="flex items-center gap-1 flex-wrap">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-[#CEB7AB] bg-[#120B06] border border-[#CEB7AB]/15 px-1.5 py-0.5 rounded"
                  >
                    #{t}
                    <button
                      onClick={() => removeTag(t)}
                      className="hover:text-rose-400 text-[#8A8C8D] cursor-pointer ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="+tag"
                  className="w-16 px-1.5 py-0.5 text-[11px] bg-[#120B06]/60 border border-transparent hover:border-[#CEB7AB]/20 focus:border-[#CEB7AB] rounded text-[#FAF4F0] placeholder:text-[#8A8C8D] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Doc Stats */}
          <div className="flex items-center gap-3 text-[#A89E97] font-mono text-[11px] tabular-nums">
            <span>{wordCount} words</span>
            <span>·</span>
            <span>{readTimeMin}m read</span>
            <span>·</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{new Date(file.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Editor Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#CEB7AB]/10">
          {/* Edit Pane */}
          {(viewMode === 'edit' || viewMode === 'split') && (
            <div className={`h-full flex flex-col ${viewMode === 'edit' ? 'md:col-span-2' : ''}`}>
              <div className="px-4 py-1.5 bg-[#120B06]/60 border-b border-[#CEB7AB]/10 text-[11px] text-[#A89E97] font-mono flex items-center justify-between">
                <span>Markdown Editor</span>
                <span>Plain Text Buffer</span>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write markdown here..."
                className="w-full flex-1 p-5 bg-[#120B06]/70 text-[#FAF4F0] font-mono text-xs leading-relaxed resize-none focus:outline-none selection:bg-[#CEB7AB]/30 overflow-y-auto"
              />
            </div>
          )}

          {/* Preview Pane */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className={`h-full flex flex-col ${viewMode === 'preview' ? 'md:col-span-2' : ''}`}>
              <div className="px-4 py-1.5 bg-[#120B06]/60 border-b border-[#CEB7AB]/10 text-[11px] text-[#A89E97] font-mono flex items-center justify-between">
                <span>Live Second Brain Render</span>
                <span>Markdown Preview</span>
              </div>
              <div className="w-full flex-1 p-5 bg-[#18100A]/40 overflow-y-auto">
                {content.trim() ? (
                  renderSimpleMarkdown(content)
                ) : (
                  <p className="text-[#8A8C8D] italic text-xs">Nothing to preview yet...</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
