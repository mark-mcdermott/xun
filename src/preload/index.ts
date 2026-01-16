import { contextBridge, ipcRenderer } from 'electron';

// Import types from main process
export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  extension?: string;
  modifiedAt?: number;
  // CMS fields for remote posts
  source?: 'local' | 'remote';
  remoteMeta?: {
    blogId: string;
    sha: string;
  };
}

interface VaultResponse<T = any> {
  success: boolean;
  error?: string;
  [key: string]: any;
}

export interface VaultEntry {
  id: string;
  name: string;
  path: string;
  dailyNotesPath: string;
  createdAt: string;
}

export type Theme = 'light' | 'dark' | 'system';

interface ThemeInfo {
  theme: Theme;
  effectiveTheme: 'light' | 'dark';
}

// Define the API that will be exposed to the renderer process
export interface ElectronAPI {
  // Shell operations
  shell: {
    openExternal: (url: string) => Promise<void>;
  };

  // Dialog operations
  dialog: {
    showOpenDialog: (options: {
      title?: string;
      defaultPath?: string;
      properties?: Array<'openFile' | 'openDirectory' | 'multiSelections' | 'createDirectory'>;
    }) => Promise<{ success: boolean; paths?: string[]; canceled?: boolean }>;
  };

  // Vault operations
  vault: {
    initialize: (vaultPath?: string) => Promise<VaultResponse<{ path: string }>>;
    getPath: () => Promise<VaultResponse<{ path: string | null }>>;
    getDefaultPath: () => Promise<VaultResponse<{ path: string }>>;
    isFirstRun: () => Promise<VaultResponse<{ isFirstRun: boolean }>>;
    getFiles: () => Promise<VaultResponse<{ tree: FileNode }>>;
    readFile: (path: string) => Promise<VaultResponse<{ content: string }>>;
    writeFile: (path: string, content: string) => Promise<VaultResponse>;
    createFile: (path: string, content?: string) => Promise<VaultResponse>;
    deleteFile: (path: string) => Promise<VaultResponse>;
    createFolder: (path: string) => Promise<VaultResponse>;
    moveFile: (sourcePath: string, destFolder: string) => Promise<VaultResponse<{ newPath: string }>>;
    renameFile: (oldPath: string, newName: string) => Promise<VaultResponse<{ newPath: string }>>;
    getTodayNote: () => Promise<
      VaultResponse<{ path: string; content: string; isNew: boolean }>
    >;
    getDailyNote: (date: string) => Promise<
      VaultResponse<{ path: string; content: string; isNew: boolean }>
    >;
    getDailyNoteDates: () => Promise<VaultResponse<{ dates: string[] }>>;
    // Multi-vault operations
    getAll: () => Promise<VaultResponse<{ vaults: VaultEntry[]; activeVaultId: string | null }>>;
    add: (vaultPath: string) => Promise<VaultResponse<{ vault: VaultEntry }>>;
    switch: (vaultId: string) => Promise<VaultResponse<{ path: string }>>;
    update: (vaultId: string, updates: { name?: string; path?: string }) => Promise<VaultResponse<{ vault: VaultEntry }>>;
    remove: (vaultId: string) => Promise<VaultResponse>;
    delete: (vaultId: string) => Promise<VaultResponse>;
  };

  // Tag operations
  tags: {
    buildIndex: () => Promise<VaultResponse>;
    getAllTags: () => Promise<VaultResponse<{ tags: string[] }>>;
    getContent: (tag: string) => Promise<
      VaultResponse<{ content: Array<{ date: string; filePath: string; content: string }> }>
    >;
    extract: (content: string) => Promise<VaultResponse<{ tags: string[] }>>;
    getStats: (tag: string) => Promise<VaultResponse<{ count: number; lastUpdated: number }>>;
    deleteContent: (tag: string) => Promise<
      VaultResponse<{ filesModified: string[]; sectionsDeleted: number }>
    >;
  };

  // Context menu operations
  contextMenu: {
    showFileMenu: (filePath: string, options?: { isRemote?: boolean }) => Promise<{ action: string } | null>;
    showFolderMenu: (folderPath: string) => Promise<{ action: string } | null>;
    showSidebarMenu: () => Promise<{ action: string } | null>;
  };

  // Theme operations
  theme: {
    get: () => Promise<ThemeInfo>;
    set: (theme: Theme) => Promise<{ success: boolean }>;
    onChange: (callback: (info: ThemeInfo) => void) => void;
    removeChangeListener: () => void;
  };

