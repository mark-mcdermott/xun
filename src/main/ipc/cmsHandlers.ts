/**
 * IPC handlers for CMS operations (remote blog post management)
 */

import { ipcMain, BrowserWindow } from 'electron';
import { RemotePostCache } from '../cms/RemotePostCache';
import { DraftManager } from '../cms/DraftManager';
import { GitHubClient } from '../publish/GitHubClient';
import { ConfigManager } from '../publish/ConfigManager';
import type { BlogTarget } from '../publish/types';

let remotePostCache: RemotePostCache | null = null;
let draftManager: DraftManager | null = null;
let configManager: ConfigManager | null = null;

/**
 * Initialize CMS managers with vault path
 */
export function initializeCmsManagers(vaultPath: string): void {
  configManager = new ConfigManager(vaultPath);
  remotePostCache = new RemotePostCache();
  draftManager = new DraftManager();

  // Set up cache update listener to notify renderer
  remotePostCache.onUpdate(() => {
    const windows = BrowserWindow.getAllWindows();
    for (const win of windows) {
      win.webContents.send('cms:cache-updated');
    }
  });
}

/**
 * Load blogs and initialize cache
 */
export async function loadBlogsIntoCache(): Promise<void> {
  if (!configManager || !remotePostCache) return;

  try {
    const config = await configManager.load();
    remotePostCache.initialize(config.blogs || []);

    // Start initial refresh in background
    remotePostCache.refreshAll().catch(err => {
      console.error('Initial CMS cache refresh failed:', err);
    });

    // Start background refresh (every 5 minutes)
    remotePostCache.startBackgroundRefresh(5 * 60 * 1000);
  } catch (error) {
    console.error('Failed to load blogs into CMS cache:', error);
  }
}

/**
 * Register all CMS IPC handlers
 */
