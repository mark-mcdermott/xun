import { ipcMain, BrowserWindow } from 'electron';
import { vaultManager } from '../vault/VaultManager';
import type { TagManager } from '../vault/TagManager';
import { PublishManager } from '../publish/PublishManager';
import { ConfigManager } from '../publish/ConfigManager';
import { PublishTimingManager } from '../publish/PublishTimingManager';
import { GitHubClient } from '../publish/GitHubClient';
import { getRemotePostCache } from './cmsHandlers';
import type { BlogTarget } from '../publish/types';

let publishManager: PublishManager | null = null;
let configManager: ConfigManager | null = null;
let tagManagerInstance: TagManager | null = null;
let timingManager: PublishTimingManager | null = null;

// Track active publish start times
const publishStartTimes: Map<string, { startTime: number; blogId: string }> = new Map();

/**
 * Set the tag manager instance
 */
export function setPublishTagManager(manager: TagManager): void {
  tagManagerInstance = manager;
}

/**
 * Initialize publish managers when vault is ready
 */
export function initializePublishManagers(vaultPath: string): void {
  if (!tagManagerInstance) {
    throw new Error('Tag manager not set');
  }
  configManager = new ConfigManager(vaultPath);
  publishManager = new PublishManager(tagManagerInstance);
  timingManager = new PublishTimingManager(vaultPath);
}

/**
 * Register all publish-related IPC handlers
 */
