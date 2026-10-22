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
  Table,
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

  // Insert markdown table template at current cursor or end of text
  const handleInsertTable = () => {
    const tableTemplate = `\n\n| Column 1 | Column 2 | Status | Priority |\n| :--- | :--- | :--- | :--- |\n| Item Alpha | Description here | Active | High |\n| Item Beta | Specification note | In Review | Medium |\n`;
    setContent((prev) => prev + tableTemplate);
    addToast('Table template inserted', 'Edit column headers and rows', 'info');
  };

  // Word count & read time
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  // Clean markdown parser with table rendering and Rose & Silk styling
  const renderSimpleMarkdown = (text: string) => {
    const rawLines = text.split('\n');
    const elements: React.ReactNode[] = [];

    let i = 0;
    while (i < rawLines.length) {
      const line = rawLines[i];

      // Check for table start: line contains '|' and next line looks like table separator '|---|'
      if (
        line.trim().startsWith('|') &&
        line.trim().endsWith('|') &&
        i + 1 < rawLines.length &&
        rawLines[i + 1].trim().includes('|') &&
        rawLines[i + 1].trim().includes('-')
      ) {
        const tableLines: string[] = [];
        while (i < rawLines.length && rawLines[i].trim().startsWith('|') && rawLines[i].trim().endsWith('|')) {
          tableLines.push(rawLines[i].trim());
          i++;
        }

        if (tableLines.length >= 2) {
          const headerCells = tableLines[0]
            .split('|')
            .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
            .map((c) => c.trim());

          const bodyRows = tableLines.slice(2).map((row) =>
            row
              .split('|')
              .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
              .map((c) => c.trim())
          );

          elements.push(
            <div key={`table-${i}`} className="my-3 overflow-x-auto rounded-xl border border-[#DF9FA8]/35 bg-white/70 shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#DF9FA8]/25 border-b border-[#DF9FA8]/35 text-[#382629] font-bold">
                  <tr>
                    {headerCells.map((h, hIdx) => (
                      <th key={hIdx} className="py-2 px-3 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#382629]/10">
                  {bodyRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-[#DF9FA8]/10 transition-colors">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="py-2 px-3 text-[#382629]">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          continue;
        }
      }

      // Headings
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={i} className="text-base font-bold text-[#382629] border-b border-[#DF9FA8]/30 pb-1 mt-3 mb-2">
            {line.replace('# ', '')}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={i} className="text-sm font-bold text-[#C97D8B] border-b border-[#DF9FA8]/20 pb-0.5 mt-3 mb-1.5">
            {line.replace('## ', '')}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={i} className="text-xs font-bold text-[#382629] mt-2 mb-1">
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.startsWith('- [ ] ')) {
        elements.push(
          <div key={i} className="flex items-center gap-2 pl-2 text-xs text-[#382629]">
            <div className="w-3.5 h-3.5 border border-[#DF9FA8]/50 rounded bg-white" />
            <span>{line.replace('- [ ] ', '')}</span>
          </div>
        );
      } else if (line.startsWith('- [x] ') || line.startsWith('- [X] ')) {
        elements.push(
          <div key={i} className="flex items-center gap-2 pl-2 text-xs text-[#382629]/50 line-through">
            <div className="w-3.5 h-3.5 bg-[#C97D8B] rounded flex items-center justify-center text-[9px] text-white font-bold">
              ✓
            </div>
            <span>{line.replace(/- \[[xX]\] /, '')}</span>
          </div>
        );
      } else if (line.startsWith('- ')) {
        elements.push(
          <li key={i} className="ml-4 list-disc text-xs text-[#382629]">
            {line.replace('- ', '')}
          </li>
        );
      } else if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={i} className="pl-3 py-1 my-1 border-l-2 border-[#C97D8B] text-[#382629]/80 italic bg-[#DF9FA8]/15 rounded-r">
            {line.replace('> ', '')}
          </blockquote>
        );
      } else if (line.startsWith('---')) {
        elements.push(<hr key={i} className="my-3 border-[#DF9FA8]/30" />);
      } else if (!line.trim()) {
        elements.push(<div key={i} className="h-2" />);
      } else {
        elements.push(<p key={i} className="text-xs text-[#382629]">{line}</p>);
      }

      i++;
    }

    return <div className="space-y-1.5 leading-relaxed font-sans">{elements}</div>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-5xl h-[88vh] glass-panel rounded-2xl shadow-2xl flex flex-col overflow-hidden bg-white/95 border border-white/80">
        {/* Editor Top Bar */}
        <div className="px-5 py-3.5 border-b border-[#382629]/10 flex items-center justify-between gap-4 bg-white/80">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-7 h-7 rounded-lg bg-[#DF9FA8]/25 border border-[#DF9FA8]/35 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-[#C97D8B]" />
            </div>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Filename..."
              className="text-sm font-bold text-[#382629] bg-transparent border-b border-transparent hover:border-[#DF9FA8] focus:border-[#C97D8B] focus:outline-none px-1 py-0.5 min-w-[200px] flex-1 truncate"
            />

            <button
              onClick={() => togglePinFile(file.id)}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                file.pinned
                  ? 'bg-[#DF9FA8]/25 border-[#DF9FA8]/40 text-[#C97D8B]'
                  : 'text-[#382629]/40 hover:text-[#382629] border-transparent hover:bg-[#DF9FA8]/20'
              }`}
              title={file.pinned ? 'Unpin note' : 'Pin note'}
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mode Toggles & Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Segmented Control */}
            <div className="hidden sm:flex items-center bg-white/80 border border-[#DF9FA8]/30 rounded-xl p-0.5 text-xs shadow-xs">
              <button
                onClick={() => setViewMode('edit')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                  viewMode === 'edit'
                    ? 'bg-[#C97D8B] text-white font-semibold shadow-xs'
                    : 'text-[#382629]/70 hover:text-[#382629]'
                }`}
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                  viewMode === 'split'
                    ? 'bg-[#C97D8B] text-white font-semibold shadow-xs'
                    : 'text-[#382629]/70 hover:text-[#382629]'
                }`}
              >
                <Columns className="w-3 h-3" />
                <span>Split</span>
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                  viewMode === 'preview'
                    ? 'bg-[#C97D8B] text-white font-semibold shadow-xs'
                    : 'text-[#382629]/70 hover:text-[#382629]'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Preview</span>
              </button>
            </div>

            {/* Insert Table Button */}
            <button
              onClick={handleInsertTable}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#382629] hover:text-[#C97D8B] bg-white/80 hover:bg-white border border-[#DF9FA8]/40 rounded-lg cursor-pointer transition-colors shadow-xs"
              title="Insert a markdown database table structure"
            >
              <Table className="w-3 h-3 text-[#C97D8B]" />
              <span className="hidden sm:inline">+ Table</span>
            </button>

            <button
              onClick={handleCreateTaskFromNote}
              className="hidden md:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#382629] hover:text-[#C97D8B] bg-white/80 hover:bg-white border border-[#DF9FA8]/30 rounded-lg cursor-pointer transition-colors shadow-xs"
              title="Spawn actionable task linked to this document"
            >
              <CheckSquare className="w-3 h-3 text-[#C97D8B]" />
              <span>Link Task</span>
            </button>

            <button
              onClick={handleDownload}
              className="p-1.5 text-[#382629]/60 hover:text-[#382629] hover:bg-[#DF9FA8]/20 rounded-lg border border-transparent hover:border-[#DF9FA8]/30 cursor-pointer"
              title="Download Markdown file"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                deleteFile(file.id);
                handleClose();
              }}
              className="p-1.5 text-[#382629]/50 hover:text-rose-500 hover:bg-[#DF9FA8]/20 rounded-lg cursor-pointer"
              title="Delete document"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-[#DF9FA8] to-[#C97D8B] text-white rounded-lg text-xs font-semibold shadow-md shadow-[#C97D8B]/20 cursor-pointer active:scale-95 transition-all hover:brightness-105"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>

            <button
              onClick={handleClose}
              className="p-1.5 text-[#382629]/60 hover:text-[#382629] hover:bg-[#DF9FA8]/20 rounded-lg cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Location & Tags Ribbon */}
        <div className="px-5 py-2 border-b border-[#382629]/10 bg-white/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            {/* Folder Move */}
            <div className="flex items-center gap-1.5 text-[#382629]/70">
              <FolderOpen className="w-3.5 h-3.5 text-[#C97D8B]" />
              <span className="text-[11px]">Folder:</span>
              <select
                value={parentId || ''}
                onChange={(e) => setParentId(e.target.value || null)}
                className="bg-white border border-[#DF9FA8]/35 text-[#382629] text-xs rounded-lg px-2 py-0.5 focus:outline-none cursor-pointer"
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
              <Tag className="w-3.5 h-3.5 text-[#C97D8B]" />
              <div className="flex items-center gap-1 flex-wrap">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-[#382629] bg-white border border-[#DF9FA8]/30 px-1.5 py-0.5 rounded"
                  >
                    #{t}
                    <button
                      onClick={() => removeTag(t)}
                      className="hover:text-rose-500 text-[#382629]/50 cursor-pointer ml-0.5"
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
                  className="w-16 px-1.5 py-0.5 text-[11px] bg-white/80 border border-transparent hover:border-[#DF9FA8]/40 focus:border-[#C97D8B] rounded text-[#382629] placeholder:text-[#382629]/40 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Doc Stats */}
          <div className="flex items-center gap-3 text-[#382629]/70 font-mono text-[11px] tabular-nums">
            <span>{wordCount} words</span>
            <span>·</span>
            <span>{readTimeMin}m read</span>
            <span>·</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#C97D8B]" />
              <span>{new Date(file.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Editor Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#DF9FA8]/20">
          {/* Edit Pane */}
          {(viewMode === 'edit' || viewMode === 'split') && (
            <div className={`h-full flex flex-col ${viewMode === 'edit' ? 'md:col-span-2' : ''}`}>
              <div className="px-4 py-1.5 bg-white/70 border-b border-[#382629]/10 text-[11px] text-[#382629]/70 font-mono flex items-center justify-between">
                <span>Markdown Editor</span>
                <span>Type or paste table markdown</span>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write markdown or create database tables here..."
                className="w-full flex-1 p-5 bg-white/60 text-[#382629] font-mono text-xs leading-relaxed resize-none focus:outline-none selection:bg-[#DF9FA8]/30 overflow-y-auto"
              />
            </div>
          )}

          {/* Preview Pane */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className={`h-full flex flex-col ${viewMode === 'preview' ? 'md:col-span-2' : ''}`}>
              <div className="px-4 py-1.5 bg-white/70 border-b border-[#382629]/10 text-[11px] text-[#382629]/70 font-mono flex items-center justify-between">
                <span>Live Second Brain Render</span>
                <span>Markdown & Table Preview</span>
              </div>
              <div className="w-full flex-1 p-5 bg-white/40 overflow-y-auto">
                {content.trim() ? (
                  renderSimpleMarkdown(content)
                ) : (
                  <p className="text-[#382629]/40 italic text-xs">Nothing to preview yet...</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
