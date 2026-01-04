import React, { useEffect, useRef } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'OK',
  cancelText = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel
}) => {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => confirmButtonRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed z-50 flex items-center justify-center"
      style={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      }}
      onClick={onCancel}
    >
      <div
        className="shadow-xl w-[400px]"
        style={{ backgroundColor: 'var(--dialog-bg)', borderRadius: '12px', padding: '20px' }}
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border-primary)' }}>
          <div className="flex items-center gap-2">
            {variant === 'danger' && (
              <AlertTriangle size={18} style={{ color: 'var(--status-error)', marginRight: '8px' }} />
            )}
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dialog-heading)' }}>
              {title}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded hover:bg-[var(--dialog-hover)] transition-colors"
            style={{ color: 'var(--text-icon)', backgroundColor: 'transparent' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 px-4 pb-4">
          <button
            type="button"
            onClick={onCancel}
            className="transition-colors"
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '8px',
              boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.06)',
              color: 'var(--btn-secondary-text)',
              backgroundColor: 'var(--btn-secondary-bg)',
              border: '1px solid var(--btn-secondary-border)',
              marginRight: '16px'
            }}
          >
            {cancelText}
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            onClick={onConfirm}
            className="transition-colors"
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '8px',
              boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.06)',
              border: '1px solid var(--btn-secondary-border)',
              ...(variant === 'danger'
                ? { color: 'white', backgroundColor: 'var(--status-error)' }
                : { color: 'var(--btn-secondary-text)', backgroundColor: 'var(--btn-secondary-bg)' }
              )
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
