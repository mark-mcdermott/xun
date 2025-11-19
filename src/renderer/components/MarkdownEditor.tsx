import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

interface MarkdownEditorProps {
  initialContent: string;
  filePath: string;
  onSave: (content: string) => Promise<void>;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  initialContent,
  filePath,
  onSave
}) => {
  const [content, setContent] = useState(initialContent);
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('split');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update content when file changes
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent, filePath]);

  // Auto-save functionality
  const saveContent = useCallback(async () => {
    if (content === initialContent) return; // No changes to save

    setIsSaving(true);
    try {
      await onSave(content);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  }, [content, initialContent, onSave]);

  // Debounced auto-save
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    if (content !== initialContent) {
      autoSaveTimerRef.current = setTimeout(() => {
        saveContent();
      }, 2000); // Save 2 seconds after typing stops
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [content, initialContent, saveContent]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd+S / Ctrl+S to save manually
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      saveContent();
    }

    // Tab key support
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newContent = content.substring(0, start) + '  ' + content.substring(end);
      setContent(newContent);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="h-10 bg-gray-50 border-b border-gray-200 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('edit')}
            className={`px-3 py-1 text-xs rounded ${
              viewMode === 'edit' ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1 text-xs rounded ${
              viewMode === 'split' ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'
            }`}
          >
            Split
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`px-3 py-1 text-xs rounded ${
              viewMode === 'preview' ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'
            }`}
          >
            Preview
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-500">
          {isSaving && <span>Saving...</span>}
          {lastSaved && !isSaving && (
            <span>
              Saved at {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <span className="text-gray-400">Cmd+S to save</span>
        </div>
      </div>

      {/* Editor and Preview */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div
            className={`${
              viewMode === 'split' ? 'w-1/2 border-r border-gray-200' : 'w-full'
            } flex flex-col`}
          >
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              className="flex-1 w-full p-6 font-mono text-sm resize-none focus:outline-none"
              placeholder="Start writing..."
              spellCheck={false}
            />
          </div>
        )}

        {/* Preview */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div
            className={`${
              viewMode === 'split' ? 'w-1/2' : 'w-full'
            } overflow-auto p-6 bg-white`}
          >
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
              >
                {content}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
