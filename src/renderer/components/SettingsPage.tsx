import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Trash2, Edit2, Github, Cloud, Power, Coffee, Bug, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { ConfirmDialog } from './ConfirmDialog';
import { useToast } from './Toast';

interface VaultEntry {
  id: string;
  name: string;
  path: string;
  dailyNotesPath: string;
  createdAt: string;
}

interface BlogTarget {
  id: string;
  name: string;
  github: {
    repo: string;
    branch: string;
    token: string;
  };
  cloudflare?: {
    accountId: string;
    projectName: string;
    token: string;
  };
  content: {
    path: string;
    livePostPath?: string;
    format: 'single-file' | 'multi-file';
    filename?: string;
  };
}

interface SettingsPageProps {
  vaultPath?: string | null;
  onVaultSwitch?: () => Promise<void>;
  onBlogDeleted?: () => Promise<void>;
  onBlogSaved?: () => Promise<void>;
  onOpenMerch?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onVaultSwitch, onBlogDeleted, onBlogSaved, onOpenMerch }) => {
  const [blogs, setBlogs] = useState<BlogTarget[]>([]);
  const [editingBlog, setEditingBlog] = useState<BlogTarget | null>(null);
  const [loading, setLoading] = useState(true);
  const [testingGitHub, setTestingGitHub] = useState(false);
  const [testingCloudflare, setTestingCloudflare] = useState(false);

  // Toast notifications
  const { showToast, updateToast } = useToast();

  // Multi-vault state
  const [vaults, setVaults] = useState<VaultEntry[]>([]);
  const [activeVaultId, setActiveVaultId] = useState<string | null>(null);
  const [deleteVaultConfirm, setDeleteVaultConfirm] = useState<VaultEntry | null>(null);
  const [deleteBlogConfirm, setDeleteBlogConfirm] = useState<BlogTarget | null>(null);
  const [syncingBlogId, setSyncingBlogId] = useState<string | null>(null);

  useEffect(() => {
    loadBlogs();
    loadVaults();
  }, []);

  const loadBlogs = async () => {
    try {
      const result = await window.electronAPI.publish.getBlogs();
      if (result.success) {
        setBlogs(result.blogs || []);
      }
    } catch (error) {
      console.error('Failed to load blogs:', error);
    }
  };

  const loadVaults = async () => {
    try {
      setLoading(true);
      const result = await window.electronAPI.vault.getAll();
      if (result.success) {
        setVaults(result.vaults || []);
        setActiveVaultId(result.activeVaultId || null);
      }
    } catch (error) {
      console.error('Failed to load vaults:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBlog = () => {
    setEditingBlog({
      id: crypto.randomUUID(),
      name: '',
      github: {
        repo: '',
        branch: 'main',
        token: ''
      },
      cloudflare: {
        accountId: '',
        projectName: '',
        token: ''
      },
      content: {
        path: 'src/content/posts/',
        livePostPath: '/posts/',
        format: 'single-file',
        filename: '{tag}.md'
      }
    });
  };

  const handleEditBlog = (blog: BlogTarget) => {
    setEditingBlog({ ...blog });
  };

  const handleSaveBlog = async () => {
    if (!editingBlog) return;

    // Validate required fields
    const errors: string[] = [];

    if (!editingBlog.name.trim()) {
      errors.push('Blog name is required');
    }
    if (!editingBlog.github.repo.trim()) {
      errors.push('GitHub repository is required');
    }
    if (!editingBlog.github.branch.trim()) {
      errors.push('GitHub branch is required');
    }
    if (!editingBlog.github.token.trim()) {
      errors.push('GitHub token is required');
    }
    if (!editingBlog.content.path.trim()) {
      errors.push('Content path is required');
    }
    if (!editingBlog.content.filename?.trim()) {
      errors.push('Filename template is required');
    }

    // Cloudflare fields are optional, but if any are filled, all must be filled
    const cf = editingBlog.cloudflare;
    if (cf && (cf.accountId || cf.projectName || cf.token)) {
      if (!cf.accountId.trim()) {
        errors.push('Cloudflare account ID is required when using Cloudflare');
      }
      if (!cf.projectName.trim()) {
        errors.push('Cloudflare project name is required when using Cloudflare');
      }
      if (!cf.token.trim()) {
        errors.push('Cloudflare API token is required when using Cloudflare');
      }
    }

    if (errors.length > 0) {
      alert('Please fix the following errors:\n\n' + errors.join('\n'));
      return;
    }

    try {
      const result = await window.electronAPI.publish.saveBlog(editingBlog);
      if (result.success) {
        await loadBlogs();
        setEditingBlog(null);
        // Notify parent to refresh blogs list
        if (onBlogSaved) {
          await onBlogSaved();
        }
      }
    } catch (error) {
      console.error('Failed to save blog:', error);
    }
  };

  const handleDeleteBlogClick = (blog: BlogTarget) => {
    setDeleteBlogConfirm(blog);
  };

  const handleDeleteBlogConfirm = async () => {
    if (!deleteBlogConfirm) return;

    try {
      const result = await window.electronAPI.publish.deleteBlog(deleteBlogConfirm.id);
      if (result.success) {
        setDeleteBlogConfirm(null);
        await loadBlogs();
        // Refresh remote folders in file tree
        if (onBlogDeleted) {
          await onBlogDeleted();
        }
      }
    } catch (error) {
      console.error('Failed to delete blog:', error);
    }
  };

  const handleSyncBlog = async (blogId: string) => {
    // Prevent double-clicks
    if (syncingBlogId) return;

    setSyncingBlogId(blogId);
    const blog = blogs.find(b => b.id === blogId);
    const blogName = blog?.name || 'Blog';

    let toastId: string | null = null;
    try {
      toastId = showToast({
        type: 'loading',
        title: 'Syncing...',
        message: `Fetching posts from ${blogName}`
      });

      const result = await window.electronAPI.cms.refreshBlog(blogId);
      if (result.success) {
        updateToast(toastId, {
          type: 'success',
          title: 'Sync Complete',
          message: `Successfully synced posts from ${blogName}`
        });
      } else {
        updateToast(toastId, {
          type: 'error',
          title: 'Sync Failed',
          message: result.error || 'Failed to sync posts'
        });
      }
    } catch (error: any) {
      if (toastId) {
        updateToast(toastId, {
          type: 'error',
          title: 'Sync Failed',
          message: error.message || 'An unexpected error occurred'
        });
      } else {
        // Fallback if toast creation failed
        showToast({
          type: 'error',
          title: 'Sync Failed',
          message: error.message || 'An unexpected error occurred'
        });
      }
    } finally {
      setSyncingBlogId(null);
    }
  };

  const handleTestGitHub = async () => {
    if (!editingBlog) return;

    setTestingGitHub(true);
    const toastId = showToast({
      type: 'loading',
      title: 'Testing GitHub...',
      message: 'Verifying credentials and content path'
    });

    try {
      const result = await window.electronAPI.publish.testConnection(
        {
          repo: editingBlog.github.repo,
          branch: editingBlog.github.branch,
          token: editingBlog.github.token
        },
        editingBlog.content.path // Also verify content path exists
      );

      if (result.success) {
        updateToast(toastId, {
          type: 'success',
          title: 'GitHub Connected',
          message: `Verified ${editingBlog.github.repo} and content path`
        });
      } else {
        updateToast(toastId, {
          type: 'error',
          title: 'GitHub Test Failed',
          message: result.error || 'Could not connect to GitHub'
        });
      }
    } catch (error: any) {
      updateToast(toastId, {
        type: 'error',
        title: 'GitHub Test Failed',
        message: error.message || 'An unexpected error occurred'
      });
    } finally {
      setTestingGitHub(false);
    }
  };

  const handleTestCloudflare = async () => {
    if (!editingBlog?.cloudflare) return;

    setTestingCloudflare(true);
    const toastId = showToast({
      type: 'loading',
      title: 'Testing Cloudflare...',
      message: 'Verifying credentials and project'
    });

    try {
      const result = await window.electronAPI.publish.testCloudflare({
        accountId: editingBlog.cloudflare.accountId,
        projectName: editingBlog.cloudflare.projectName,
        token: editingBlog.cloudflare.token
      });

      if (result.success) {
        updateToast(toastId, {
          type: 'success',
          title: 'Cloudflare Connected',
          message: result.projectUrl
            ? `Project found: ${result.projectUrl}`
            : `Project "${editingBlog.cloudflare.projectName}" verified`
        });
      } else {
        updateToast(toastId, {
          type: 'error',
          title: 'Cloudflare Test Failed',
          message: result.error || 'Could not connect to Cloudflare'
        });
      }
    } catch (error: any) {
      updateToast(toastId, {
        type: 'error',
        title: 'Cloudflare Test Failed',
        message: error.message || 'An unexpected error occurred'
      });
    } finally {
      setTestingCloudflare(false);
    }
  };

  // Check if GitHub fields are filled for Test GitHub Connection button
  const canTestGitHub = editingBlog &&
    editingBlog.github.repo.trim() &&
    editingBlog.github.branch.trim() &&
    editingBlog.github.token.trim();

  // Check if Cloudflare fields are filled for Test Cloudflare Connection button
  const canTestCloudflare = editingBlog?.cloudflare &&
    editingBlog.cloudflare.accountId.trim() &&
    editingBlog.cloudflare.projectName.trim() &&
    editingBlog.cloudflare.token.trim();

  const handleCancel = () => {
    setEditingBlog(null);
  };

  const handleAddVault = async () => {
    const result = await window.electronAPI.dialog.showOpenDialog({
      title: 'Select Vault Folder',
      properties: ['openDirectory', 'createDirectory']
    });

    if (!result.canceled && result.paths && result.paths.length > 0) {
      try {
        const addResult = await window.electronAPI.vault.add(result.paths[0]);
        if (addResult.success) {
          await loadVaults();
        }
      } catch (error: any) {
        if (error.message?.includes('already exists')) {
          alert('This vault is already added.');
        } else {
          console.error('Failed to add vault:', error);
        }
      }
    }
  };

  const handleEditVault = async (vault: VaultEntry) => {
    const result = await window.electronAPI.dialog.showOpenDialog({
      title: 'Select New Vault Location',
      defaultPath: vault.path,
      properties: ['openDirectory', 'createDirectory']
    });

    if (!result.canceled && result.paths && result.paths.length > 0) {
      const updateResult = await window.electronAPI.vault.update(vault.id, { path: result.paths[0] });
      if (updateResult.success) {
        await loadVaults();
        // Reload if we edited the active vault
        if (vault.id === activeVaultId) {
          window.location.reload();
        }
      }
    }
  };

  const handleDeleteVaultClick = (vault: VaultEntry) => {
    setDeleteVaultConfirm(vault);
  };

  const handleDeleteVaultConfirm = async () => {
    if (!deleteVaultConfirm) return;

    try {
      await window.electronAPI.vault.delete(deleteVaultConfirm.id);
      setDeleteVaultConfirm(null);
      await loadVaults();
      // Reload if we deleted the active vault
      if (deleteVaultConfirm.id === activeVaultId) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to delete vault:', error);
    }
  };

  const handleActivateVault = async (vault: VaultEntry) => {
    try {
      const result = await window.electronAPI.vault.switch(vault.id);
      if (result.success) {
        // Update local state
        setActiveVaultId(vault.id);
        // Notify parent to refresh app state
        if (onVaultSwitch) {
          await onVaultSwitch();
        }
      }
    } catch (error) {
      console.error('Failed to activate vault:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Blog edit form
  if (editingBlog) {
    return (
      <div className="flex-1 overflow-y-auto" style={{ padding: '40px 48px' }}>
        <div style={{ maxWidth: '500px' }}>
          {/* Back button */}
          <div className="mb-6">
            <Button onClick={handleCancel} variant="secondary" style={{ paddingLeft: '12px' }}>
              <ChevronLeft size={18} strokeWidth={1.5} style={{ marginRight: '4px' }} />
              Back to Settings
            </Button>
          </div>

          <h2 className="font-semibold mb-6" style={{ fontSize: '20px', color: 'var(--text-primary)' }}>
            {blogs.find(b => b.id === editingBlog.id) ? 'Edit Blog' : 'Add Blog'}
          </h2>

          <div className="space-y-6">
            {/* Blog Name */}
            <div>
              <label className="block" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '20px', marginBottom: '14px' }}>
                Blog Name <span style={{ color: 'var(--status-error)' }}>*</span>
              </label>
              <input
                type="text"
                value={editingBlog.name}
                onChange={e => setEditingBlog({ ...editingBlog, name: e.target.value })}
                className="w-full"
                style={{ padding: '10px 14px', fontSize: '14.5px', border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)', borderRadius: '8px', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.06)', marginBottom: '0' }}
                placeholder="My Blog"
              />
            </div>

            {/* GitHub Section */}
            <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--border-primary)' }}>
              <h3 className="tracking-wider mb-0" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>GitHub</h3>
              <p style={{ fontSize: '14.5px', color: 'var(--text-muted)', marginTop: '-2px', marginBottom: '24px' }}>
                From your GitHub repo settings:
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '20px', marginBottom: '14px' }}>
                    Repository (username/repo) <span style={{ color: 'var(--status-error)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={editingBlog.github.repo}
                    onChange={e => setEditingBlog({
                      ...editingBlog,
                      github: { ...editingBlog.github, repo: e.target.value }
                    })}
                    className="w-full"
                    style={{ padding: '10px 14px', fontSize: '14.5px', border: '1px solid var(--input-border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderRadius: '8px', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.06)', marginBottom: '0' }}
                    placeholder="username/blog-repo"
                  />
                </div>

                <div>
                  <label className="block" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '20px', marginBottom: '14px' }}>
                    Branch <span style={{ color: 'var(--status-error)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={editingBlog.github.branch}
                    onChange={e => setEditingBlog({
                      ...editingBlog,
                      github: { ...editingBlog.github, branch: e.target.value }
                    })}
                    className="w-full"
                    style={{ padding: '10px 14px', fontSize: '14.5px', border: '1px solid var(--input-border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderRadius: '8px', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.06)', marginBottom: '0' }}
                    placeholder="main"
                  />
                </div>

                <div>
                  <label className="block" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '20px', marginBottom: '14px' }}>
                    Personal Access Token <span style={{ color: 'var(--status-error)' }}>*</span>
                  </label>
                  <input
                    type="password"
                    value={editingBlog.github.token}
                    onChange={e => setEditingBlog({
                      ...editingBlog,
                      github: { ...editingBlog.github, token: e.target.value }
                    })}
                    className="w-full"
                    style={{ padding: '10px 14px', fontSize: '14.5px', border: '1px solid var(--input-border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderRadius: '8px', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.06)', marginBottom: '0' }}
                    placeholder="ghp_..."
                  />
                </div>

                <div>
                  <label className="block" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '20px', marginBottom: '14px' }}>
                    Content Path <span style={{ color: 'var(--status-error)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={editingBlog.content.path}
                    onChange={e => setEditingBlog({
                      ...editingBlog,
                      content: { ...editingBlog.content, path: e.target.value }
                    })}
                    className="w-full"
                    style={{ padding: '10px 14px', fontSize: '14.5px', border: '1px solid var(--input-border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderRadius: '8px', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.06)', marginBottom: '0' }}
                    placeholder="src/content/posts/"
                  />
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Path in your GitHub repo where posts are stored
                  </p>
                </div>

                {/* Test GitHub Connection Button */}
                {canTestGitHub && (
                  <div style={{ marginTop: '24px' }}>
                    <Button
                      onClick={handleTestGitHub}
                      variant="secondary"
                      disabled={testingGitHub}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      {testingGitHub ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Github size={16} strokeWidth={1.5} />
                          Test GitHub Connection
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Cloudflare Section */}
            <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--border-primary)' }}>
              <h3 className="tracking-wider mb-0" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Cloudflare Pages</h3>
              <p style={{ fontSize: '14.5px', color: 'var(--text-muted)', marginTop: '-2px', marginBottom: '24px' }}>
                Optional: Add these to track deployment status
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '20px', marginBottom: '14px' }}>
                    Account ID
                  </label>
                  <input
                    type="text"
                    value={editingBlog.cloudflare?.accountId || ''}
                    onChange={e => setEditingBlog({
                      ...editingBlog,
                      cloudflare: {
                        accountId: e.target.value,
                        projectName: editingBlog.cloudflare?.projectName || '',
                        token: editingBlog.cloudflare?.token || ''
                      }
                    })}
                    className="w-full"
                    style={{ padding: '10px 14px', fontSize: '14.5px', border: '1px solid var(--input-border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderRadius: '8px', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.06)', marginBottom: '0' }}
                    placeholder="Your Cloudflare account ID"
                  />
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Found in Cloudflare dashboard URL or Workers & Pages → Overview
                  </p>
                </div>

                <div>
                  <label className="block" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '20px', marginBottom: '14px' }}>
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={editingBlog.cloudflare?.projectName || ''}
                    onChange={e => setEditingBlog({
                      ...editingBlog,
                      cloudflare: {
                        accountId: editingBlog.cloudflare?.accountId || '',
                        projectName: e.target.value,
                        token: editingBlog.cloudflare?.token || ''
                      }
                    })}
                    className="w-full"
                    style={{ padding: '10px 14px', fontSize: '14.5px', border: '1px solid var(--input-border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderRadius: '8px', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.06)', marginBottom: '0' }}
                    placeholder="my-blog"
                  />
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    The name of your Pages project (not the domain)
                  </p>
                </div>

                <div>
                  <label className="block" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '20px', marginBottom: '14px' }}>
                    API Token
                  </label>
                  <input
                    type="password"
                    value={editingBlog.cloudflare?.token || ''}
                    onChange={e => setEditingBlog({
                      ...editingBlog,
                      cloudflare: {
                        accountId: editingBlog.cloudflare?.accountId || '',
                        projectName: editingBlog.cloudflare?.projectName || '',
                        token: e.target.value
                      }
                    })}
                    className="w-full"
                    style={{ padding: '10px 14px', fontSize: '14.5px', border: '1px solid var(--input-border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderRadius: '8px', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.06)', marginBottom: '0' }}
                    placeholder="Your Cloudflare API token"
                  />
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Create at: dash.cloudflare.com → My Profile → API Tokens
                  </p>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--border-primary)' }}>
              <h3 className="tracking-wider mb-2" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Content</h3>

              <div className="space-y-4">
                <div>
                  <label className="block" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '20px', marginBottom: '14px' }}>
                    Live Post Path
                  </label>
                  <input
                    type="text"
                    value={editingBlog.content.livePostPath || ''}
                    onChange={e => setEditingBlog({
                      ...editingBlog,
                      content: { ...editingBlog.content, livePostPath: e.target.value }
                    })}
                    className="w-full"
                    style={{ padding: '10px 14px', fontSize: '14.5px', border: '1px solid var(--input-border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderRadius: '8px', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.06)', marginBottom: '0' }}
                    placeholder="/posts/"
                  />
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    URL path for posts on your live site (e.g., /posts/ or /blog/)
                  </p>
                </div>

                <div>
                  <label className="block" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '20px', marginBottom: '14px' }}>
                    Filename Template <span style={{ color: 'var(--status-error)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={editingBlog.content.filename || ''}
                    onChange={e => setEditingBlog({
                      ...editingBlog,
                      content: { ...editingBlog.content, filename: e.target.value }
                    })}
                    className="w-full"
                    style={{ padding: '10px 14px', fontSize: '14.5px', border: '1px solid var(--input-border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderRadius: '8px', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.06)', marginBottom: '0' }}
                    placeholder="{tag}.md"
                  />
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Use {'{tag}'} as a placeholder for the tag name
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-3 pt-6">
              {canTestCloudflare && (
                <Button
                  onClick={handleTestCloudflare}
                  variant="secondary"
                  disabled={testingCloudflare}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: 'auto' }}
                >
                  {testingCloudflare ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Cloud size={16} strokeWidth={1.5} />
                      Test Cloudflare Connection
                    </>
                  )}
                </Button>
              )}
              <Button onClick={handleCancel} variant="secondary" style={{ marginRight: '8px' }}>
                Cancel
              </Button>
              <Button onClick={handleSaveBlog}>
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main settings view
  return (
    <div className="flex-1 overflow-y-auto" style={{ padding: '40px 48px' }}>
      <div className="max-w-2xl">
        <h1 className="font-semibold" style={{ fontSize: '24px', color: 'var(--text-primary)', marginBottom: '32px' }}>Settings</h1>

        {/* Vaults Section */}
        <div style={{ marginBottom: '32px' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
            <h2 className="font-semibold" style={{ fontSize: '16px', color: 'var(--text-primary)' }}>Vaults</h2>
            <Button onClick={handleAddVault} variant="secondary">
              <Plus size={16} strokeWidth={3} style={{ marginRight: '8px' }} />
              Add Vault
            </Button>
          </div>
          {vaults.length === 0 ? (
            <div className="py-12 text-center rounded-lg" style={{ border: '1px dashed var(--border-primary)' }}>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                No vaults configured. Add one to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {[...vaults].sort((a, b) => a.name.localeCompare(b.name)).map(vault => (
                <div
                  key={vault.id}
                  className="flex items-center justify-between transition-shadow hover:shadow-md"
                  style={{
                    padding: '16px 20px',
                    border: '1px solid var(--input-border)',
                    backgroundColor: 'var(--bg-primary)',
                    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.06)',
                    borderRadius: '8px',
                    marginBottom: '12px'
                  }}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium" style={{ fontSize: '14px', color: 'var(--text-primary)', margin: 0 }}>
                        {vault.name}
                      </h3>
                      {vault.id === activeVaultId && (
                        <span style={{
                          fontSize: '11px',
                          color: 'var(--bg-secondary)',
                          backgroundColor: 'var(--text-muted)',
                          padding: '2px 6px 3px 6px',
                          borderRadius: '4px',
                          fontWeight: 500,
                          marginLeft: '8px'
                        }}>
                          Active
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                      {vault.path}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {vault.id !== activeVaultId && (
                      <button
                        onClick={() => handleActivateVault(vault)}
                        className="p-2 rounded-lg transition-all hover:bg-gray-100 hover:opacity-60"
                        style={{ color: 'var(--text-icon)', backgroundColor: 'transparent' }}
                        title="Activate"
                      >
                        <Power size={16} strokeWidth={1.5} />
                      </button>
                    )}
                    <button
                      onClick={() => handleEditVault(vault)}
                      className="p-2 rounded-lg transition-all hover:bg-gray-100 hover:opacity-60"
                      style={{ color: 'var(--text-icon)', backgroundColor: 'transparent' }}
                      title="Edit"
                    >
                      <Edit2 size={16} strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => handleDeleteVaultClick(vault)}
                      className="p-2 rounded-lg transition-all hover:bg-red-50 hover:opacity-60"
                      style={{ color: 'var(--status-error)', backgroundColor: 'transparent' }}
                      title="Delete"
                    >
                      <Trash2 size={16} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Vault Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteVaultConfirm !== null}
          title="Delete Vault"
          message="This will permanently delete this vault folder and all files (notes) inside it. Are you sure?"
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          onConfirm={handleDeleteVaultConfirm}
          onCancel={() => setDeleteVaultConfirm(null)}
        />

        {/* Delete Blog Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteBlogConfirm !== null}
          title="Delete Blog"
          message="Are you sure you want to delete this blog? (this has no effect on the live blog)"
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          onConfirm={handleDeleteBlogConfirm}
          onCancel={() => setDeleteBlogConfirm(null)}
        />

        {/* Blogs Section */}
        <div>
          <div className="flex items-center justify-between" style={{ marginBottom: '20px' }}>
            <h2 className="font-semibold" style={{ fontSize: '16px', color: 'var(--text-primary)' }}>Blogs</h2>
            <Button onClick={handleAddBlog} variant="secondary">
              <Plus size={16} strokeWidth={3} style={{ marginRight: '8px' }} />
              Add Blog
            </Button>
          </div>

          {blogs.length === 0 ? (
            <div className="py-12 text-center rounded-lg" style={{ border: '1px dashed var(--border-primary)' }}>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                No blog configurations yet. Add one to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {[...blogs].sort((a, b) => a.name.localeCompare(b.name)).map(blog => (
                <div
                  key={blog.id}
                  className="flex items-center justify-between transition-shadow hover:shadow-md"
                  style={{ padding: '16px 20px', border: '1px solid var(--input-border)', backgroundColor: 'var(--bg-primary)', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.06)', borderRadius: '8px', marginBottom: '12px' }}
                >
                  <div>
                    <h3 className="font-medium" style={{ fontSize: '14px', color: 'var(--text-primary)', margin: 0 }}>{blog.name}</h3>
                    <div className="flex items-center gap-1.5" style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      <Github size={13} strokeWidth={1.5} style={{ marginRight: '6px' }} />
                      <span>{blog.github.repo}</span>
                    </div>
                    {blog.cloudflare?.projectName && (
                      <div className="flex items-center gap-1.5" style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        <Cloud size={13} strokeWidth={1.5} style={{ marginRight: '6px' }} />
                        <span>{blog.cloudflare.projectName}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleSyncBlog(blog.id)}
                      disabled={syncingBlogId === blog.id}
                      className="p-2 rounded-lg transition-all hover:bg-gray-100 hover:opacity-60"
                      style={{ color: 'var(--text-icon)', backgroundColor: 'transparent' }}
                      title="Sync posts from GitHub"
                    >
                      <RefreshCw size={16} strokeWidth={1.5} className={syncingBlogId === blog.id ? 'animate-spin' : ''} />
                    </button>
                    <button
                      onClick={() => handleEditBlog(blog)}
                      className="p-2 rounded-lg transition-all hover:bg-gray-100 hover:opacity-60"
                      style={{ color: 'var(--text-icon)', backgroundColor: 'transparent' }}
                      title="Edit"
                    >
                      <Edit2 size={16} strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => handleDeleteBlogClick(blog)}
                      className="p-2 rounded-lg transition-all hover:bg-red-50 hover:opacity-60"
                      style={{ color: 'var(--status-error)', backgroundColor: 'transparent' }}
                      title="Delete"
                    >
                      <Trash2 size={16} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Support Section */}
        <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid var(--border-primary)' }}>
          <div className="flex" style={{ gap: '32px' }}>
            {/* Left column - Xun is free */}
            <div style={{ flex: 1 }}>
              <div className="flex items-center gap-3" style={{ marginBottom: '16px' }}>
                <Coffee size={20} strokeWidth={1.5} style={{ color: 'var(--text-muted)', marginRight: '8px', flexShrink: 0, minWidth: '20px', minHeight: '20px' }} />
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
                  Xun is free, but you can support by purchasing some Xun{' '}
                  <span
                    onClick={onOpenMerch}
                    style={{ color: 'var(--accent-primary)', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    merch
                  </span>
                  {' '}or buying me a coffee if you're enjoying it.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span style={{ fontSize: '14px', color: 'var(--text-muted)', marginRight: '4px' }}>$</span>
                <input
                  id="tip-amount"
                  type="number"
                  min="1"
                  step="1"
                  defaultValue="5"
                  style={{
                    width: '48px',
                    padding: '8px 0',
                    fontSize: '14px',
                    border: '1px solid var(--input-border)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    borderRadius: '6px',
                    textAlign: 'center',
                    marginRight: '8px'
                  }}
                />
                <Button
                  variant="secondary"
                  onClick={() => {
                    const input = document.getElementById('tip-amount') as HTMLInputElement;
                    const amount = Math.max(1, parseInt(input?.value || '5', 10));
                    // Ko-fi donate URL with hidefeed to go straight to donation
                    window.open(`https://ko-fi.com/markmcdermott/donate?amount=${amount}&hidefeed=true`, '_blank');
                  }}
                >
                  Tip
                </Button>
              </div>
            </div>

            {/* Vertical divider */}
            <div style={{ width: '1px', backgroundColor: 'var(--border-primary)' }} />

            {/* Right column - Bug reports */}
            <div style={{ flex: 1 }}>
              <div className="flex items-center gap-3" style={{ marginBottom: '12px' }}>
                <Bug size={20} strokeWidth={1.5} style={{ color: 'var(--text-muted)', marginRight: '8px', flexShrink: 0, minWidth: '20px', minHeight: '20px' }} />
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
                  Found a bug or have a suggestion?{' '}
                  <a
                    href="https://github.com/mark-mcdermott/xun/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--accent-primary)', textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    Open a GitHub issue
                  </a>
                  {' '}or fill out the form below.
                </p>
              </div>
              <div style={{ marginTop: '16px', padding: '16px', border: '1px solid var(--border-primary)', borderRadius: '8px' }}>
                <textarea
                  id="feedback-message"
                  className="feedback-textarea"
                  placeholder="Describe the bug or suggestion..."
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    minHeight: '80px',
                    padding: '10px 14px',
                    fontSize: '14px',
                    borderRadius: '6px',
                    resize: 'vertical',
                    marginBottom: '12px'
                  }}
                />
                <Button
                  variant="secondary"
                  onClick={async () => {
                    const textarea = document.getElementById('feedback-message') as HTMLTextAreaElement;
                    const message = textarea?.value || '';
                    if (!message.trim()) {
                      alert('Please enter a message');
                      return;
                    }
                    try {
                      const response = await fetch('https://formsubmit.co/ajax/mark@markmcdermott.io', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Accept': 'application/json'
                        },
                        body: JSON.stringify({
                          subject: 'Xun Feedback',
                          message: message
                        })
                      });
                      if (response.ok) {
                        alert('Thanks for your feedback!');
                        textarea.value = '';
                      } else {
                        throw new Error('Failed to send');
                      }
                    } catch (error) {
                      alert('Failed to send feedback. Please try again or open a GitHub issue.');
                    }
                  }}
                >
                  Send Feedback
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