export function registerCmsHandlers(): void {
  // Get remote file tree for all blogs
  ipcMain.handle('cms:get-remote-tree', async () => {
    try {
      if (!remotePostCache) {
        return { success: false, error: 'CMS not initialized' };
      }
      const folders = remotePostCache.getAllBlogsAsFileTree();
      return { success: true, folders };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Get content for a specific remote post
  ipcMain.handle('cms:get-post-content', async (_event, blogId: string, path: string) => {
    try {
      if (!remotePostCache || !draftManager) {
        return { success: false, error: 'CMS not initialized' };
      }

      // Check if there's a draft first
      const draft = draftManager.getDraft(blogId, path);
      if (draft) {
        return {
          success: true,
          content: draft.content,
          sha: draft.originalSha,
          isDraft: true
        };
      }

      // Get from cache (will fetch from GitHub if needed)
      const result = await remotePostCache.getPostContent(blogId, path);
      if (!result) {
        return { success: false, error: 'Post not found' };
      }
      return { success: true, ...result, isDraft: false };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Refresh all blogs in cache
  ipcMain.handle('cms:refresh-cache', async () => {
    try {
      if (!remotePostCache) {
        return { success: false, error: 'CMS not initialized' };
      }
      await remotePostCache.refreshAll();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Refresh a specific blog
  ipcMain.handle('cms:refresh-blog', async (_event, blogId: string) => {
    try {
      if (!remotePostCache) {
        return { success: false, error: 'CMS not initialized' };
      }
      await remotePostCache.refreshBlog(blogId);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Save a draft edit
  ipcMain.handle('cms:save-draft', async (
    _event,
    blogId: string,
    path: string,
    content: string,
    originalSha: string,
    originalContent: string
  ) => {
    try {
      if (!draftManager) {
        return { success: false, error: 'CMS not initialized' };
      }
      draftManager.saveDraft(blogId, path, content, originalSha, originalContent);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Get a draft
  ipcMain.handle('cms:get-draft', async (_event, blogId: string, path: string) => {
    try {
      if (!draftManager) {
        return { success: false, error: 'CMS not initialized' };
      }
      const draft = draftManager.getDraft(blogId, path);
      return {
        success: true,
        draft: draft ? { content: draft.content, originalSha: draft.originalSha } : null
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Discard a draft
  ipcMain.handle('cms:discard-draft', async (_event, blogId: string, path: string) => {
    try {
      if (!draftManager) {
        return { success: false, error: 'CMS not initialized' };
      }
      draftManager.deleteDraft(blogId, path);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Check if a draft exists
  ipcMain.handle('cms:has-draft', async (_event, blogId: string, path: string) => {
    try {
      if (!draftManager) {
        return { success: false, error: 'CMS not initialized' };
      }
      return { success: true, hasDraft: draftManager.hasDraft(blogId, path) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Publish an edited post back to GitHub
  ipcMain.handle('cms:publish-post', async (
    _event,
    blogId: string,
    path: string,
    content: string,
    sha: string
  ) => {
    try {
      if (!configManager || !remotePostCache || !draftManager) {
        return { success: false, error: 'CMS not initialized' };
      }

      // Get blog config
      const config = await configManager.load();
      const blog = config.blogs?.find((b: BlogTarget) => b.id === blogId);
      if (!blog) {
        return { success: false, error: 'Blog not found' };
      }

      // Create GitHub client and update file
      const client = new GitHubClient(blog.github.token);
      const result = await client.updateFile(
        blog.github.repo,
        path,
        content,
        `Update ${path.split('/').pop()}`,
        blog.github.branch,
        sha
      );

      // Update cache with new SHA
      remotePostCache.updatePostSha(blogId, path, result.sha, content);

      // Clear the draft
      draftManager.deleteDraft(blogId, path);

      return { success: true, newSha: result.sha };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Get all paths with unpublished changes for a blog
  ipcMain.handle('cms:get-modified-paths', async (_event, blogId: string) => {
    try {
      if (!draftManager) {
        return { success: false, error: 'CMS not initialized' };
      }
      const paths = draftManager.getModifiedPaths(blogId);
      return { success: true, paths };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Delete a remote file
  ipcMain.handle('cms:delete-file', async (
    _event,
    blogId: string,
    path: string,
    sha: string
  ) => {
    try {
      if (!configManager || !remotePostCache || !draftManager) {
        return { success: false, error: 'CMS not initialized' };
      }

      // Get blog config
      const config = await configManager.load();
      const blog = config.blogs?.find((b: BlogTarget) => b.id === blogId);
      if (!blog) {
        return { success: false, error: 'Blog not found' };
      }

      // Create GitHub client and delete file
      const client = new GitHubClient(blog.github.token);
      await client.deleteFile(
        blog.github.repo,
        path,
        `Delete ${path.split('/').pop()}`,
        blog.github.branch,
        sha
      );

      // Clear any draft for this path
      draftManager.deleteDraft(blogId, path);

      // Refresh the blog's cache to pick up the deletion
      await remotePostCache.refreshBlog(blogId);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Rename a remote file
  ipcMain.handle('cms:rename-file', async (
    _event,
    blogId: string,
    oldPath: string,
    newName: string,
    sha: string
  ) => {
    try {
      if (!configManager || !remotePostCache || !draftManager) {
        return { success: false, error: 'CMS not initialized' };
      }

      // Get blog config
      const config = await configManager.load();
      const blog = config.blogs?.find((b: BlogTarget) => b.id === blogId);
      if (!blog) {
        return { success: false, error: 'Blog not found' };
      }

      // Calculate new path (same directory, new filename)
      const pathParts = oldPath.split('/');
      pathParts[pathParts.length - 1] = newName;
      const newPath = pathParts.join('/');

      // Create GitHub client and rename file
      const client = new GitHubClient(blog.github.token);
      const result = await client.renameFile(
        blog.github.repo,
        oldPath,
        newPath,
        blog.github.branch,
        sha
      );

      // Clear any draft for the old path
      draftManager.deleteDraft(blogId, oldPath);

      // Refresh the blog's cache to pick up the rename
      await remotePostCache.refreshBlog(blogId);

      return { success: true, newPath, newSha: result.newSha };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
}

/**
 * Clean up CMS resources
 */
export function cleanupCms(): void {
  if (remotePostCache) {
    remotePostCache.stopBackgroundRefresh();
  }
}

/**
 * Get the RemotePostCache instance (for use by other handlers)
 */
export function getRemotePostCache(): RemotePostCache | null {
  return remotePostCache;
}

/**
 * Get the DraftManager instance (for use by other handlers)
 */
export function getDraftManager(): DraftManager | null {
  return draftManager;
}
