import { contextBridge, ipcRenderer } from 'electron';

// Import types from main process
export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  extension?: string;
  modifiedAt?: number;
}

interface VaultResponse<T = any> {
  success: boolean;
  error?: string;
  [key: string]: any;
}

// Define the API that will be exposed to the renderer process
export interface ElectronAPI {
  // Vault operations
  vault: {
    initialize: (vaultPath?: string) => Promise<VaultResponse<{ path: string }>>;
    getPath: () => Promise<VaultResponse<{ path: string | null }>>;
    getFiles: () => Promise<VaultResponse<{ tree: FileNode }>>;
    readFile: (path: string) => Promise<VaultResponse<{ content: string }>>;
    writeFile: (path: string, content: string) => Promise<VaultResponse>;
    createFile: (path: string, content?: string) => Promise<VaultResponse>;
    deleteFile: (path: string) => Promise<VaultResponse>;
    createFolder: (path: string) => Promise<VaultResponse>;
    getTodayNote: () => Promise<
      VaultResponse<{ path: string; content: string; isNew: boolean }>
    >;
  };

  // Tag operations (to be implemented)
  tags: {
    extractTags: (content: string) => Promise<string[]>;
    getTaggedContent: (tag: string) => Promise<Array<{ date: string; content: string }>>;
  };

  // Publishing operations (to be implemented)
  publish: {
    toBlog: (blogId: string, tag: string) => Promise<{ success: boolean; jobId: string }>;
    getStatus: (jobId: string) => Promise<{ status: string; progress: number }>;
  };
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const api: ElectronAPI = {
  vault: {
    initialize: (vaultPath?: string) => ipcRenderer.invoke('vault:initialize', vaultPath),
    getPath: () => ipcRenderer.invoke('vault:get-path'),
    getFiles: () => ipcRenderer.invoke('vault:get-files'),
    readFile: (path: string) => ipcRenderer.invoke('vault:read-file', path),
    writeFile: (path: string, content: string) =>
      ipcRenderer.invoke('vault:write-file', path, content),
    createFile: (path: string, content: string = '') =>
      ipcRenderer.invoke('vault:create-file', path, content),
    deleteFile: (path: string) => ipcRenderer.invoke('vault:delete-file', path),
    createFolder: (path: string) => ipcRenderer.invoke('vault:create-folder', path),
    getTodayNote: () => ipcRenderer.invoke('vault:get-today-note')
  },

  tags: {
    extractTags: (content: string) => ipcRenderer.invoke('tags:extract', content),
    getTaggedContent: (tag: string) => ipcRenderer.invoke('tags:get-content', tag)
  },

  publish: {
    toBlog: (blogId: string, tag: string) =>
      ipcRenderer.invoke('publish:to-blog', blogId, tag),
    getStatus: (jobId: string) => ipcRenderer.invoke('publish:get-status', jobId)
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
