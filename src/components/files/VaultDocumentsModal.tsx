import React, { useState } from 'react';
import {
  X,
  FileText,
  Pin,
  ExternalLink,
  Search,
  Folder,
  Clock,
  HardDrive,
} from 'lucide-react';
import { useOS } from '../../store/useOSStore';

export const VaultDocumentsModal: React.FC = () => {
  const {
    vaultDocumentsModalOpen,
    setVaultDocumentsModalOpen,
    files,
    openFile,
  } = useOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'pinned' | 'recent' | 'all'>('pinned');

  if (!vaultDocumentsModalOpen) return null;

  const fileDocuments = files.filter((f) => f.type === 'file');
  const pinnedFiles = fileDocuments.filter((f) => f.pinned);
  const recentFiles = [...fileDocuments].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const folders = files.filter((f) => f.type === 'folder');

  const filteredFiles = fileDocuments.filter((f) => {
    if (!searchQuery.trim()) {
      if (activeTab === 'pinned') return f.pinned;
      if (activeTab === 'recent') return true;
      return true;
    }
    return (
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.content && f.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
      f.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const displayList = searchQuery.trim()
    ? filteredFiles
    : activeTab === 'pinned'
    ? pinnedFiles
    : activeTab === 'recent'
    ? recentFiles.slice(0, 8)
    : fileDocuments;

  const getFolderName = (parentId: string | null) => {
    if (!parentId) return 'Vault Root';
    return files.find((f) => f.id === parentId)?.name || 'Unknown Folder';
  };

  const handleOpenDoc = (fileId: string) => {
    openFile(fileId);
    setVaultDocumentsModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-3xl max-h-[85vh] glass-panel rounded-2xl shadow-2xl overflow-hidden flex flex-col bg-white/95 border border-white/80">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#382629]/10 flex items-center justify-between bg-white/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#DF9FA8]/25 border border-[#DF9FA8]/35 flex items-center justify-center text-[#C97D8B]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm text-[#382629]">Vault Documents Directory</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#DF9FA8]/25 text-[#382629] border border-[#DF9FA8]/35">
                  Fast Access
                </span>
              </div>
              <p className="text-xs text-[#382629]/70 mt-0.5">
                Quick directory for pinned notes, recent files, and vault storage.
              </p>
            </div>
          </div>

          <button
            onClick={() => setVaultDocumentsModalOpen(false)}
            className="p-1.5 rounded-lg text-[#382629]/50 hover:text-[#382629] hover:bg-[#DF9FA8]/20 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Tabs Subheader */}
        <div className="px-6 py-3 border-b border-[#382629]/10 bg-white/60 flex flex-wrap items-center justify-between gap-3">
          {/* Quick Tabs */}
          <div className="flex items-center gap-1.5 bg-white/80 border border-[#DF9FA8]/30 p-1 rounded-xl text-xs shadow-xs">
            <button
              onClick={() => {
                setActiveTab('pinned');
                setSearchQuery('');
              }}
              className={`px-3 py-1 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === 'pinned' && !searchQuery
                  ? 'bg-[#C97D8B] text-white font-semibold shadow-xs'
                  : 'text-[#382629]/70 hover:text-[#382629]'
              }`}
            >
              <Pin className="w-3 h-3 text-[#C97D8B]" />
              <span>Pinned</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('recent');
                setSearchQuery('');
              }}
              className={`px-3 py-1 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === 'recent' && !searchQuery
                  ? 'bg-[#C97D8B] text-white font-semibold shadow-xs'
                  : 'text-[#382629]/70 hover:text-[#382629]'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Recent</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('all');
                setSearchQuery('');
              }}
              className={`px-3 py-1 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === 'all' && !searchQuery
                  ? 'bg-[#C97D8B] text-white font-semibold shadow-xs'
                  : 'text-[#382629]/70 hover:text-[#382629]'
              }`}
            >
              <FileText className="w-3 h-3" />
              <span>All Documents</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-[#382629]/50 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vault documents..."
              className="w-full pl-8 pr-3 py-1.5 text-xs glass-input rounded-lg placeholder:text-[#382629]/40 text-[#382629] border border-[#DF9FA8]/30 focus:outline-none focus:border-[#C97D8B]"
            />
          </div>
        </div>

        {/* Document Grid / List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {displayList.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#382629]/70 border border-dashed border-[#DF9FA8]/30 rounded-2xl glass-card bg-white/40">
              <FileText className="w-8 h-8 text-[#C97D8B]/50 mx-auto mb-2" />
              <p className="font-semibold text-[#382629]">No vault documents found</p>
              <p className="text-[#382629]/60 text-[11px] mt-1">
                {searchQuery ? 'Try clearing your search query.' : 'Pin documents or save notes to view them here.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {displayList.map((file) => {
                const folderName = getFolderName(file.parentId);
                return (
                  <div
                    key={`modal-doc-${file.id}`}
                    onClick={() => handleOpenDoc(file.id)}
                    className="p-3.5 rounded-2xl glass-card transition-all cursor-pointer group flex flex-col justify-between hover:border-[#C97D8B]/40 bg-white/70 border border-white/80 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          {file.pinned && (
                            <span className="font-mono text-[10px] text-[#382629] bg-[#DF9FA8]/25 px-1.5 py-0.5 rounded border border-[#DF9FA8]/35 flex items-center gap-1">
                              <Pin className="w-2.5 h-2.5 text-[#C97D8B]" />
                              <span>Pinned</span>
                            </span>
                          )}
                          <span className="font-mono text-[10px] text-[#382629]/70 bg-white/80 px-1.5 py-0.5 rounded border border-[#DF9FA8]/20 uppercase">
                            {file.extension || 'md'}
                          </span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-[#382629]/40 group-hover:text-[#C97D8B] transition-colors" />
                      </div>

                      <h4 className="font-bold text-xs text-[#382629] group-hover:text-[#C97D8B] truncate">
                        {file.name}
                      </h4>

                      {file.content && (
                        <p className="text-[11px] text-[#382629]/70 line-clamp-2 mt-1 leading-relaxed">
                          {file.content.replace(/^#+\s+/g, '')}
                        </p>
                      )}
                    </div>

                    <div className="pt-2.5 mt-2.5 border-t border-[#382629]/10 flex items-center justify-between text-[10px] text-[#382629]/70 font-mono">
                      <span className="flex items-center gap-1 truncate max-w-[150px]">
                        <Folder className="w-2.5 h-2.5 text-[#C97D8B] shrink-0" />
                        <span className="truncate">{folderName}</span>
                      </span>
                      <span>
                        {new Date(file.updatedAt).toLocaleDateString([], {
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

          {/* Vault Folder Overview Footer */}
          <div className="mt-6 p-4 rounded-xl bg-white/70 border border-[#DF9FA8]/25 flex flex-wrap items-center justify-between gap-4 text-xs text-[#382629]/70 shadow-xs">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-[#C97D8B]" />
              <span>
                Vault Folders: <strong className="text-[#382629] font-mono">{folders.length}</strong>
              </span>
              <span>·</span>
              <span>
                Total Notes: <strong className="text-[#382629] font-mono">{fileDocuments.length}</strong>
              </span>
            </div>
            <button
              onClick={() => setVaultDocumentsModalOpen(false)}
              className="text-xs text-[#C97D8B] hover:text-[#382629] font-medium cursor-pointer transition-colors"
            >
              Back to Second Brain Explorer →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
