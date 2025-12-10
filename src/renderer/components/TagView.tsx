import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { Trash2, Rocket, ArrowLeft, ArrowRight, Pencil, Eye } from 'lucide-react';

interface TaggedContent {
  date: string;
  filePath: string;
  content: string;
}

interface TagViewProps {
  tag: string;
  getContent: (tag: string) => Promise<TaggedContent[]>;
  onDeleteTag?: (tag: string) => Promise<void>;
  onPublish?: (tag: string) => void;
  onUpdateContent?: (filePath: string, oldContent: string, newContent: string) => Promise<void>;
  canGoBack?: boolean;
  canGoForward?: boolean;
  goBack?: () => void;
  goForward?: () => void;
}

export const TagView: React.FC<TagViewProps> = ({ tag, getContent, onDeleteTag, onPublish, onUpdateContent, canGoBack, canGoForward, goBack, goForward }) => {
  const [content, setContent] = useState<TaggedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState<Record<number, string>>({});

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showDeleteConfirm) {
        setShowDeleteConfirm(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showDeleteConfirm]);

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getContent(tag);
        setContent(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [tag, getContent]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-obsidian-bg">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <div className="text-obsidian-text-secondary">Loading {tag}...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-obsidian-bg">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  if (content.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-obsidian-bg">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-obsidian-surface flex items-center justify-center mx-auto mb-3">
            <span className="text-accent text-2xl font-bold">#</span>
          </div>
          <p className="text-obsidian-text-secondary">No content found for {tag}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Navigation bar */}
      <div className="flex-shrink-0 flex items-center px-3" style={{ paddingTop: '10px', paddingBottom: '10px' }}>
        <div className="flex items-center gap-2">
          <button
            className={`p-1 rounded transition-colors ${canGoBack ? 'hover:bg-[var(--hover-bg)]' : 'opacity-40 cursor-default'}`}
            style={{ color: 'var(--sidebar-icon)', backgroundColor: 'transparent' }}
            title="Back"
            onClick={goBack}
            disabled={!canGoBack}
          >
            <ArrowLeft size={18} strokeWidth={1.5} />
          </button>
          <button
            className={`p-1 rounded transition-colors ${canGoForward ? 'hover:bg-[var(--hover-bg)]' : 'opacity-40 cursor-default'}`}
            style={{ color: 'var(--sidebar-icon)', backgroundColor: 'transparent' }}
            title="Forward"
            onClick={goForward}
            disabled={!canGoForward}
          >
            <ArrowRight size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="flex-shrink-0 pr-6 pb-4" style={{ paddingLeft: '36px' }}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-obsidian-text flex items-center gap-2">
              <span className="text-accent">#</span>
              {tag.substring(1)}
            </h1>
            <p className="text-sm text-obsidian-text-muted mt-1">
              {content.length} {content.length === 1 ? 'entry' : 'entries'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className="p-2 transition-colors"
              style={{ color: 'var(--sidebar-icon)', backgroundColor: 'transparent', borderRadius: '6px' }}
              title={isEditMode ? "Preview mode" : "Edit mode"}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {isEditMode ? <Pencil size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
            </button>
            {onDeleteTag && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 transition-colors"
                style={{ color: 'var(--status-error)', backgroundColor: 'transparent', borderRadius: '6px' }}
                title="Delete all content with this tag"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--status-error-bg)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Trash2 size={18} strokeWidth={1.5} />
              </button>
            )}
            <button
              onClick={() => onPublish?.(tag)}
              className="p-2 transition-colors"
              style={{ color: 'var(--sidebar-icon)', backgroundColor: 'transparent', borderRadius: '6px', marginRight: '16px' }}
              title="Publish"
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Rocket size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--dialog-backdrop)', zIndex: 9999 }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '360px',
              backgroundColor: 'var(--dialog-bg)',
              border: '1px solid var(--border-light)',
              boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
              padding: '24px',
              borderRadius: '12px'
            }}
          >
            <h2 className="font-semibold mb-2" style={{ fontSize: '18px', color: 'var(--dialog-heading)' }}>Delete Tag Content?</h2>
            <p className="mb-4" style={{ fontSize: '14px', color: 'var(--dialog-text)', lineHeight: '1.5' }}>
              This will permanently delete all content tagged with <strong style={{ color: 'var(--accent-primary)' }}>{tag}</strong> from your notes.
              This action cannot be undone.
            </p>
            <p className="mb-6" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {content.length} {content.length === 1 ? 'section' : 'sections'} will be removed from your files.
            </p>
            <div className="flex gap-4 justify-end" style={{ marginTop: '24px' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="transition-colors"
                style={{
                  padding: '11px 20px',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'var(--btn-secondary-text)',
                  backgroundColor: 'var(--btn-secondary-bg)',
                  border: '1px solid var(--btn-secondary-border)',
                  borderRadius: '8px',
                  boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.06)',
                  marginRight: '8px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--btn-secondary-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--btn-secondary-bg)'}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    if (onDeleteTag) {
                      await onDeleteTag(tag);
                      setShowDeleteConfirm(false);
                    }
                  } catch (err: any) {
                    alert(`Failed to delete tag: ${err.message}`);
                  }
                }}
                className="transition-colors"
                style={{
                  padding: '11px 20px',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'var(--btn-danger-text)',
                  backgroundColor: 'var(--btn-danger-bg)',
                  border: '1px solid var(--btn-danger-bg)',
                  borderRadius: '8px',
                  boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.06)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--btn-danger-bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--btn-danger-bg)'}
              >
                Delete {content.length} {content.length === 1 ? 'Section' : 'Sections'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scrollable content area */}
      <div className="flex-1 overflow-auto">
        <div className="space-y-6" style={{ padding: '24px 24px 24px 36px' }}>
          {content.map((item, index) => (
            <div
              key={`${item.date}-${index}`}
              className="border-l-2 border-accent/50 py-1"
              style={{ paddingLeft: '28px' }}
            >
              {/* Meta info */}
              <div className="flex items-center gap-3 mb-3 text-sm">
                <span className="font-medium text-obsidian-text-secondary">{item.date}</span>
                <span className="text-obsidian-text-muted">•</span>
                <span className="text-xs text-obsidian-text-muted">{item.filePath}</span>
              </div>

              {/* Content */}
              {isEditMode ? (
                <textarea
                  value={editedContent[index] !== undefined ? editedContent[index] : item.content}
                  onChange={(e) => {
                    setEditedContent(prev => ({ ...prev, [index]: e.target.value }));
                  }}
                  onBlur={async () => {
                    const newContent = editedContent[index];
                    if (newContent !== undefined && newContent !== item.content && onUpdateContent) {
                      try {
                        await onUpdateContent(item.filePath, item.content, newContent);
                        // Update the local content state to reflect the save
                        setContent(prev => prev.map((c, i) => i === index ? { ...c, content: newContent } : c));
                      } catch (err: any) {
                        console.error('Failed to save content:', err);
                      }
                    }
                  }}
                  className="w-full min-h-[100px] p-3 rounded-lg resize-y"
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    border: '1px solid var(--border-primary)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--input-text)'
                  }}
                />
              ) : (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw, rehypeSanitize]}
                    components={{
                      a: ({ href, children }) => (
                        <a href={href} style={{ color: 'var(--editor-link)', textDecoration: 'underline' }}>
                          {children}
                        </a>
                      )
                    }}
                  >
                    {item.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer note - fixed bottom right */}
      <div className="flex-shrink-0 flex justify-end px-4 py-3">
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Read-only view aggregating all content tagged with {tag}
        </span>
      </div>
    </div>
  );
};
