import React, { useState, useEffect } from 'react';

interface PublishDialogProps {
  tag: string;
  onClose: () => void;
}

interface BlogTarget {
  id: string;
  name: string;
}

interface PublishStep {
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  message?: string;
}

type PublishStatus = 'pending' | 'preparing' | 'pushing' | 'building' | 'deploying' | 'completed' | 'failed';

export const PublishDialog: React.FC<PublishDialogProps> = ({ tag, onClose }) => {
  const [blogs, setBlogs] = useState<BlogTarget[]>([]);
  const [selectedBlogId, setSelectedBlogId] = useState<string>('');
  const [publishing, setPublishing] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<PublishStatus>('pending');
  const [progress, setProgress] = useState(0);
  const [steps, setSteps] = useState<PublishStep[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Handle escape key to close modal (only when not publishing)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !publishing) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [publishing]);

  useEffect(() => {
    loadBlogs();
  }, []);

  useEffect(() => {
    if (jobId) {
      subscribeToProgress();
      return () => {
        window.electronAPI.publish.unsubscribe(jobId);
      };
    }
  }, [jobId]);

  const loadBlogs = async () => {
    try {
      const result = await window.electronAPI.publish.getBlogs();
      console.log('PublishDialog: getBlogs result:', result);
      if (result.success && result.blogs) {
        console.log('PublishDialog: Blogs loaded:', result.blogs);
        setBlogs(result.blogs);
        if (result.blogs.length > 0) {
          setSelectedBlogId(result.blogs[0].id);
        }
      } else {
        console.error('PublishDialog: Failed to load blogs:', result.error);
      }
    } catch (error) {
      console.error('Failed to load blogs:', error);
    }
  };

  const subscribeToProgress = async () => {
    if (!jobId) return;

    await window.electronAPI.publish.subscribe(jobId, (data: any) => {
      setStatus(data.status);
      setProgress(data.progress);
      setSteps(data.steps || []);
      if (data.error) {
        setError(data.error);
      }
    });
  };

  const handlePublish = async () => {
    if (!selectedBlogId) return;

    try {
      setPublishing(true);
      setError(null);

      const result = await window.electronAPI.publish.toBlog(selectedBlogId, tag);

      if (result.success && result.jobId) {
        setJobId(result.jobId);
      } else {
        setError(result.error || 'Failed to start publish job');
        setPublishing(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to publish');
      setPublishing(false);
    }
  };

  const handleClose = () => {
    if (jobId) {
      window.electronAPI.publish.unsubscribe(jobId);
    }
    onClose();
  };

  const getStatusColor = (status: PublishStatus) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'failed':
        return 'text-red-500';
      case 'preparing':
      case 'pushing':
      case 'building':
      case 'deploying':
        return 'text-accent';
      default:
        return 'text-obsidian-text-secondary';
    }
  };

  const getStepIcon = (stepStatus: PublishStep['status']) => {
    switch (stepStatus) {
      case 'completed':
        return '✓';
      case 'in_progress':
        return '⋯';
      case 'failed':
        return '✗';
      default:
        return '○';
    }
  };

  if (blogs.length === 0) {
    return (
      <div
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--dialog-backdrop)', zIndex: 9999 }}
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ width: '360px', backgroundColor: 'var(--dialog-bg)', border: '1px solid var(--border-light)', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', padding: '24px', borderRadius: '12px' }}
        >
          <h2 className="font-semibold mb-2" style={{ fontSize: '18px', color: 'var(--dialog-heading)' }}>
            No Blogs Configured
          </h2>
          <p className="mb-6" style={{ fontSize: '14px', color: 'var(--dialog-text)', lineHeight: '1.5' }}>
            You need to configure at least one blog before publishing. Open Settings to add one.
          </p>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="transition-colors"
              style={{
                padding: '11px 20px',
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--btn-secondary-text)',
                backgroundColor: 'var(--dialog-bg)',
                border: '1px solid var(--btn-secondary-border)',
                borderRadius: '8px',
                boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.06)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--btn-secondary-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--dialog-bg)'}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--dialog-backdrop)', zIndex: 9999 }}
      onClick={() => !publishing && handleClose()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: '400px', backgroundColor: 'var(--dialog-bg)', border: '1px solid var(--border-light)', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', padding: '24px', borderRadius: '12px' }}
      >
        <h2 className="font-semibold mb-4" style={{ fontSize: '18px', color: 'var(--dialog-heading)' }}>
          Publish <span style={{ color: 'var(--accent-primary)' }}>{tag}</span>
        </h2>

        {!publishing ? (
          <>
            <div className="mb-6">
              <label className="block" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--dialog-text)', marginBottom: '12px' }}>
                Select Blog
              </label>
              <select
                value={selectedBlogId}
                onChange={e => setSelectedBlogId(e.target.value)}
                className="w-full outline-none cursor-pointer appearance-none"
                style={{
                  padding: '14px 44px 14px 16px',
                  fontSize: '15px',
                  fontWeight: 500,
                  border: '1px solid var(--btn-secondary-border)',
                  backgroundColor: 'var(--dialog-bg)',
                  color: 'var(--dialog-heading)',
                  borderRadius: '10px',
                  boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 14px center',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--input-border)';
                  e.currentTarget.style.boxShadow = '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)';
                }}
              >
                {blogs.map(blog => (
                  <option key={blog.id} value={blog.id}>
                    {blog.name || 'Unnamed Blog'}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-4 justify-end" style={{ marginTop: '24px' }}>
              <button
                onClick={handleClose}
                className="transition-colors"
                style={{
                  padding: '11px 20px',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'var(--btn-secondary-text)',
                  backgroundColor: 'var(--dialog-bg)',
                  border: '1px solid var(--btn-secondary-border)',
                  borderRadius: '8px',
                  boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.06)',
                  marginRight: '8px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--btn-secondary-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--dialog-bg)'}
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                className="transition-colors"
                style={{
                  padding: '11px 20px',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'var(--btn-primary-text)',
                  backgroundColor: 'var(--accent-primary)',
                  border: '1px solid var(--accent-primary-hover)',
                  borderRadius: '8px',
                  boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.06)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
              >
                Publish
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontSize: '14px', fontWeight: 500, color: status === 'completed' ? 'var(--status-success)' : status === 'failed' ? 'var(--status-error)' : 'var(--accent-primary)' }}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
                <span style={{ fontSize: '14px', color: 'var(--dialog-text)' }}>
                  {progress}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full rounded-full h-1.5 mb-4" style={{ backgroundColor: 'var(--progress-bg)' }}>
                <div
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: status === 'failed' ? 'var(--status-error)' : status === 'completed' ? 'var(--status-success)' : 'var(--progress-fill)'
                  }}
                />
              </div>

              {/* Steps */}
              <div className="space-y-2">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span style={{
                      fontSize: '14px',
                      color: step.status === 'completed' ? 'var(--status-success)' : step.status === 'failed' ? 'var(--status-error)' : step.status === 'in_progress' ? 'var(--accent-primary)' : 'var(--text-muted)'
                    }}>
                      {getStepIcon(step.status)}
                    </span>
                    <div className="flex-1">
                      <p style={{ fontSize: '14px', color: 'var(--dialog-heading)' }}>{step.name}</p>
                      {step.message && (
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{step.message}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {error && (
                <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--status-error-bg)', border: '1px solid var(--status-error-border)' }}>
                  <p style={{ fontSize: '14px', color: 'var(--status-error)' }}>{error}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              {(status === 'completed' || status === 'failed') && (
                <button
                  onClick={handleClose}
                  className="transition-colors"
                  style={{
                    padding: '11px 20px',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'var(--btn-secondary-text)',
                    backgroundColor: 'var(--dialog-bg)',
                    border: '1px solid var(--btn-secondary-border)',
                    borderRadius: '8px',
                    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.06)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--btn-secondary-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--dialog-bg)'}
                >
                  Close
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
