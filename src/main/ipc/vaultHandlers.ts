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

  // Move file or folder
  ipcMain.handle('vault:move-file', async (_event, sourcePath: string, destFolder: string) => {
    try {
      const newPath = await vaultManager.moveFile(sourcePath, destFolder);
      return { success: true, newPath };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Rename file or folder
  ipcMain.handle('vault:rename-file', async (_event, oldPath: string, newName: string) => {
    try {
      const newPath = await vaultManager.renameFile(oldPath, newName);
      return { success: true, newPath };
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

  // Get daily note for specific date
  ipcMain.handle('vault:get-daily-note', async (_event, date: string) => {
    try {
      const note = await vaultManager.getDailyNote(date);
      return { success: true, ...note };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Get all daily note dates
  ipcMain.handle('vault:get-daily-note-dates', async () => {
    try {
      const dates = await vaultManager.getDailyNoteDates();
      return { success: true, dates };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
}
