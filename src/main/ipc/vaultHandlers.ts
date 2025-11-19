import { ipcMain } from 'electron';
import { vaultManager } from '../vault/VaultManager';

/**
 * Register all vault-related IPC handlers
 */
export function registerVaultHandlers(): void {
  // Initialize vault
  ipcMain.handle('vault:initialize', async (_event, vaultPath?: string) => {
    try {
      const path = await vaultManager.initialize(vaultPath);
      return { success: true, path };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Get vault path
  ipcMain.handle('vault:get-path', async () => {
    const path = vaultManager.getVaultPath();
    return { success: true, path };
  });

  // Get file tree
  ipcMain.handle('vault:get-files', async () => {
    try {
      const tree = await vaultManager.getFileTree();
      return { success: true, tree };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Read file
  ipcMain.handle('vault:read-file', async (_event, path: string) => {
    try {
      const content = await vaultManager.readFile(path);
      return { success: true, content };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Write file
  ipcMain.handle('vault:write-file', async (_event, path: string, content: string) => {
    try {
      await vaultManager.writeFile(path, content);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Create file
  ipcMain.handle('vault:create-file', async (_event, path: string, content: string = '') => {
    try {
      await vaultManager.createFile(path, content);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Delete file
  ipcMain.handle('vault:delete-file', async (_event, path: string) => {
    try {
      await vaultManager.deleteFile(path);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Create folder
  ipcMain.handle('vault:create-folder', async (_event, path: string) => {
    try {
      await vaultManager.createFolder(path);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Get today's note
  ipcMain.handle('vault:get-today-note', async () => {
    try {
      const note = await vaultManager.getTodayNote();
      return { success: true, ...note };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
}
