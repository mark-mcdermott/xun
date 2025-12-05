import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Settings,
  FileText,
  Code,
  ChevronUp,
  ChevronDown,
  HelpCircle,
  FilePlus,
  FolderPlus,
  X,
  Plus,
  ArrowLeft,
  ArrowRight,
  MoreHorizontal,
  Pencil,
  Link,
  PanelLeftClose,
  PanelLeftOpen,
  Columns,
  BookOpen
} from 'lucide-react';
import { useVault } from './hooks/useVault';
import { useTags } from './hooks/useTags';
import { FileTree } from './components/FileTree';
import { MarkdownEditor } from './components/MarkdownEditor';
import { TagBrowser } from './components/TagBrowser';
import { TagView } from './components/TagView';
import { DailyNotesNav } from './components/DailyNotesNav';
import { CommandPalette } from './components/CommandPalette';
import { Breadcrumb } from './components/Breadcrumb';
import { PublishDialog } from './components/PublishDialog';
import { PublishSettings } from './components/PublishSettings';

type SidebarTab = 'files' | 'tags' | 'daily';
type ViewMode = 'editor' | 'tag-view';
type EditorViewMode = 'edit' | 'split' | 'preview';

const App: React.FC = () => {
  const { vaultPath, fileTree, loading, error, readFile, writeFile, getTodayNote, getDailyNote, getDailyNoteDates, refreshFileTree } = useVault();
  const { tags, loading: tagsLoading, getTagContent, deleteTag, refreshTags } = useTags();

  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('files');
  const [viewMode, setViewMode] = useState<ViewMode>('editor');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [dailyNoteDates, setDailyNoteDates] = useState<string[]>([]);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [editorViewMode, setEditorViewMode] = useState<EditorViewMode>('split');
  const [publishTag, setPublishTag] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Load today's note on mount
  useEffect(() => {
    const loadTodayNote = async () => {
      try {
        const { path, content } = await getTodayNote();
        setSelectedFile(path);
        setFileContent(content);
      } catch (err) {
        console.error('Failed to load today note:', err);
      }
    };

    if (vaultPath) {
      loadTodayNote();
    }
  }, [vaultPath, getTodayNote]);

  // Load daily note dates on mount
  useEffect(() => {
    const loadDates = async () => {
      try {
        const dates = await getDailyNoteDates();
        setDailyNoteDates(dates);
      } catch (err) {
        console.error('Failed to load daily note dates:', err);
      }
    };

    if (vaultPath) {
      loadDates();
    }
  }, [vaultPath, getDailyNoteDates]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+P or Ctrl+P to open command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      // Cmd+, or Ctrl+, to open settings
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        setSettingsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleFileClick = async (path: string) => {
    try {
      const content = await readFile(path);
      setSelectedFile(path);
      setFileContent(content);
      setViewMode('editor');
      setSelectedTag(null);
    } catch (err: any) {
      console.error('Failed to read file:', err);
      alert(`Failed to read file: ${err.message}`);
    }
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag);
    setViewMode('tag-view');
    setSelectedFile(null);
  };

  const handleDateSelect = async (date: string) => {
    try {
      const { path, content } = await getDailyNote(date);
      setSelectedFile(path);
      setFileContent(content);
      setViewMode('editor');
      setSelectedTag(null);

      // Refresh daily note dates in case a new one was created
      const dates = await getDailyNoteDates();
      setDailyNoteDates(dates);
    } catch (err: any) {
      console.error('Failed to load daily note:', err);
      alert(`Failed to load daily note: ${err.message}`);
    }
  };

  const handleSave = async (content: string) => {
    if (!selectedFile) return;

    try {
      await writeFile(selectedFile, content);
      setFileContent(content);

      // Refresh tags after save to pick up new tags
      await refreshTags();
    } catch (err: any) {
      console.error('Failed to save file:', err);
      throw err;
    }
  };

  const handleCommandPaletteFileSelect = async (path: string) => {
    await handleFileClick(path);
  };

  const handleCommandPaletteTagSelect = (tag: string) => {
    setSidebarTab('tags');
    handleTagClick(tag);
  };

  const handleCommandPaletteDateSelect = async (date: string) => {
    setSidebarTab('daily');
    await handleDateSelect(date);
  };

  const handleCreateFile = () => {
    // TODO: Implement file creation dialog
    alert('File creation UI coming soon!');
  };

  const handleCreateFolder = () => {
    // TODO: Implement folder creation dialog
    alert('Folder creation UI coming soon!');
  };

  const handleDeleteTag = async (tag: string) => {
    try {
      const result = await deleteTag(tag);
      alert(`Successfully deleted tag ${tag}!\n\n${result.filesModified.length} files modified\n${result.sectionsDeleted} sections removed`);

      // Refresh file tree and tags
      await refreshFileTree();
      await refreshTags();

      // Return to tags view
      setSelectedTag(null);
      setViewMode('editor');
    } catch (err: any) {
      throw err; // Re-throw to be handled by TagView
    }
  };

  const handlePublish = (tag: string) => {
    setPublishTag(tag);
    setPublishDialogOpen(true);
  };

  if (loading && !fileTree) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-obsidian-bg">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-obsidian-text-secondary">Loading vault...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-obsidian-bg">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-3">
            <span className="text-red-400 text-xl">!</span>
          </div>
          <p className="text-red-400">Error: {error}</p>
        </div>
      </div>
    );
  }

  // Get filename from path for tab display
  const getFileName = (path: string | null) => {
    if (!path) return '';
    const parts = path.split('/');
    return parts[parts.length - 1].replace('.md', '');
  };

  // Calculate word and character count
  const getWordCount = (text: string) => {
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    return words.length;
  };

  const getCharCount = (text: string) => {
    return text.length;
  };

  // Get vault name from path
  const getVaultName = () => {
    if (!vaultPath) return 'vault';
    const parts = vaultPath.split('/');
    return parts[parts.length - 1];
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-obsidian-bg">
      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        fileTree={fileTree}
        tags={tags}
        onFileSelect={handleCommandPaletteFileSelect}
        onTagSelect={handleCommandPaletteTagSelect}
        onDateSelect={handleCommandPaletteDateSelect}
        onCreateFile={handleCreateFile}
        onCreateFolder={handleCreateFolder}
      />

      {/* Publish Dialog */}
      {publishDialogOpen && publishTag && (
        <PublishDialog
          tag={publishTag}
          onClose={() => {
            setPublishDialogOpen(false);
            setPublishTag(null);
          }}
        />
      )}

      {/* Settings Dialog */}
      {settingsOpen && (
        <PublishSettings onClose={() => setSettingsOpen(false)} vaultPath={vaultPath} />
      )}

      {/* Top bar - spans full width */}
      <div className="h-[45px] flex items-center" style={{ backgroundColor: '#f6f6f6', borderBottom: '1px solid #e0e0e0' }}>
        {/* Left section - same width as both sidebars (44px + 1px border + 260px = 305px, or just 45px when collapsed) */}
        <div className={`h-full flex items-center ${sidebarCollapsed ? 'w-auto' : 'w-[305px]'}`} style={{ borderRight: sidebarCollapsed ? 'none' : '1px solid #e0e0e0' }}>
          {/* macOS traffic light space */}
          <div className="w-[70px] h-full" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties} />

          {/* Collapse sidebar button */}
          <div className="flex items-center justify-end h-full flex-1" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
            <button className="h-full px-3 hover:bg-[#e8e8e8] transition-colors cursor-pointer" style={{ color: '#737373', backgroundColor: 'transparent', marginLeft: sidebarCollapsed ? '10px' : '0' }} title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
              {sidebarCollapsed ? <PanelLeftOpen size={22} strokeWidth={1.5} style={{ marginTop: '1px' }} /> : <PanelLeftClose size={20} strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        {/* Tab bar in title bar */}
        <div className="flex items-end h-full flex-1" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
          {selectedFile && (
            <div className="flex items-end h-full" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
              {/* Active tab */}
              <div className="flex items-center gap-2" style={{ backgroundColor: '#ffffff', borderRight: '1px solid #e0e0e0', borderTop: '1px solid #e0e0e0', borderLeft: '1px solid #e0e0e0', borderBottom: '1px solid #ffffff', marginLeft: sidebarCollapsed ? '15px' : '12px', height: 'calc(100% - 8px)', paddingLeft: '10px', paddingRight: '4px', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', marginBottom: '-1px' }}>
                <span style={{ fontSize: '13.5px', color: '#4a4a4a', marginRight: '64px' }}>{getFileName(selectedFile)}</span>
                <button className="p-0.5 rounded transition-colors flex items-center justify-center" style={{ color: '#4a4a4a', backgroundColor: 'transparent' }} title="Close tab">
                  <X size={16} strokeWidth={2} />
                </button>
              </div>
              {/* New tab button */}
              <button className="h-full transition-colors flex items-center justify-center" style={{ color: '#808080', backgroundColor: 'transparent', paddingLeft: '12px', paddingRight: '8px' }} title="New tab">
                <Plus size={18} strokeWidth={1.5} style={{ marginTop: '2px' }} />
              </button>
            </div>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex items-center pr-3 gap-1" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          {/* <button className="p-1 hover:bg-[#e8e8e8] rounded" style={{ color: '#737373' }}>
            <ChevronDown size={16} strokeWidth={1.5} />
          </button> */}
        </div>
      </div>

      {/* Main area below top bar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Far-left Icon Sidebar */}
        <div className="w-[44px] min-w-[44px] flex-shrink-0 flex flex-col items-center" style={{ backgroundColor: '#f6f6f6', borderRight: '1px solid #e0e0e0', paddingTop: '16px' }}>
          {/* Top icons */}
          <button className="p-2 hover:bg-[#e8e8e8] rounded transition-colors" style={{ color: '#737373', backgroundColor: 'transparent', marginBottom: '8px' }} title="Calendar" onClick={() => setSidebarTab('daily')}>
            <Calendar size={20} strokeWidth={1.5} />
          </button>
          <button className="p-2 hover:bg-[#e8e8e8] rounded transition-colors" style={{ color: '#737373', backgroundColor: 'transparent', marginBottom: '8px' }} title="Files" onClick={() => setSidebarTab('files')}>
            <FileText size={20} strokeWidth={1.5} />
          </button>
          <button className="p-2 hover:bg-[#e8e8e8] rounded transition-colors" style={{ color: '#737373', backgroundColor: 'transparent' }} title="Tags" onClick={() => setSidebarTab('tags')}>
            <Code size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Left Sidebar - File tree with toolbar */}
        {!sidebarCollapsed && (
        <div className="w-[260px] flex flex-col" style={{ backgroundColor: '#f6f6f6', borderRight: '1px solid #e0e0e0', paddingTop: '16px' }}>
          {/* Sidebar toolbar */}
          <div className="h-9 flex items-center" style={{ backgroundColor: 'transparent', marginBottom: '16px', paddingLeft: '20px' }}>
            <div className="flex items-center gap-0.5">
              <button className="p-1.5 hover:bg-[#e8e8e8] rounded transition-colors" style={{ color: '#737373', backgroundColor: 'transparent' }} title="New note" onClick={handleCreateFile}>
                <FilePlus size={20} strokeWidth={1.5} />
              </button>
              <button className="p-1.5 hover:bg-[#e8e8e8] rounded transition-colors" style={{ color: '#737373', backgroundColor: 'transparent' }} title="New folder" onClick={handleCreateFolder}>
                <FolderPlus size={20} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Sidebar content */}
          <div className="flex-1 overflow-y-auto" style={{ paddingLeft: '13px' }}>
            {sidebarTab === 'daily' ? (
              <DailyNotesNav
                onDateSelect={handleDateSelect}
                currentDate={selectedFile?.includes('daily-notes/') ? selectedFile.split('/').pop()?.replace('.md', '') : null}
                existingDates={dailyNoteDates}
              />
            ) : sidebarTab === 'files' ? (
              <FileTree tree={fileTree} onFileClick={handleFileClick} />
            ) : (
              <TagBrowser
                tags={tags}
                selectedTag={selectedTag}
                onTagClick={handleTagClick}
              />
            )}
          </div>

          {/* Bottom vault selector and settings - all on one row */}
          <div className="px-2 flex items-center justify-between" style={{ borderTop: '1px solid #e0e0e0', paddingTop: '10px', paddingBottom: '10px' }}>
            <button className="flex items-center px-2 py-1.5 hover:bg-[#e8e8e8] rounded text-xs" style={{ color: '#737373', backgroundColor: 'transparent' }}>
              <div className="flex flex-col items-center" style={{ marginRight: '6px', marginLeft: '8px' }}>
                <ChevronUp size={12} strokeWidth={2} className="mb-[-4px]" />
                <ChevronDown size={12} strokeWidth={2} />
              </div>
              <span className="truncate text-left" style={{ fontWeight: 600 }}>{getVaultName()}</span>
            </button>
            <div className="flex items-center gap-1">
              {/* <button className="p-1.5 hover:bg-[#e8e8e8] rounded transition-colors" style={{ color: '#737373', backgroundColor: 'transparent' }} title="Help">
                <HelpCircle size={16} strokeWidth={1.5} />
              </button> */}
              <button className="p-1.5 hover:bg-[#e8e8e8] rounded transition-colors" style={{ color: '#737373', backgroundColor: 'transparent', marginRight: '8px' }} title="Settings" onClick={() => setSettingsOpen(true)}>
                <Settings size={18} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
        )}

        {/* Main content area */}
        <div className="flex-1 flex flex-col bg-white">

        {viewMode === 'editor' && selectedFile ? (
          <>
            {/* Navigation bar with breadcrumb */}
            <div className="flex items-center px-3 relative" style={{ paddingTop: '10px', paddingBottom: '10px' }}>
              {/* Left side - arrow buttons */}
              {/* <div className="flex items-center gap-2">
                <button className="p-1 rounded transition-colors" style={{ color: '#737373', backgroundColor: 'transparent' }} title="Back">
                  <ArrowLeft size={18} strokeWidth={1.5} />
                </button>
                <button className="p-1 rounded transition-colors" style={{ color: '#737373', backgroundColor: 'transparent' }} title="Forward">
                  <ArrowRight size={18} strokeWidth={1.5} />
                </button>
              </div> */}

              {/* Center - breadcrumbs */}
              <div className="absolute left-1/2 transform -translate-x-1/2">
                <Breadcrumb path={selectedFile} />
              </div>

              {/* Right side - view mode icon */}
              <div className="flex items-center gap-1 ml-auto">
                <button
                  className="p-1 rounded transition-colors"
                  style={{ color: '#737373', backgroundColor: 'transparent' }}
                  title={`View mode: ${editorViewMode}`}
                  onClick={() => {
                    const modes: EditorViewMode[] = ['edit', 'split', 'preview'];
                    const currentIndex = modes.indexOf(editorViewMode);
                    setEditorViewMode(modes[(currentIndex + 1) % 3]);
                  }}
                >
                  {editorViewMode === 'edit' && <Pencil size={18} strokeWidth={1.5} />}
                  {editorViewMode === 'split' && <Columns size={18} strokeWidth={1.5} />}
                  {editorViewMode === 'preview' && <BookOpen size={18} strokeWidth={1.5} />}
                </button>
                {/* <button className="p-1 rounded transition-colors" style={{ color: '#737373', backgroundColor: 'transparent' }} title="More options">
                  <MoreHorizontal size={18} strokeWidth={1.5} />
                </button> */}
              </div>
            </div>

            {/* Markdown Editor */}
            <div className="flex-1 overflow-hidden">
              <MarkdownEditor
                key={selectedFile}
                initialContent={fileContent}
                filePath={selectedFile}
                onSave={handleSave}
                viewMode={editorViewMode}
              />
            </div>

            {/* Status bar - matching Obsidian layout */}
            <div className="flex items-center justify-end">
              <div className="flex items-center" style={{ color: '#5c5c5c', gap: '28px', backgroundColor: '#f6f6f6', padding: '6px 13px', fontSize: '12.75px', borderTop: '1px solid #e0e0e0', borderLeft: '1px solid #e0e0e0', borderTopLeftRadius: '8px' }}>
                <div className="flex items-center gap-1">
                  <Link size={12} strokeWidth={1.5} style={{ marginRight: '3px' }} />
                  <span>0 backlinks</span>
                </div>
                <div className="flex items-center gap-1">
                  <Pencil size={12} strokeWidth={1.5} style={{ marginRight: '3px' }} />
                  <span>{getWordCount(fileContent)} {getWordCount(fileContent) === 1 ? 'word' : 'words'}</span>
                </div>
                <span>{getCharCount(fileContent)} {getCharCount(fileContent) === 1 ? 'character' : 'characters'}</span>
              </div>
            </div>
          </>
        ) : viewMode === 'tag-view' && selectedTag ? (
          <TagView
            tag={selectedTag}
            getContent={getTagContent}
            onDeleteTag={handleDeleteTag}
            onPublish={handlePublish}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-xl bg-[#f5f5f5] flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8" style={{ color: '#999999' }} strokeWidth={1.5} />
              </div>
              <p className="text-[#5c5c5c] mb-1">Select a file to view</p>
              <p className="text-xs" style={{ color: '#999999' }}>
                Press <kbd className="px-1.5 py-0.5 bg-[#f5f5f5] rounded text-[#5c5c5c]">⌘P</kbd> to open command palette
              </p>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default App;
