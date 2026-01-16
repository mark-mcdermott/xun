import { useState, useEffect, useCallback } from 'react';
import type { FileNode } from '../../preload/index';

interface UseRemotePostsReturn {
  remoteFolders: FileNode[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  refreshBlog: (blogId: string) => Promise<void>;
  getPostContent: (blogId: string, path: string) => Promise<{ content: string; sha: string; isDraft?: boolean }>;
  saveDraft: (blogId: string, path: string, content: string, originalSha: string, originalContent: string) => Promise<void>;
  getDraft: (blogId: string, path: string) => Promise<{ content: string; originalSha: string } | null>;
  discardDraft: (blogId: string, path: string) => Promise<void>;
  hasDraft: (blogId: string, path: string) => Promise<boolean>;
  publishPost: (blogId: string, path: string, content: string, sha: string) => Promise<string>;
  getModifiedPaths: (blogId: string) => Promise<string[]>;
  renameFile: (blogId: string, oldPath: string, newName: string, sha: string) => Promise<{ jobId: string }>;
  deleteFile: (blogId: string, path: string, sha: string) => Promise<void>;
}

export const useRemotePosts = (): UseRemotePostsReturn => {
  const [remoteFolders, setRemoteFolders] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load remote tree
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await window.electronAPI.cms.getRemoteTree();
      if (result.success) {
        setRemoteFolders(result.folders || []);
      } else {
        setError(result.error || 'Failed to load remote posts');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh a specific blog
  const refreshBlog = useCallback(async (blogId: string) => {
    try {
      const result = await window.electronAPI.cms.refreshBlog(blogId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to refresh blog');
      }
      // The cache update event will trigger a re-fetch of the tree
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Get content for a specific post
  const getPostContent = useCallback(async (blogId: string, path: string) => {
    const result = await window.electronAPI.cms.getPostContent(blogId, path);
    if (!result.success) {
      throw new Error(result.error || 'Failed to get post content');
    }
    return {
      content: result.content,
      sha: result.sha,
      isDraft: result.isDraft
    };
  }, []);

  // Save a draft edit
  const saveDraft = useCallback(async (
    blogId: string,
    path: string,
    content: string,
    originalSha: string,
    originalContent: string
  ) => {
    const result = await window.electronAPI.cms.saveDraft(blogId, path, content, originalSha, originalContent);
    if (!result.success) {
      throw new Error(result.error || 'Failed to save draft');
    }
  }, []);

  // Get a draft
  const getDraft = useCallback(async (blogId: string, path: string) => {
    const result = await window.electronAPI.cms.getDraft(blogId, path);
    if (!result.success) {
      throw new Error(result.error || 'Failed to get draft');
    }
    return result.draft;
  }, []);

  // Discard a draft
  const discardDraft = useCallback(async (blogId: string, path: string) => {
    const result = await window.electronAPI.cms.discardDraft(blogId, path);
    if (!result.success) {
      throw new Error(result.error || 'Failed to discard draft');
    }
  }, []);

  // Check if a draft exists
  const hasDraft = useCallback(async (blogId: string, path: string) => {
    const result = await window.electronAPI.cms.hasDraft(blogId, path);
    if (!result.success) {
      throw new Error(result.error || 'Failed to check draft');
    }
    return result.hasDraft;
  }, []);

  // Publish an edited post
  const publishPost = useCallback(async (blogId: string, path: string, content: string, sha: string) => {
    const result = await window.electronAPI.cms.publishPost(blogId, path, content, sha);
    if (!result.success) {
      throw new Error(result.error || 'Failed to publish post');
    }
    return result.newSha;
  }, []);

  // Get paths with unpublished changes
  const getModifiedPaths = useCallback(async (blogId: string) => {
    const result = await window.electronAPI.cms.getModifiedPaths(blogId);
    if (!result.success) {
      throw new Error(result.error || 'Failed to get modified paths');
    }
    return result.paths;
  }, []);

  // Rename a remote file (returns jobId for progress tracking)
  const renameFile = useCallback(async (blogId: string, oldPath: string, newName: string, sha: string) => {
    const result = await window.electronAPI.publish.renameCmsFile(blogId, oldPath, newName, sha);
    if (!result.success) {
      throw new Error(result.error || 'Failed to start rename');
    }
    return { jobId: result.jobId };
  }, []);

  // Delete a remote file
  const deleteFile = useCallback(async (blogId: string, path: string, sha: string) => {
    const result = await window.electronAPI.cms.deleteFile(blogId, path, sha);
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete file');
    }
  }, []);

  // Load on mount and listen for cache updates
  useEffect(() => {
    refresh();

    // Listen for cache updates from background refresh
    window.electronAPI.cms.onCacheUpdated(() => {
      refresh();
    });

    return () => {
      window.electronAPI.cms.removeCacheListener();
    };
  }, [refresh]);

  return {
    remoteFolders,
    loading,
    error,
    refresh,
    refreshBlog,
    getPostContent,
    saveDraft,
    getDraft,
    discardDraft,
    hasDraft,
    publishPost,
    getModifiedPaths,
    renameFile,
    deleteFile
  };
};
