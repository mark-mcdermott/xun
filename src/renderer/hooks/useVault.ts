import { useState, useEffect, useCallback } from 'react';
import type { FileNode } from '../../preload';

interface UseVaultReturn {
  vaultPath: string | null;
  fileTree: FileNode | null;
  loading: boolean;
  error: string | null;
  initialize: (path?: string) => Promise<void>;
  refreshFileTree: () => Promise<void>;
  readFile: (path: string) => Promise<string>;
  writeFile: (path: string, content: string) => Promise<void>;
  createFile: (path: string, content?: string) => Promise<void>;
  deleteFile: (path: string) => Promise<void>;
  createFolder: (path: string) => Promise<void>;
  getTodayNote: () => Promise<{ path: string; content: string; isNew: boolean }>;
}

export const useVault = (): UseVaultReturn => {
  const [vaultPath, setVaultPath] = useState<string | null>(null);
  const [fileTree, setFileTree] = useState<FileNode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize vault
  const initialize = useCallback(async (path?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await window.electronAPI.vault.initialize(path);
      if (result.success) {
        setVaultPath(result.path);
        await refreshFileTree();
      } else {
        setError(result.error || 'Failed to initialize vault');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh file tree
  const refreshFileTree = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await window.electronAPI.vault.getFiles();
      if (result.success) {
        setFileTree(result.tree);
      } else {
        setError(result.error || 'Failed to get file tree');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Read file
  const readFile = useCallback(async (path: string): Promise<string> => {
    const result = await window.electronAPI.vault.readFile(path);
    if (!result.success) {
      throw new Error(result.error || 'Failed to read file');
    }
    return result.content;
  }, []);

  // Write file
  const writeFile = useCallback(
    async (path: string, content: string): Promise<void> => {
      const result = await window.electronAPI.vault.writeFile(path, content);
      if (!result.success) {
        throw new Error(result.error || 'Failed to write file');
      }
      await refreshFileTree();
    },
    [refreshFileTree]
  );

  // Create file
  const createFile = useCallback(
    async (path: string, content: string = ''): Promise<void> => {
      const result = await window.electronAPI.vault.createFile(path, content);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create file');
      }
      await refreshFileTree();
    },
    [refreshFileTree]
  );

  // Delete file
  const deleteFile = useCallback(
    async (path: string): Promise<void> => {
      const result = await window.electronAPI.vault.deleteFile(path);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete file');
      }
      await refreshFileTree();
    },
    [refreshFileTree]
  );

  // Create folder
  const createFolder = useCallback(
    async (path: string): Promise<void> => {
      const result = await window.electronAPI.vault.createFolder(path);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create folder');
      }
      await refreshFileTree();
    },
    [refreshFileTree]
  );

  // Get today's note
  const getTodayNote = useCallback(async () => {
    const result = await window.electronAPI.vault.getTodayNote();
    if (!result.success) {
      throw new Error(result.error || 'Failed to get today note');
    }
    return {
      path: result.path,
      content: result.content,
      isNew: result.isNew
    };
  }, []);

  // Load vault path on mount
  useEffect(() => {
    const loadVaultPath = async () => {
      try {
        const result = await window.electronAPI.vault.getPath();
        if (result.success && result.path) {
          setVaultPath(result.path);
          await refreshFileTree();
        }
      } catch (err: any) {
        console.error('Failed to load vault path:', err);
      }
    };

    loadVaultPath();
  }, [refreshFileTree]);

  return {
    vaultPath,
    fileTree,
    loading,
    error,
    initialize,
    refreshFileTree,
    readFile,
    writeFile,
    createFile,
    deleteFile,
    createFolder,
    getTodayNote
  };
};
