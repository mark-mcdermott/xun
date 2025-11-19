import React, { useState, useEffect } from 'react';
import { useVault } from './hooks/useVault';
import { FileTree } from './components/FileTree';
import { MarkdownEditor } from './components/MarkdownEditor';

const App: React.FC = () => {
  const { vaultPath, fileTree, loading, error, readFile, writeFile, getTodayNote } = useVault();

  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');

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

  const handleFileClick = async (path: string) => {
    try {
      const content = await readFile(path);
      setSelectedFile(path);
      setFileContent(content);
    } catch (err: any) {
      console.error('Failed to read file:', err);
      alert(`Failed to read file: ${err.message}`);
    }
  };

  const handleSave = async (content: string) => {
    if (!selectedFile) return;

    try {
      await writeFile(selectedFile, content);
      setFileContent(content);
    } catch (err: any) {
      console.error('Failed to save file:', err);
      throw err;
    }
  };

  if (loading && !fileTree) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-2xl mb-2">⏳</div>
          <p className="text-gray-600">Loading vault...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-2xl mb-2">❌</div>
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="h-12 bg-white border-b border-gray-200 flex items-center px-4">
        <h1 className="text-lg font-semibold text-gray-800">Olite</h1>
        {vaultPath && <span className="ml-4 text-xs text-gray-500">{vaultPath}</span>}
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white">
          <FileTree tree={fileTree} onFileClick={handleFileClick} />
        </div>

        {/* Content area */}
        <div className="flex-1 flex flex-col">
          {selectedFile ? (
            <>
              {/* File header */}
              <div className="h-12 bg-white border-b border-gray-200 flex items-center px-4">
                <span className="text-sm font-medium text-gray-700">{selectedFile}</span>
              </div>

              {/* Markdown Editor */}
              <div className="flex-1 overflow-hidden">
                <MarkdownEditor
                  key={selectedFile}
                  initialContent={fileContent}
                  filePath={selectedFile}
                  onSave={handleSave}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-4">📝</div>
                <p>Select a file to view its contents</p>
                <p className="text-sm mt-2">or</p>
                <p className="text-sm">Today's note will open automatically</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
