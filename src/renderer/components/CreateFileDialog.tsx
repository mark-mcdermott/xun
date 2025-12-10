import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface CreateFileDialogProps {
  isOpen: boolean;
  type: 'file' | 'folder';
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
}

export const CreateFileDialog: React.FC<CreateFileDialogProps> = ({
  isOpen,
  type,
  onClose,
  onCreate
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    // Validate name
    if (type === 'file' && !name.endsWith('.md')) {
      setError('File name must end with .md');
      return;
    }

    if (/[<>:"/\\|?*]/.test(name)) {
      setError('Name contains invalid characters');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      await onCreate(name.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create');
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'var(--dialog-backdrop)' }}
      onClick={onClose}
    >
      <div
        className="rounded-lg shadow-xl w-[400px]"
        style={{ backgroundColor: 'var(--dialog-bg)' }}
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border-primary)' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dialog-heading)' }}>
            {type === 'file' ? 'New Note' : 'New Folder'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[var(--dialog-hover)] transition-colors"
            style={{ color: 'var(--text-icon)', backgroundColor: 'transparent' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block mb-1.5"
              style={{ fontSize: '13px', color: 'var(--dialog-label)' }}
            >
              {type === 'file' ? 'Note name' : 'Folder name'}
            </label>
            <input
              ref={inputRef}
              type="text"
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={type === 'file' ? 'my-note.md' : 'my-folder'}
              className="w-full px-3 py-2 rounded"
              style={{
                fontSize: '13px',
                border: '1px solid var(--input-border)',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--input-text)'
              }}
            />
            {error && (
              <p className="mt-1.5" style={{ fontSize: '12px', color: 'var(--status-error)' }}>
                {error}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded transition-colors"
              style={{
                fontSize: '13px',
                color: 'var(--btn-secondary-text)',
                backgroundColor: 'transparent',
                border: '1px solid var(--btn-secondary-border)'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="px-3 py-1.5 rounded transition-colors"
              style={{
                fontSize: '13px',
                color: 'var(--btn-primary-text)',
                backgroundColor: isCreating ? 'var(--text-muted)' : 'var(--text-icon)',
                border: 'none'
              }}
            >
              {isCreating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