export function registerPublishHandlers(): void {
  // Get all blog configurations
  ipcMain.handle('publish:get-blogs', async () => {
    try {
      if (!configManager) {
        const vaultPath = vaultManager.getVaultPath();
        if (!vaultPath) {
          return { success: false, error: 'Vault not initialized' };
        }
        initializePublishManagers(vaultPath);
      }

      const blogs = await configManager!.getBlogs();
      return { success: true, blogs };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Get a specific blog configuration
  ipcMain.handle('publish:get-blog', async (_event, blogId: string) => {
    try {
      if (!configManager) {
        return { success: false, error: 'Vault not initialized' };
      }

      const blog = await configManager.getBlog(blogId);
      if (!blog) {
        return { success: false, error: 'Blog not found' };
      }

      return { success: true, blog };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Save blog configuration
  ipcMain.handle('publish:save-blog', async (_event, blog: BlogTarget) => {
    try {
      if (!configManager) {
        const vaultPath = vaultManager.getVaultPath();
        if (!vaultPath) {
          return { success: false, error: 'Vault not initialized' };
        }
        initializePublishManagers(vaultPath);
      }

      await configManager!.saveBlog(blog);

      // Add or update the blog in the remote posts cache
      const remotePostCache = getRemotePostCache();
      if (remotePostCache) {
        // Remove old entry if exists (in case settings changed)
        remotePostCache.removeBlog(blog.id);
        // Add with new settings
        remotePostCache.addBlog(blog);
        // Notify renderer that cache structure changed
        const windows = BrowserWindow.getAllWindows();
        for (const win of windows) {
          win.webContents.send('cms:cache-updated');
        }
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Delete blog configuration
  ipcMain.handle('publish:delete-blog', async (_event, blogId: string) => {
    try {
      if (!configManager) {
        return { success: false, error: 'Vault not initialized' };
      }

      const deleted = await configManager.deleteBlog(blogId);

      // Remove from the remote posts cache
      const remotePostCache = getRemotePostCache();
      if (remotePostCache) {
        remotePostCache.removeBlog(blogId);
        // Notify renderer that cache has been updated
        const windows = BrowserWindow.getAllWindows();
        for (const win of windows) {
          win.webContents.send('cms:cache-updated');
        }
      }

      return { success: true, deleted };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Test connection to GitHub
  ipcMain.handle('publish:test-connection', async (_event, github: { repo: string; branch: string; token: string }, contentPath?: string) => {
    try {
      const client = new GitHubClient(github.token);
      // Try to get the latest commit SHA - this will verify repo access and branch exists
      await client.getLatestCommitSha(github.repo, github.branch);

      // If content path provided, verify it exists
      if (contentPath) {
        const pathToCheck = contentPath.replace(/\/$/, ''); // Remove trailing slash
        try {
          await client.listDirectory(github.repo, pathToCheck, github.branch);
        } catch (pathError: any) {
          if (pathError.message?.includes('404') || pathError.message?.includes('Not Found')) {
            return { success: false, error: `Content path "${contentPath}" not found in repository` };
          }
          throw pathError;
        }
      }

      return { success: true };
    } catch (error: any) {
      let errorMessage = error.message;
      // Provide more user-friendly error messages
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        errorMessage = 'Invalid GitHub token or token lacks required permissions';
      } else if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
        errorMessage = 'Repository or branch not found. Check the repo name and branch.';
      } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
        errorMessage = 'Access denied. The token may lack permissions for this repository.';
      }
      return { success: false, error: errorMessage };
    }
  });

  // Test connection to Cloudflare
  ipcMain.handle('publish:test-cloudflare', async (_event, cloudflare: { accountId: string; projectName: string; token: string }) => {
    try {
      // Call Cloudflare API to verify credentials and project exists
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${cloudflare.accountId}/pages/projects/${cloudflare.projectName}`,
        {
          headers: {
            'Authorization': `Bearer ${cloudflare.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        if (response.status === 401) {
          return { success: false, error: 'Invalid Cloudflare API token' };
        } else if (response.status === 404) {
          return { success: false, error: `Project "${cloudflare.projectName}" not found. Check account ID and project name.` };
        } else if (response.status === 403) {
          return { success: false, error: 'Access denied. Token may lack Cloudflare Pages permissions.' };
        }
        return { success: false, error: data.errors?.[0]?.message || `Cloudflare API error: ${response.status}` };
      }

      const data = await response.json();
      if (!data.success) {
        return { success: false, error: data.errors?.[0]?.message || 'Unknown Cloudflare error' };
      }

      // Return project info for confirmation
      return {
        success: true,
        projectUrl: data.result?.subdomain ? `https://${data.result.subdomain}.pages.dev` : null
      };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to connect to Cloudflare' };
    }
  });

  // Publish to blog
  ipcMain.handle('publish:to-blog', async (_event, blogId: string, tag: string) => {
    try {
      if (!publishManager || !configManager) {
        const vaultPath = vaultManager.getVaultPath();
        if (!vaultPath) {
          return { success: false, error: 'Vault not initialized' };
        }
        initializePublishManagers(vaultPath);
      }

      const blog = await configManager!.getBlog(blogId);
      if (!blog) {
        return { success: false, error: 'Blog not found' };
      }

      const jobId = await publishManager!.publish(blog, tag);
      return { success: true, jobId };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Publish to blog with direct content (from blog block)
  ipcMain.handle('publish:to-blog-direct', async (_event, blogId: string, content: string) => {
    try {
      if (!publishManager || !configManager) {
        const vaultPath = vaultManager.getVaultPath();
        if (!vaultPath) {
          return { success: false, error: 'Vault not initialized' };
        }
        initializePublishManagers(vaultPath);
      }

      const blog = await configManager!.getBlog(blogId);
      if (!blog) {
        return { success: false, error: 'Blog not found' };
      }

      const jobId = await publishManager!.publishDirect(blog, content);

      // Track start time for this job
      publishStartTimes.set(jobId, { startTime: Date.now(), blogId });

      return { success: true, jobId };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Publish CMS file update with deployment tracking
  ipcMain.handle('publish:cms-file', async (_event, blogId: string, filePath: string, content: string, sha: string) => {
    try {
      if (!publishManager || !configManager) {
        const vaultPath = vaultManager.getVaultPath();
        if (!vaultPath) {
          return { success: false, error: 'Vault not initialized' };
        }
        initializePublishManagers(vaultPath);
      }

      const blog = await configManager!.getBlog(blogId);
      if (!blog) {
        return { success: false, error: 'Blog not found' };
      }

      const jobId = await publishManager!.publishCmsFile(blog, filePath, content, sha);

      // Track start time for this job
      publishStartTimes.set(jobId, { startTime: Date.now(), blogId });

      return { success: true, jobId };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Rename CMS file with deployment tracking
  ipcMain.handle('publish:cms-rename', async (_event, blogId: string, oldPath: string, newName: string, sha: string) => {
    try {
      if (!publishManager || !configManager) {
        const vaultPath = vaultManager.getVaultPath();
        if (!vaultPath) {
          return { success: false, error: 'Vault not initialized' };
        }
        initializePublishManagers(vaultPath);
      }

      const blog = await configManager!.getBlog(blogId);
      if (!blog) {
        return { success: false, error: 'Blog not found' };
      }

      const jobId = await publishManager!.renameCmsFile(blog, oldPath, newName, sha);

      // Track start time for this job
      publishStartTimes.set(jobId, { startTime: Date.now(), blogId });

      return { success: true, jobId };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Get publish job status
  ipcMain.handle('publish:get-status', async (_event, jobId: string) => {
    try {
      if (!publishManager) {
        return { success: false, error: 'Publish manager not initialized' };
      }

      const job = publishManager.getJob(jobId);
      if (!job) {
        return { success: false, error: 'Job not found' };
      }

      return {
        success: true,
        status: job.status,
        progress: job.progress,
        steps: job.steps,
        error: job.error,
        slug: (job as any).slug,
        postUrl: job.postUrl,
        newSha: (job as any).newSha,
        newPath: (job as any).newPath
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Subscribe to job progress
  ipcMain.handle('publish:subscribe', async (event, jobId: string) => {
    try {
      if (!publishManager) {
        return { success: false, error: 'Publish manager not initialized' };
      }

      publishManager.onProgress(jobId, async job => {
        event.sender.send(`publish:progress:${jobId}`, {
          status: job.status,
          progress: job.progress,
          steps: job.steps,
          error: job.error,
          slug: (job as any).slug,
          postUrl: job.postUrl
        });

        // Record timing when job completes
        if ((job.status === 'completed' || job.status === 'failed') && timingManager) {
          const startInfo = publishStartTimes.get(jobId);
          if (startInfo) {
            const durationMs = Date.now() - startInfo.startTime;
            await timingManager.recordTiming(startInfo.blogId, durationMs, job.status === 'completed');
            publishStartTimes.delete(jobId);
          }
        }
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Unsubscribe from job progress
  ipcMain.handle('publish:unsubscribe', async (_event, jobId: string) => {
    try {
      if (!publishManager) {
        return { success: false, error: 'Publish manager not initialized' };
      }

      publishManager.offProgress(jobId);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Get average publish time
  ipcMain.handle('publish:get-average-time', async () => {
    try {
      if (!timingManager) {
        const vaultPath = vaultManager.getVaultPath();
        if (!vaultPath) {
          return { success: true, averageMs: 30000 }; // Default 30 seconds
        }
        timingManager = new PublishTimingManager(vaultPath);
      }

      const averageMs = await timingManager.getAveragePublishTime();
      return { success: true, averageMs };
    } catch (error: any) {
      return { success: true, averageMs: 30000 }; // Default on error
    }
  });
}