  // Publishing operations
  publish: {
    getBlogs: () => Promise<VaultResponse<{ blogs: any[] }>>;
    getBlog: (blogId: string) => Promise<VaultResponse<{ blog: any }>>;
    saveBlog: (blog: any) => Promise<VaultResponse>;
    deleteBlog: (blogId: string) => Promise<VaultResponse<{ deleted: boolean }>>;
    testConnection: (github: { repo: string; branch: string; token: string }, contentPath?: string) => Promise<VaultResponse>;
    testCloudflare: (cloudflare: { accountId: string; projectName: string; token: string }) => Promise<VaultResponse<{ projectUrl?: string }>>;
    toBlog: (blogId: string, tag: string) => Promise<VaultResponse<{ jobId: string }>>;
    toBlogDirect: (blogId: string, content: string) => Promise<VaultResponse<{ jobId: string }>>;
    toCmsFile: (blogId: string, filePath: string, content: string, sha: string) => Promise<VaultResponse<{ jobId: string }>>;
    renameCmsFile: (blogId: string, oldPath: string, newName: string, sha: string) => Promise<VaultResponse<{ jobId: string }>>;
    getStatus: (jobId: string) => Promise<
      VaultResponse<{ status: string; progress: number; steps: any[]; error?: string }>
    >;
    subscribe: (jobId: string, callback: (data: any) => void) => Promise<VaultResponse>;
    unsubscribe: (jobId: string) => Promise<VaultResponse>;
    getAverageTime: () => Promise<VaultResponse<{ averageMs: number }>>;
  };

