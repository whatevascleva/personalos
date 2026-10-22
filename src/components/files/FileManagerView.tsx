import React, { useState, useRef } from 'react';
import {
  Folder,
  FileText,
  Plus,
  Search,
  Upload,
  Pin,
  Trash2,
  FolderSync,
  Grid,
  List,
  Clock,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Check,
  FilterX,
  Archive,
  Table,
} from 'lucide-react';
import { useOS } from '../../store/useOSStore';
import { exportSecondBrainZip } from '../../utils/exportZip';

export const FileManagerView: React.FC = () => {
  const {
    files,
    createFile,
    createFolder,
    moveFile,
    deleteFile,
    togglePinFile,
    handleDropUpload,
    openFile,
    setOrganizerModalOpen,
    setVaultDocumentsModalOpen,
    setQuickCaptureModalOpen,
    markCaptureDealtWith,
    addToast,
  } = useOS();

  // Search and view layout for "All Notes"
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewLayout, setViewLayout] = useState<'table' | 'grid'>('table');
  const [draggedFileId, setDraggedFileId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [isExternalDragOver, setIsExternalDragOver] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);

  // New folder & file dialog states
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [isCreatingTable, setIsCreatingTable] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileExt, setNewFileExt] = useState<'md' | 'txt' | 'json'>('md');

  // Quick move target dropdown state for individual cards
  const [activeQuickMoveId, setActiveQuickMoveId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // All folders in the system
  const allFolders = files.filter((f) => f.type === 'folder');
  const nonInboxFolders = allFolders.filter((f) => f.id !== 'folder-inbox');

  // Helper to resolve folder name
  const getFolderName = (parentId: string | null) => {
    if (!parentId) return 'Vault Root';
    const folder = files.find((f) => f.id === parentId);
    return folder ? folder.name : 'Vault Root';
  };

  // 1. NOTES THAT NEED TO BE LOOKED AT AND ORGANIZED (SHOWN FIRST)
  const notesToOrganize = files.filter(
    (f) =>
      f.type === 'file' &&
      (f.parentId === 'folder-inbox' || f.isInboxCapture || f.tags.includes('unorganized')) &&
      !f.dealtWith
  );

  // 2. ALL NOTES (NO FILTERS SELECTED BY DEFAULT)
  const allNoteFiles = files.filter((f) => f.type === 'file');

  // Filtered list only if the user explicitly searches or picks a tag
  const displayedAllNotes = allNoteFiles.filter((item) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTag = selectedTag === null || item.tags.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  // Collect all unique tags
  const allTags = Array.from(new Set(allNoteFiles.flatMap((f) => f.tags || []))).filter(Boolean);

  // Drag and Drop internal file handlers
  const handleDragStart = (e: React.DragEvent, fileId: string) => {
    e.dataTransfer.setData('text/plain', fileId);
    setDraggedFileId(fileId);
  };

  const handleExternalDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsExternalDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleDropUpload(e.dataTransfer.files, null);
    }
  };

  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    createFolder(newFolderName.trim(), null);
    setNewFolderName('');
    setIsCreatingFolder(false);
    addToast('Folder created', newFolderName.trim(), 'success');
  };

  const handleCreateFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    const file = createFile({
      name: newFileName.trim(),
      parentId: null,
      extension: newFileExt,
      tags: ['note'],
    });
    setNewFileName('');
    setIsCreatingFile(false);
    openFile(file.id);
    addToast('New note created', file.name, 'success');
  };

  const handleCreateTableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    const tableTemplate = `# ${newFileName.trim()} Database Table\n\n| Item / Record | Category | Status | Priority | Notes |\n| :--- | :--- | :--- | :--- | :--- |\n| Example Entry 1 | Engineering | Active | High | First milestone item |\n| Example Entry 2 | Research | In Review | Medium | Background analysis |\n| Example Entry 3 | Operations | Planned | Low | Scheduled for next sprint |\n\n> Tip: You can add more columns and rows by editing the markdown pipes above, or click "+ Table" in the editor toolbar.`;

    const file = createFile({
      name: newFileName.trim(),
      parentId: null,
      extension: 'md',
      content: tableTemplate,
      tags: ['database', 'table'],
    });
    setNewFileName('');
    setIsCreatingTable(false);
    openFile(file.id);
    addToast('New table database created', file.name, 'success');
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleDropUpload(e.target.files, null);
    }
  };

  const handleQuickMoveNote = (fileId: string, folderId: string) => {
    moveFile(fileId, folderId);
    markCaptureDealtWith(fileId, folderId);
    setActiveQuickMoveId(null);
  };

  // Export all notes as a ZIP file
  const handleExportZip = async () => {
    try {
      setIsExportingZip(true);
      const zipName = await exportSecondBrainZip(files);
      addToast('Vault saved to ZIP folder', zipName, 'success');
    } catch (err) {
      console.error('Failed to export ZIP:', err);
      addToast('Export failed', 'Could not generate ZIP archive', 'alert');
    } finally {
      setIsExportingZip(false);
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsExternalDragOver(true);
      }}
      onDragLeave={() => setIsExternalDragOver(false)}
      onDrop={handleExternalDrop}
      className={`flex-1 flex flex-col h-full overflow-hidden transition-colors ${
        isExternalDragOver ? 'bg-[#DF9FA8]/20 ring-2 ring-[#C97D8B]' : ''
      }`}
    >
      {/* Top Action Header */}
      <div className="px-6 py-3.5 border-b border-[#DF9FA8]/30 bg-white/70 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm md:text-base font-bold text-[#382629] tracking-tight">
              Second Brain Hub
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#DF9FA8]/20 text-[#382629] border border-[#DF9FA8]/30">
              Vault Repository
            </span>
          </div>
          <p className="text-[11px] text-[#382629]/70 mt-0.5">
            Inbox captures, documents, and structured tables organized in liquid glass.
          </p>
        </div>

        {/* Global Second Brain Actions & Compiled Links */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Vault Documents Compiled Link */}
          <button
            onClick={() => setVaultDocumentsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#382629] hover:text-[#C97D8B] bg-white/70 hover:bg-white border border-[#DF9FA8]/30 rounded-lg transition-all cursor-pointer shadow-xs backdrop-blur-md active:scale-95"
            title="Open Vault Documents fast-access directory"
          >
            <FileText className="w-3.5 h-3.5 text-[#C97D8B]" />
            <span>Vault Docs</span>
          </button>

          {/* Brain Inbox Triage Shortcut Link */}
          <button
            onClick={() => setOrganizerModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer border backdrop-blur-md bg-white/70 text-[#382629] border-[#DF9FA8]/30 hover:bg-white hover:text-[#C97D8B] active:scale-95"
            title="Open Brain Inbox full triage workflow"
          >
            <FolderSync className="w-3.5 h-3.5 text-[#C97D8B]" />
            <span>Brain Inbox</span>
          </button>

          {/* Quick Capture Button */}
          <button
            onClick={() => setQuickCaptureModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#DF9FA8] to-[#C97D8B] hover:brightness-105 rounded-lg shadow-md shadow-[#C97D8B]/20 transition-all cursor-pointer active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Quick Capture</span>
          </button>

          {/* New Note Button */}
          <button
            onClick={() => {
              setIsCreatingTable(false);
              setIsCreatingFile(true);
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#DF9FA8] to-[#C97D8B] hover:brightness-105 rounded-lg shadow-xs transition-all cursor-pointer active:scale-95"
            title="Create a new note"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Note</span>
          </button>

          {/* New Table / Database Note Button */}
          <button
            onClick={() => {
              setIsCreatingFile(false);
              setIsCreatingTable(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#382629] hover:text-[#C97D8B] bg-white/80 hover:bg-white border border-[#DF9FA8]/40 rounded-lg shadow-xs transition-all cursor-pointer active:scale-95"
            title="Create a new structured database table document"
          >
            <Table className="w-3.5 h-3.5 text-[#C97D8B]" />
            <span>+ New Table</span>
          </button>

          {/* New Folder Button */}
          <button
            onClick={() => setIsCreatingFolder(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#382629] hover:text-[#C97D8B] bg-white/70 hover:bg-white border border-[#DF9FA8]/30 rounded-lg transition-colors cursor-pointer"
            title="Create root folder"
          >
            <Folder className="w-3.5 h-3.5 text-[#C97D8B]" />
            <span className="hidden sm:inline">New Folder</span>
          </button>

          {/* Save / Export in ZIP folder Button */}
          <button
            onClick={handleExportZip}
            disabled={isExportingZip}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#382629] hover:text-[#C97D8B] bg-white/85 hover:bg-white border border-[#C97D8B]/40 rounded-lg transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
            title="Save and download all notes in a zip folder"
          >
            <Archive className="w-3.5 h-3.5 text-[#C97D8B]" />
            <span>{isExportingZip ? 'Zipping...' : 'Save as ZIP'}</span>
          </button>

          {/* Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 text-[#382629]/70 hover:text-[#382629] bg-white/70 hover:bg-white border border-[#DF9FA8]/30 rounded-lg cursor-pointer transition-colors"
            title="Upload file from desktop"
          >
            <Upload className="w-3.5 h-3.5 text-[#C97D8B]" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            multiple
            className="hidden"
          />
        </div>
      </div>

      {/* Inline Creation Dialogs */}
      {isCreatingFolder && (
        <form
          onSubmit={handleCreateFolderSubmit}
          className="mx-6 mt-4 p-3 rounded-xl bg-white/95 backdrop-blur-xl border border-[#DF9FA8]/40 flex items-center gap-3 text-xs shadow-lg animate-fadeIn"
        >
          <Folder className="w-4 h-4 text-[#C97D8B]" />
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name (e.g. 05_Experiments)..."
            autoFocus
            className="flex-1 glass-input rounded-lg px-2.5 py-1.5 text-[#382629] placeholder:text-[#382629]/40 border border-[#DF9FA8]/30 focus:outline-none focus:border-[#C97D8B]"
          />
          <button
            type="button"
            onClick={() => setIsCreatingFolder(false)}
            className="px-2 py-1 text-[#382629]/60 hover:text-[#382629] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-1.5 bg-gradient-to-r from-[#DF9FA8] to-[#C97D8B] text-white rounded-lg font-semibold cursor-pointer shadow-xs hover:brightness-105"
          >
            Create Folder
          </button>
        </form>
      )}

      {isCreatingFile && (
        <form
          onSubmit={handleCreateFileSubmit}
          className="mx-6 mt-4 p-3 rounded-xl bg-white/95 backdrop-blur-xl border border-[#DF9FA8]/40 flex items-center gap-3 text-xs shadow-lg animate-fadeIn"
        >
          <FileText className="w-4 h-4 text-[#C97D8B]" />
          <input
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="Document title (e.g. Q4 Strategy Review)..."
            autoFocus
            className="flex-1 glass-input rounded-lg px-2.5 py-1.5 text-[#382629] placeholder:text-[#382629]/40 border border-[#DF9FA8]/30 focus:outline-none focus:border-[#C97D8B]"
          />
          <select
            value={newFileExt}
            onChange={(e) => setNewFileExt(e.target.value as any)}
            className="bg-white/80 border border-[#DF9FA8]/30 rounded-lg px-2.5 py-1.5 text-[#382629] focus:outline-none"
          >
            <option value="md">Markdown (.md)</option>
            <option value="txt">Plain Text (.txt)</option>
            <option value="json">JSON (.json)</option>
          </select>
          <button
            type="button"
            onClick={() => setIsCreatingFile(false)}
            className="px-2 py-1 text-[#382629]/60 hover:text-[#382629] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-1.5 bg-gradient-to-r from-[#DF9FA8] to-[#C97D8B] text-white rounded-lg font-semibold cursor-pointer shadow-xs hover:brightness-105"
          >
            Create & Open
          </button>
        </form>
      )}

      {isCreatingTable && (
        <form
          onSubmit={handleCreateTableSubmit}
          className="mx-6 mt-4 p-3.5 rounded-xl bg-white/95 backdrop-blur-xl border border-[#DF9FA8]/50 flex items-center gap-3 text-xs shadow-lg animate-fadeIn"
        >
          <Table className="w-4 h-4 text-[#C97D8B] shrink-0" />
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="Table name (e.g. Feature Roadmap Table, Client Directory)..."
              autoFocus
              className="flex-1 glass-input rounded-lg px-2.5 py-1.5 text-[#382629] placeholder:text-[#382629]/40 border border-[#DF9FA8]/30 focus:outline-none focus:border-[#C97D8B]"
            />
            <span className="text-[11px] text-[#382629]/70 font-mono hidden md:inline">
              Pre-formats with database columns & rows
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsCreatingTable(false)}
            className="px-2 py-1 text-[#382629]/60 hover:text-[#382629] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3.5 py-1.5 bg-gradient-to-r from-[#DF9FA8] to-[#C97D8B] text-white rounded-lg font-semibold cursor-pointer shadow-xs hover:brightness-105 shrink-0"
          >
            Generate Table
          </button>
        </form>
      )}

      {/* Main Scrollable Body */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8">
        {/* External drop visual notice */}
        {isExternalDragOver && (
          <div className="p-4 rounded-xl border-2 border-dashed border-[#C97D8B] bg-[#DF9FA8]/20 text-center text-xs font-semibold text-[#382629]">
            Drop external files from your desktop here to import into Second Brain!
          </div>
        )}

        {/* =========================================================================
            SECTION 1: NOTES THAT NEED TO BE LOOKED AT AND ORGANIZED (SHOWN FIRST)
           ========================================================================= */}
        <section className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#DF9FA8]/25">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#DF9FA8]/25 border border-[#DF9FA8]/40 flex items-center justify-center text-[#C97D8B]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-[#382629]">
                    Notes to Look At & Organize
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#DF9FA8]/25 text-[#382629] border border-[#DF9FA8]/35">
                    Inbox Captures
                  </span>
                </div>
                <p className="text-[11px] text-[#382629]/70 mt-0.5">
                  Raw captures awaiting review, tagging, or filing into projects and areas.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {notesToOrganize.length > 0 && (
                <button
                  onClick={() => setOrganizerModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/70 hover:bg-white text-[#382629] hover:text-[#C97D8B] border border-[#DF9FA8]/30 rounded-lg transition-colors cursor-pointer backdrop-blur-md shadow-xs active:scale-95"
                >
                  <FolderSync className="w-3.5 h-3.5 text-[#C97D8B]" />
                  <span>Launch Brain Inbox Triage</span>
                </button>
              )}
            </div>
          </div>

          {/* Cards for Notes to Organize */}
          {notesToOrganize.length === 0 ? (
            <div className="p-6 rounded-2xl glass-card border border-dashed border-[#DF9FA8]/30 flex items-center justify-between gap-4 bg-white/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#DF9FA8]/25 border border-[#DF9FA8]/35 flex items-center justify-center text-[#C97D8B] shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#382629]">
                    Brain Inbox Zero · All notes have been organized
                  </h4>
                  <p className="text-[11px] text-[#382629]/70 mt-0.5">
                    No unorganized captures pending. Any new notes you quick-capture will appear here first.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setQuickCaptureModalOpen(true)}
                className="px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-[#DF9FA8] to-[#C97D8B] hover:brightness-105 rounded-lg transition-all cursor-pointer shrink-0 font-semibold shadow-xs active:scale-95"
              >
                + Quick Capture
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {notesToOrganize.map((note) => (
                <div
                  key={note.id}
                  className="p-4 rounded-2xl glass-card flex flex-col justify-between group shadow-sm hover:border-[#C97D8B]/40 bg-white/70 border border-white/80"
                >
                  <div>
                    {/* Header line: status pill & quick open */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-[10px] text-[#382629] bg-[#DF9FA8]/20 px-2 py-0.5 rounded-full border border-[#DF9FA8]/30 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 text-[#C97D8B]" />
                        <span>Needs Review</span>
                      </span>
                      <button
                        onClick={() => openFile(note.id)}
                        className="text-[#382629]/50 hover:text-[#C97D8B] transition-colors p-1 cursor-pointer"
                        title="Open in Markdown Editor"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Note title */}
                    <h3
                      onClick={() => openFile(note.id)}
                      className="text-xs font-bold text-[#382629] hover:text-[#C97D8B] transition-colors cursor-pointer line-clamp-1"
                    >
                      {note.name}
                    </h3>

                    {/* Note Content preview */}
                    {note.content && (
                      <p className="text-[11px] text-[#382629]/75 line-clamp-2 mt-1.5 leading-relaxed font-sans">
                        {note.content.replace(/^#+\s+/g, '')}
                      </p>
                    )}

                    {/* Tags */}
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {note.tags.map((t) => (
                          <span
                            key={t}
                            className="font-mono text-[10px] text-[#382629]/80 bg-white/70 px-1.5 py-0.5 rounded border border-[#DF9FA8]/25"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions Bar for the Card */}
                  <div className="pt-3 mt-3 border-t border-[#382629]/10 flex items-center justify-between gap-2">
                    {/* Quick Move Selector */}
                    <div className="relative flex-1">
                      {activeQuickMoveId === note.id ? (
                        <div className="flex items-center gap-1">
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                handleQuickMoveNote(note.id, e.target.value);
                              }
                            }}
                            defaultValue=""
                            className="w-full text-[10px] bg-white border border-[#DF9FA8]/40 rounded px-2 py-1 text-[#382629] focus:outline-none"
                            autoFocus
                          >
                            <option value="" disabled>
                              Select folder...
                            </option>
                            {nonInboxFolders.map((f) => (
                              <option key={f.id} value={f.id}>
                                {f.name}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => setActiveQuickMoveId(null)}
                            className="text-[10px] text-[#382629]/60 hover:text-[#382629] px-1 cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setActiveQuickMoveId(note.id)}
                          className="flex items-center gap-1 text-[11px] font-medium text-[#382629]/80 hover:text-[#C97D8B] transition-colors cursor-pointer"
                        >
                          <Folder className="w-3 h-3 text-[#C97D8B]" />
                          <span>File into...</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Mark Dealt With Button */}
                      <button
                        onClick={() => markCaptureDealtWith(note.id)}
                        className="flex items-center gap-1 px-2 py-1 rounded bg-[#DF9FA8]/20 hover:bg-[#DF9FA8]/35 text-[#382629] border border-[#DF9FA8]/30 text-[11px] font-medium transition-colors cursor-pointer"
                        title="Mark note as organized & dealt with"
                      >
                        <Check className="w-3 h-3 text-[#C97D8B]" />
                        <span>Dealt With</span>
                      </button>

                      <button
                        onClick={() => deleteFile(note.id)}
                        className="p-1 text-[#382629]/50 hover:text-rose-500 transition-colors cursor-pointer"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* =========================================================================
            ALL NOTES (NO FILTERS SELECTED BY DEFAULT)
           ========================================================================= */}
        <section className="space-y-4 pt-4 border-t border-[#DF9FA8]/25">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#DF9FA8]/25">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#DF9FA8]/25 border border-[#DF9FA8]/40 flex items-center justify-center text-[#C97D8B]">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-[#382629]">
                    All Notes & Documents
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#DF9FA8]/20 text-[#382629] border border-[#DF9FA8]/30">
                    Repository
                  </span>
                </div>
                <p className="text-[11px] text-[#382629]/70 mt-0.5">
                  Complete view of all markdown files, structured tables, and specifications.
                </p>
              </div>
            </div>

            {/* Controls: Search, View switcher & Reset filter */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Reset filter button if any filter active */}
              {(selectedTag !== null || searchQuery !== '') && (
                <button
                  onClick={() => {
                    setSelectedTag(null);
                    setSearchQuery('');
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs text-[#382629] hover:text-[#C97D8B] bg-white/70 hover:bg-white rounded-lg border border-[#DF9FA8]/30 cursor-pointer shadow-xs"
                  title="Clear all filters"
                >
                  <FilterX className="w-3 h-3 text-[#C97D8B]" />
                  <span>Reset Filters</span>
                </button>
              )}

              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#382629]/50 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search all notes..."
                  className="w-40 sm:w-56 pl-8 pr-3 py-1.5 text-xs glass-input rounded-lg placeholder:text-[#382629]/40 text-[#382629] border border-[#DF9FA8]/30 focus:outline-none focus:border-[#C97D8B]"
                />
              </div>

              {/* Table / Grid view switcher */}
              <div className="flex items-center bg-white/70 border border-[#DF9FA8]/30 rounded-lg p-0.5 shadow-xs">
                <button
                  onClick={() => setViewLayout('table')}
                  className={`p-1 rounded cursor-pointer transition-colors ${
                    viewLayout === 'table' ? 'bg-[#C97D8B] text-white shadow-xs' : 'text-[#382629]/70 hover:text-[#382629]'
                  }`}
                  title="Table View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewLayout('grid')}
                  className={`p-1 rounded cursor-pointer transition-colors ${
                    viewLayout === 'grid' ? 'bg-[#C97D8B] text-white shadow-xs' : 'text-[#382629]/70 hover:text-[#382629]'
                  }`}
                  title="Grid Cards View"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Tags filter ribbon */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-1">
              <span className="text-[10px] text-[#382629]/70 font-mono uppercase tracking-wider shrink-0">
                Filter by Tag:
              </span>
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono cursor-pointer transition-colors ${
                  selectedTag === null
                    ? 'bg-[#C97D8B] text-white font-semibold shadow-xs'
                    : 'text-[#382629]/70 hover:text-[#382629] bg-white/60 border border-[#DF9FA8]/25'
                }`}
              >
                All Notes (No Filter)
              </button>
              {allTags.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTag(selectedTag === t ? null : t)}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono cursor-pointer transition-colors ${
                    selectedTag === t
                      ? 'bg-[#C97D8B] text-white font-semibold shadow-xs'
                      : 'text-[#382629]/80 hover:text-[#382629] bg-white/70 border border-[#DF9FA8]/30'
                  }`}
                >
                  #{t}
                </button>
              ))}
            </div>
          )}

          {/* All Notes Content: Table or Grid */}
          {displayedAllNotes.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#382629]/70 border border-dashed border-[#DF9FA8]/30 rounded-2xl glass-card bg-white/40">
              <p className="font-semibold text-[#382629]">No notes found</p>
              <p className="text-[11px] text-[#382629]/60 mt-1">
                {searchQuery || selectedTag
                  ? 'Try clearing your search query or tag filter.'
                  : 'Start by clicking "New Note", "+ New Table", or "Quick Capture".'}
              </p>
            </div>
          ) : viewLayout === 'table' ? (
            <div className="border border-[#DF9FA8]/30 rounded-2xl overflow-hidden glass-card bg-white/70 shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#DF9FA8]/20 border-b border-[#DF9FA8]/30 text-[#382629] font-semibold">
                  <tr>
                    <th className="py-2.5 px-4">Document Name</th>
                    <th className="py-2.5 px-4 hidden md:table-cell">Vault Location</th>
                    <th className="py-2.5 px-4 hidden sm:table-cell">Type / Status</th>
                    <th className="py-2.5 px-4 hidden lg:table-cell">Tags</th>
                    <th className="py-2.5 px-4 hidden sm:table-cell">Modified</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#382629]/10">
                  {displayedAllNotes.map((note) => {
                    const folderName = getFolderName(note.parentId);
                    const isDealtWith =
                      note.dealtWith ||
                      (note.wasQuickCaptured &&
                        note.parentId !== 'folder-inbox' &&
                        !note.isInboxCapture &&
                        !note.tags.includes('unorganized'));
                    const isUnorganized =
                      (note.parentId === 'folder-inbox' || note.isInboxCapture || note.tags.includes('unorganized')) &&
                      !note.dealtWith;
                    const isTableDoc = note.tags.includes('database') || note.tags.includes('table');

                    return (
                      <tr
                        key={note.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, note.id)}
                        onClick={() => openFile(note.id)}
                        className="hover:bg-[#DF9FA8]/15 transition-colors cursor-pointer group"
                      >
                        {/* Name */}
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-2.5">
                            {isTableDoc ? (
                              <Table className="w-4 h-4 text-[#C97D8B] shrink-0" />
                            ) : (
                              <FileText className="w-4 h-4 text-[#C97D8B] shrink-0" />
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-[#382629] group-hover:text-[#C97D8B] truncate">
                                  {note.name}
                                </span>
                                {note.pinned && (
                                  <Pin className="w-3 h-3 text-[#C97D8B] shrink-0" />
                                )}
                              </div>
                              {note.content && (
                                <p className="text-[11px] text-[#382629]/65 truncate max-w-xs md:max-w-md hidden sm:block">
                                  {note.content.replace(/^#+\s+/g, '')}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Location Folder */}
                        <td className="py-2.5 px-4 hidden md:table-cell text-[#382629]">
                          <span className="flex items-center gap-1 text-[11px] font-mono">
                            <Folder className="w-3 h-3 text-[#C97D8B] shrink-0" />
                            <span className="truncate max-w-[150px]">{folderName}</span>
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-2.5 px-4 hidden sm:table-cell">
                          {isUnorganized ? (
                            <span className="font-mono text-[10px] text-[#382629] bg-[#DF9FA8]/25 px-2 py-0.5 rounded border border-[#DF9FA8]/35">
                              Needs Review
                            </span>
                          ) : isDealtWith ? (
                            <span className="font-mono text-[10px] text-[#382629] bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/25 flex items-center gap-1 w-fit">
                              <Check className="w-2.5 h-2.5 text-emerald-600" />
                              <span>Dealt With</span>
                            </span>
                          ) : isTableDoc ? (
                            <span className="font-mono text-[10px] text-[#382629] bg-[#D4AA8C]/25 px-2 py-0.5 rounded border border-[#D4AA8C]/40">
                              Table Database
                            </span>
                          ) : (
                            <span className="font-mono text-[10px] text-[#382629]/70 bg-white/70 px-2 py-0.5 rounded border border-[#DF9FA8]/20">
                              Document
                            </span>
                          )}
                        </td>

                        {/* Tags */}
                        <td className="py-2.5 px-4 hidden lg:table-cell">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {note.tags.slice(0, 3).map((t) => (
                              <span
                                key={t}
                                className="font-mono text-[10px] text-[#382629]/80 bg-white/80 px-1.5 py-0.2 rounded border border-[#DF9FA8]/25"
                              >
                                #{t}
                              </span>
                            ))}
                            {note.tags.length > 3 && (
                              <span className="text-[10px] text-[#382629]/60 font-mono">
                                +{note.tags.length - 3}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Modified */}
                        <td className="py-2.5 px-4 hidden sm:table-cell font-mono text-[11px] text-[#382629]/70">
                          {new Date(note.updatedAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>

                        {/* Actions */}
                        <td
                          className="py-2.5 px-4 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => togglePinFile(note.id)}
                              className={`p-1 rounded hover:bg-[#DF9FA8]/20 transition-colors cursor-pointer ${
                                note.pinned ? 'text-[#C97D8B]' : 'text-[#382629]/40 hover:text-[#382629]'
                              }`}
                              title={note.pinned ? 'Unpin' : 'Pin to Fast Access'}
                            >
                              <Pin className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openFile(note.id)}
                              className="p-1 rounded text-[#382629]/50 hover:text-[#C97D8B] hover:bg-[#DF9FA8]/20 transition-colors cursor-pointer"
                              title="Open Editor"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteFile(note.id)}
                              className="p-1 rounded text-[#382629]/40 hover:text-rose-500 hover:bg-[#DF9FA8]/20 transition-colors cursor-pointer"
                              title="Delete Note"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {displayedAllNotes.map((note) => {
                const folderName = getFolderName(note.parentId);
                const isDealtWith =
                  note.dealtWith ||
                  (note.wasQuickCaptured &&
                    note.parentId !== 'folder-inbox' &&
                    !note.isInboxCapture &&
                    !note.tags.includes('unorganized'));
                const isUnorganized =
                  (note.parentId === 'folder-inbox' || note.isInboxCapture || note.tags.includes('unorganized')) &&
                  !note.dealtWith;
                const isTableDoc = note.tags.includes('database') || note.tags.includes('table');

                return (
                  <div
                    key={note.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, note.id)}
                    onClick={() => openFile(note.id)}
                    className="p-3.5 rounded-2xl glass-card transition-all cursor-pointer group flex flex-col justify-between hover:border-[#C97D8B]/40 bg-white/70 border border-white/80 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          {isUnorganized ? (
                            <span className="font-mono text-[9px] text-[#382629] bg-[#DF9FA8]/25 px-1.5 py-0.5 rounded border border-[#DF9FA8]/35">
                              Needs Review
                            </span>
                          ) : isDealtWith ? (
                            <span className="font-mono text-[9px] text-[#382629] bg-emerald-500/15 px-1.5 py-0.5 rounded border border-emerald-500/25">
                              Dealt With
                            </span>
                          ) : isTableDoc ? (
                            <span className="font-mono text-[9px] text-[#382629] bg-[#D4AA8C]/25 px-1.5 py-0.5 rounded border border-[#D4AA8C]/40">
                              Table
                            </span>
                          ) : (
                            <span className="font-mono text-[9px] text-[#382629]/70 bg-white/80 px-1.5 py-0.5 rounded border border-[#DF9FA8]/20 uppercase">
                              {note.extension || 'md'}
                            </span>
                          )}
                          {note.pinned && <Pin className="w-2.5 h-2.5 text-[#C97D8B]" />}
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-[#382629]/40 group-hover:text-[#C97D8B] transition-colors" />
                      </div>

                      <h4 className="font-bold text-xs text-[#382629] group-hover:text-[#C97D8B] truncate">
                        {note.name}
                      </h4>

                      {note.content && (
                        <p className="text-[11px] text-[#382629]/70 line-clamp-2 mt-1 leading-relaxed">
                          {note.content.replace(/^#+\s+/g, '')}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 mt-3 border-t border-[#382629]/10 flex items-center justify-between text-[10px] text-[#382629]/70 font-mono">
                      <span className="flex items-center gap-1 truncate max-w-[120px]">
                        <Folder className="w-2.5 h-2.5 text-[#C97D8B] shrink-0" />
                        <span className="truncate">{folderName}</span>
                      </span>
                      <span>
                        {new Date(note.updatedAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
