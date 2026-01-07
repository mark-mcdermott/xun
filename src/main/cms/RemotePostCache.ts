/**
 * In-memory cache for remote blog posts from GitHub
 */

import { GitHubClient } from '../publish/GitHubClient';
import type { BlogTarget } from '../publish/types';
import type { FileNode } from '../../preload/index';

export interface CachedPost {
  path: string;
  name: string;
  content: string;
  sha: string;
  lastFetched: number;
  blogId: string;
}

interface BlogCache {
  blogId: string;
  blogName: string;
  repo: string;
  branch: string;
  contentPath: string;
  posts: Map<string, CachedPost>;
  lastRefreshed: number;
  error?: string;
}

type CacheUpdateCallback = () => void;

export class RemotePostCache {
  private caches: Map<string, BlogCache> = new Map();
  private gitHubClients: Map<string, GitHubClient> = new Map();
  private refreshInterval: NodeJS.Timeout | null = null;
  private updateCallbacks: Set<CacheUpdateCallback> = new Set();

  /**
   * Initialize cache for configured blogs
   */
  initialize(blogs: BlogTarget[]): void {
    this.caches.clear();
    this.gitHubClients.clear();

    for (const blog of blogs) {
      this.gitHubClients.set(blog.id, new GitHubClient(blog.github.token));
      this.caches.set(blog.id, {
        blogId: blog.id,
        blogName: blog.name,
        repo: blog.github.repo,
        branch: blog.github.branch,
        contentPath: blog.content.path,
        posts: new Map(),
        lastRefreshed: 0
      });
    }
  }

  /**
   * Add a single blog to the cache (when a new blog is added)
   */
  addBlog(blog: BlogTarget): void {
    this.gitHubClients.set(blog.id, new GitHubClient(blog.github.token));
    this.caches.set(blog.id, {
      blogId: blog.id,
      blogName: blog.name,
      repo: blog.github.repo,
      branch: blog.github.branch,
      contentPath: blog.content.path,
      posts: new Map(),
      lastRefreshed: 0
    });
  }

  /**
   * Remove a blog from the cache
   */
  removeBlog(blogId: string): void {
    this.caches.delete(blogId);
    this.gitHubClients.delete(blogId);
  }

  /**
   * Refresh posts for a specific blog
   */
  async refreshBlog(blogId: string): Promise<void> {
    const cache = this.caches.get(blogId);
    const client = this.gitHubClients.get(blogId);

    if (!cache || !client) {
      throw new Error(`Blog ${blogId} not found in cache`);
    }

    try {
      // List files in the content directory
      const files = await client.listDirectory(
        cache.repo,
        cache.contentPath,
        cache.branch
      );

      // Filter for markdown files only
      const mdFiles = files.filter(f => f.type === 'file' && f.name.endsWith('.md'));

      // Update cache with new file list (content fetched lazily)
      const newPosts = new Map<string, CachedPost>();

      for (const file of mdFiles) {
        const existingPost = cache.posts.get(file.path);

        // If SHA hasn't changed and we have content, keep it
        if (existingPost && existingPost.sha === file.sha && existingPost.content) {
          newPosts.set(file.path, existingPost);
        } else {
          // New or updated file - store without content (lazy load)
          newPosts.set(file.path, {
            path: file.path,
            name: file.name,
            content: existingPost?.content || '', // Keep old content if available
            sha: file.sha,
            lastFetched: existingPost?.lastFetched || 0,
            blogId
          });
        }
      }

      cache.posts = newPosts;
      cache.lastRefreshed = Date.now();
      cache.error = undefined;

      this.notifyUpdate();
    } catch (error: any) {
      cache.error = error.message;
      console.error(`Failed to refresh blog ${blogId}:`, error);
      throw error;
    }
  }

  /**
   * Refresh all blogs
   */
  async refreshAll(): Promise<void> {
    const promises = Array.from(this.caches.keys()).map(blogId =>
      this.refreshBlog(blogId).catch(err => {
        console.error(`Failed to refresh ${blogId}:`, err);
      })
    );
    await Promise.all(promises);
  }

