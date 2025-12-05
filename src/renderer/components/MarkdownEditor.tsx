import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

interface MarkdownEditorProps {
  initialContent: string;
  filePath: string;
  onSave: (content: string) => Promise<void>;
  viewMode: 'edit' | 'preview' | 'split';
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  initialContent,
  filePath,
  onSave,
  viewMode
}) => {
  const [content, setContent] = useState(initialContent);
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
    <div className="flex flex-col h-full bg-obsidian-bg">
      {/* Editor and Preview */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div
            className={`${
              viewMode === 'split' ? 'w-1/2' : 'w-full'
            } flex flex-col`}
          >
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              className="flex-1 w-full font-mono text-sm resize-none focus:outline-none bg-obsidian-bg text-obsidian-text placeholder-obsidian-text-muted leading-relaxed"
              style={{ padding: viewMode === 'edit' ? '40px 24px 24px 48px' : '24px' }}
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
            } overflow-auto bg-obsidian-bg`}
            style={{ padding: `10px 24px 24px ${viewMode === 'preview' ? '45px' : '90px'}` }}
          >
            <div className="prose prose-sm max-w-none" style={{ overflow: 'hidden' }}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                components={{
                  h1: ({ children }) => <h1 style={{ marginLeft: 0, paddingLeft: 0 }}>{children}</h1>,
                  h2: ({ children }) => <h2 style={{ marginLeft: 0, paddingLeft: 0 }}>{children}</h2>,
                  p: ({ children }) => <p style={{ marginLeft: 0, paddingLeft: 0 }}>{children}</p>,
                }}
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