  // CMS operations (remote blog post management)
  cms: {
    getRemoteTree: () => Promise<VaultResponse<{ folders: FileNode[] }>>;
    getPostContent: (blogId: string, path: string) => Promise<VaultResponse<{ content: string; sha: string }>>;
    refreshCache: () => Promise<VaultResponse>;
    refreshBlog: (blogId: string) => Promise<VaultResponse>;
    saveDraft: (blogId: string, path: string, content: string, originalSha: string, originalContent: string) => Promise<VaultResponse>;
    getDraft: (blogId: string, path: string) => Promise<VaultResponse<{ draft: { content: string; originalSha: string } | null }>>;
    discardDraft: (blogId: string, path: string) => Promise<VaultResponse>;
    hasDraft: (blogId: string, path: string) => Promise<VaultResponse<{ hasDraft: boolean }>>;
    publishPost: (blogId: string, path: string, content: string, sha: string) => Promise<VaultResponse<{ newSha: string }>>;
    getModifiedPaths: (blogId: string) => Promise<VaultResponse<{ paths: string[] }>>;
    renameFile: (blogId: string, oldPath: string, newName: string, sha: string) => Promise<VaultResponse<{ newPath: string; newSha: string }>>;
    deleteFile: (blogId: string, path: string, sha: string) => Promise<VaultResponse>;
    onCacheUpdated: (callback: () => void) => void;
    removeCacheListener: () => void;
  };
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const api: ElectronAPI = {
  shell: {
    openExternal: (url: string) => ipcRenderer.invoke('shell:open-external', url)
  },

  dialog: {
    showOpenDialog: (options) => ipcRenderer.invoke('dialog:show-open', options)
  },

  vault: {
    initialize: (vaultPath?: string) => ipcRenderer.invoke('vault:initialize', vaultPath),
    getPath: () => ipcRenderer.invoke('vault:get-path'),
    getDefaultPath: () => ipcRenderer.invoke('vault:get-default-path'),
    isFirstRun: () => ipcRenderer.invoke('vault:is-first-run'),
    getFiles: () => ipcRenderer.invoke('vault:get-files'),
    readFile: (path: string) => ipcRenderer.invoke('vault:read-file', path),
    writeFile: (path: string, content: string) =>
      ipcRenderer.invoke('vault:write-file', path, content),
    createFile: (path: string, content: string = '') =>
      ipcRenderer.invoke('vault:create-file', path, content),
    deleteFile: (path: string) => ipcRenderer.invoke('vault:delete-file', path),
    createFolder: (path: string) => ipcRenderer.invoke('vault:create-folder', path),
    moveFile: (sourcePath: string, destFolder: string) =>
      ipcRenderer.invoke('vault:move-file', sourcePath, destFolder),
    renameFile: (oldPath: string, newName: string) =>
      ipcRenderer.invoke('vault:rename-file', oldPath, newName),
    getTodayNote: () => ipcRenderer.invoke('vault:get-today-note'),
    getDailyNote: (date: string) => ipcRenderer.invoke('vault:get-daily-note', date),
    getDailyNoteDates: () => ipcRenderer.invoke('vault:get-daily-note-dates'),
    // Multi-vault operations
    getAll: () => ipcRenderer.invoke('vault:get-all'),
    add: (vaultPath: string) => ipcRenderer.invoke('vault:add', vaultPath),
    switch: (vaultId: string) => ipcRenderer.invoke('vault:switch', vaultId),
    update: (vaultId: string, updates: { name?: string; path?: string }) =>
      ipcRenderer.invoke('vault:update', vaultId, updates),
    remove: (vaultId: string) => ipcRenderer.invoke('vault:remove', vaultId),
    delete: (vaultId: string) => ipcRenderer.invoke('vault:delete', vaultId)
  },

  tags: {
    buildIndex: () => ipcRenderer.invoke('tags:build-index'),
    getAllTags: () => ipcRenderer.invoke('tags:get-all'),
    getContent: (tag: string) => ipcRenderer.invoke('tags:get-content', tag),
    extract: (content: string) => ipcRenderer.invoke('tags:extract', content),
    getStats: (tag: string) => ipcRenderer.invoke('tags:get-stats', tag),
    deleteContent: (tag: string) => ipcRenderer.invoke('tags:delete-content', tag)
  },

  contextMenu: {
    showFileMenu: (filePath: string, options?: { isRemote?: boolean }) => ipcRenderer.invoke('context-menu:show-file', filePath, options),
    showFolderMenu: (folderPath: string) => ipcRenderer.invoke('context-menu:show-folder', folderPath),
    showSidebarMenu: () => ipcRenderer.invoke('context-menu:show-sidebar')
  },

  theme: {
    get: () => ipcRenderer.invoke('theme:get'),
    set: (theme: Theme) => ipcRenderer.invoke('theme:set', theme),
    onChange: (callback: (info: ThemeInfo) => void) => {
      ipcRenderer.on('theme:changed', (_event, info) => callback(info));
    },
    removeChangeListener: () => {
      ipcRenderer.removeAllListeners('theme:changed');
    }
  },

  publish: {
    getBlogs: () => ipcRenderer.invoke('publish:get-blogs'),
    getBlog: (blogId: string) => ipcRenderer.invoke('publish:get-blog', blogId),
    saveBlog: (blog: any) => ipcRenderer.invoke('publish:save-blog', blog),
    deleteBlog: (blogId: string) => ipcRenderer.invoke('publish:delete-blog', blogId),
    testConnection: (github: { repo: string; branch: string; token: string }, contentPath?: string) =>
      ipcRenderer.invoke('publish:test-connection', github, contentPath),
    testCloudflare: (cloudflare: { accountId: string; projectName: string; token: string }) =>
      ipcRenderer.invoke('publish:test-cloudflare', cloudflare),
    toBlog: (blogId: string, tag: string) =>
      ipcRenderer.invoke('publish:to-blog', blogId, tag),
    toBlogDirect: (blogId: string, content: string) =>
      ipcRenderer.invoke('publish:to-blog-direct', blogId, content),
    toCmsFile: (blogId: string, filePath: string, content: string, sha: string) =>
      ipcRenderer.invoke('publish:cms-file', blogId, filePath, content, sha),
    renameCmsFile: (blogId: string, oldPath: string, newName: string, sha: string) =>
      ipcRenderer.invoke('publish:cms-rename', blogId, oldPath, newName, sha),
    getStatus: (jobId: string) => ipcRenderer.invoke('publish:get-status', jobId),
    subscribe: async (jobId: string, callback: (data: any) => void) => {
      ipcRenderer.on(`publish:progress:${jobId}`, (_event, data) => callback(data));
      return ipcRenderer.invoke('publish:subscribe', jobId);
    },
    unsubscribe: (jobId: string) => {
      ipcRenderer.removeAllListeners(`publish:progress:${jobId}`);
      return ipcRenderer.invoke('publish:unsubscribe', jobId);
    },
    getAverageTime: () => ipcRenderer.invoke('publish:get-average-time')
  },

  cms: {
    getRemoteTree: () => ipcRenderer.invoke('cms:get-remote-tree'),
    getPostContent: (blogId: string, path: string) =>
      ipcRenderer.invoke('cms:get-post-content', blogId, path),
    refreshCache: () => ipcRenderer.invoke('cms:refresh-cache'),
    refreshBlog: (blogId: string) => ipcRenderer.invoke('cms:refresh-blog', blogId),
    saveDraft: (blogId: string, path: string, content: string, originalSha: string, originalContent: string) =>
      ipcRenderer.invoke('cms:save-draft', blogId, path, content, originalSha, originalContent),
    getDraft: (blogId: string, path: string) =>
      ipcRenderer.invoke('cms:get-draft', blogId, path),
    discardDraft: (blogId: string, path: string) =>
      ipcRenderer.invoke('cms:discard-draft', blogId, path),
    hasDraft: (blogId: string, path: string) =>
      ipcRenderer.invoke('cms:has-draft', blogId, path),
    publishPost: (blogId: string, path: string, content: string, sha: string) =>
      ipcRenderer.invoke('cms:publish-post', blogId, path, content, sha),
    getModifiedPaths: (blogId: string) =>
      ipcRenderer.invoke('cms:get-modified-paths', blogId),
    renameFile: (blogId: string, oldPath: string, newName: string, sha: string) =>
      ipcRenderer.invoke('cms:rename-file', blogId, oldPath, newName, sha),
    deleteFile: (blogId: string, path: string, sha: string) =>
      ipcRenderer.invoke('cms:delete-file', blogId, path, sha),
    onCacheUpdated: (callback: () => void) => {
      ipcRenderer.on('cms:cache-updated', () => callback());
    },
    removeCacheListener: () => {
      ipcRenderer.removeAllListeners('cms:cache-updated');
    }
  }
};

// Use contextBridge to safely expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', api);

// Type declaration for TypeScript in renderer process
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