  /**
   * Get post content (fetches from GitHub if not cached)
   */
  async getPostContent(blogId: string, path: string): Promise<{ content: string; sha: string } | null> {
    const cache = this.caches.get(blogId);
    const client = this.gitHubClients.get(blogId);

    if (!cache || !client) {
      return null;
    }

    const post = cache.posts.get(path);
    if (!post) {
      return null;
    }

    // If we have fresh content, return it
    if (post.content && post.lastFetched > 0) {
      return { content: post.content, sha: post.sha };
    }

    // Fetch content from GitHub
    try {
      const result = await client.getFileContent(cache.repo, path, cache.branch);
      if (result) {
        post.content = result.content;
        post.sha = result.sha;
        post.lastFetched = Date.now();
        return result;
      }
    } catch (error) {
      console.error(`Failed to fetch content for ${path}:`, error);
    }

    return null;
  }

  /**
   * Get all blogs as FileNode tree for the file tree UI
   */
  getAllBlogsAsFileTree(): FileNode[] {
    const folders: FileNode[] = [];

    for (const cache of this.caches.values()) {
      folders.push(this.getBlogAsFileTree(cache));
    }

    return folders;
  }

  /**
   * Get a single blog's posts as a FileNode folder
   */
  private getBlogAsFileTree(cache: BlogCache): FileNode {
    const children: FileNode[] = [];

    for (const post of cache.posts.values()) {
      children.push({
        name: post.name,
        path: `remote:${cache.blogId}:${post.path}`,
        type: 'file',
        extension: '.md',
        modifiedAt: post.lastFetched || Date.now(),
        source: 'remote',
        remoteMeta: {
          blogId: cache.blogId,
          sha: post.sha
        }
      });
    }

    // Sort children alphabetically
    children.sort((a, b) => a.name.localeCompare(b.name));

    return {
      name: cache.blogName,
      path: `remote:${cache.blogId}`,
      type: 'folder',
      children,
      source: 'remote',
      remoteMeta: {
        blogId: cache.blogId,
        sha: ''
      }
    };
  }

  /**
   * Get cached posts for a blog (without fetching)
   */
  getCachedPosts(blogId: string): CachedPost[] {
    const cache = this.caches.get(blogId);
    if (!cache) return [];
    return Array.from(cache.posts.values());
  }

  /**
   * Check if a blog has been loaded
   */
  isBlogLoaded(blogId: string): boolean {
    const cache = this.caches.get(blogId);
    return cache ? cache.lastRefreshed > 0 : false;
  }

  /**
   * Get last refresh time for a blog
   */
  getLastRefreshed(blogId: string): number {
    return this.caches.get(blogId)?.lastRefreshed || 0;
  }

  /**
   * Start background refresh polling
   */
  startBackgroundRefresh(intervalMs: number = 5 * 60 * 1000): void {
    this.stopBackgroundRefresh();

    this.refreshInterval = setInterval(async () => {
      try {
        await this.refreshAll();
      } catch (error) {
        console.error('Background refresh failed:', error);
      }
    }, intervalMs);
  }

  /**
   * Stop background refresh polling
   */
  stopBackgroundRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  /**
   * Subscribe to cache updates
   */
  onUpdate(callback: CacheUpdateCallback): void {
    this.updateCallbacks.add(callback);
  }

  /**
   * Unsubscribe from cache updates
   */
  offUpdate(callback: CacheUpdateCallback): void {
    this.updateCallbacks.delete(callback);
  }

  /**
   * Notify all subscribers of an update
   */
  private notifyUpdate(): void {
    for (const callback of this.updateCallbacks) {
      try {
        callback();
      } catch (error) {
        console.error('Cache update callback error:', error);
      }
    }
  }

  /**
   * Update a post's SHA after publishing
   */
  updatePostSha(blogId: string, path: string, newSha: string, newContent?: string): void {
    const cache = this.caches.get(blogId);
    if (!cache) return;

    const post = cache.posts.get(path);
    if (post) {
      post.sha = newSha;
      if (newContent) {
        post.content = newContent;
      }
      post.lastFetched = Date.now();
      this.notifyUpdate();
    }
  }

  /**
   * Get blog info
   */
  getBlogInfo(blogId: string): { name: string; repo: string; error?: string } | null {
    const cache = this.caches.get(blogId);
    if (!cache) return null;
    return {
      name: cache.blogName,
      repo: cache.repo,
      error: cache.error
    };
  }
}
