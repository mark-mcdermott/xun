import { promises as fs } from 'fs';
import { join, parse, relative } from 'path';
import { app } from 'electron';
import type { VaultConfig, FileNode, VaultStructure } from './types';
import { DEFAULT_VAULT_STRUCTURE } from './types';

export class VaultManager {
  private vaultPath: string | null = null;
  private configPath: string;

  constructor() {
    this.configPath = join(app.getPath('userData'), 'vault-config.json');
  }

  /**
   * Initialize a new vault or load existing one
   */
  async initialize(vaultPath?: string): Promise<string> {
    // Try to load from config if no path provided
    if (!vaultPath) {
      const config = await this.loadConfig();
      if (config?.vaultPath) {
        vaultPath = config.vaultPath;
      } else {
        // Default to ~/Documents/OliteVault
        vaultPath = join(app.getPath('documents'), 'OliteVault');
      }
    }

    this.vaultPath = vaultPath;

    // Create vault structure if it doesn't exist
    await this.ensureVaultStructure();

    // Save config
    await this.saveConfig({
      vaultPath,
      lastOpened: new Date().toISOString(),
      dailyNotesPath: join(vaultPath, DEFAULT_VAULT_STRUCTURE.dailyNotes)
    });

    return vaultPath;
  }

  /**
   * Ensure vault directory structure exists
   */
  private async ensureVaultStructure(): Promise<void> {
    if (!this.vaultPath) {
      throw new Error('Vault not initialized');
    }

    const structure: VaultStructure = {
      root: this.vaultPath,
      dailyNotes: join(this.vaultPath, DEFAULT_VAULT_STRUCTURE.dailyNotes),
      notes: join(this.vaultPath, DEFAULT_VAULT_STRUCTURE.notes),
      config: join(this.vaultPath, DEFAULT_VAULT_STRUCTURE.config)
    };

    // Create directories
    await fs.mkdir(structure.root, { recursive: true });
    await fs.mkdir(structure.dailyNotes, { recursive: true });
    await fs.mkdir(structure.notes, { recursive: true });
    await fs.mkdir(structure.config, { recursive: true });

    // Create initial config files if they don't exist
    const configFile = join(structure.config, 'config.json');
    try {
      await fs.access(configFile);
    } catch {
      await fs.writeFile(configFile, JSON.stringify({ version: '0.1.0' }, null, 2));
    }
  }

  /**
   * Get all files in the vault as a tree structure
   */
  async getFileTree(): Promise<FileNode> {
    if (!this.vaultPath) {
      throw new Error('Vault not initialized');
    }

    return this.buildFileTree(this.vaultPath);
  }

  /**
   * Recursively build file tree
   */
  private async buildFileTree(dirPath: string): Promise<FileNode> {
    const stats = await fs.stat(dirPath);
    const name = parse(dirPath).base;
    const relativePath = this.vaultPath ? relative(this.vaultPath, dirPath) : dirPath;

    if (stats.isFile()) {
      return {
        name,
        path: relativePath,
        type: 'file',
        extension: parse(dirPath).ext,
        modifiedAt: stats.mtimeMs
      };
    }

    // Skip .olite directory in tree
    if (name === '.olite') {
      return {
        name,
        path: relativePath,
        type: 'folder',
        children: []
      };
    }

    const children: FileNode[] = [];
    const entries = await fs.readdir(dirPath);

    for (const entry of entries) {
      // Skip hidden files except .olite
      if (entry.startsWith('.') && entry !== '.olite') {
        continue;
      }

      const childPath = join(dirPath, entry);
      const childNode = await this.buildFileTree(childPath);
      children.push(childNode);
    }

    // Sort: folders first, then files, alphabetically
    children.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    return {
      name,
      path: relativePath,
      type: 'folder',
      children,
      modifiedAt: stats.mtimeMs
    };
  }

  /**
   * Read file contents
   */
  async readFile(relativePath: string): Promise<string> {
    if (!this.vaultPath) {
      throw new Error('Vault not initialized');
    }

    const fullPath = join(this.vaultPath, relativePath);
    return fs.readFile(fullPath, 'utf-8');
  }

  /**
   * Write file contents
   */
  async writeFile(relativePath: string, content: string): Promise<void> {
    if (!this.vaultPath) {
      throw new Error('Vault not initialized');
    }

    const fullPath = join(this.vaultPath, relativePath);
    await fs.writeFile(fullPath, content, 'utf-8');
  }

  /**
   * Create a new file
   */
  async createFile(relativePath: string, content: string = ''): Promise<void> {
    if (!this.vaultPath) {
      throw new Error('Vault not initialized');
    }

    const fullPath = join(this.vaultPath, relativePath);

    // Ensure parent directory exists
    await fs.mkdir(parse(fullPath).dir, { recursive: true });

    // Check if file already exists
    try {
      await fs.access(fullPath);
      throw new Error(`File already exists: ${relativePath}`);
    } catch (err: any) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }

    await fs.writeFile(fullPath, content, 'utf-8');
  }

  /**
   * Delete a file
   */
  async deleteFile(relativePath: string): Promise<void> {
    if (!this.vaultPath) {
      throw new Error('Vault not initialized');
    }

    const fullPath = join(this.vaultPath, relativePath);
    await fs.unlink(fullPath);
  }

  /**
   * Create a folder
   */
  async createFolder(relativePath: string): Promise<void> {
    if (!this.vaultPath) {
      throw new Error('Vault not initialized');
    }

    const fullPath = join(this.vaultPath, relativePath);
    await fs.mkdir(fullPath, { recursive: true });
  }

  /**
   * Get today's daily note path
   */
  getTodayNotePath(): string {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return join(DEFAULT_VAULT_STRUCTURE.dailyNotes, `${today}.md`);
  }

  /**
   * Create or get today's daily note
   */
  async getTodayNote(): Promise<{ path: string; content: string; isNew: boolean }> {
    const notePath = this.getTodayNotePath();

    try {
      const content = await this.readFile(notePath);
      return { path: notePath, content, isNew: false };
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        // Create new daily note
        const today = new Date().toISOString().split('T')[0];
        const content = `# ${today}\n\n`;
        await this.createFile(notePath, content);
        return { path: notePath, content, isNew: true };
      }
      throw err;
    }
  }

  /**
   * Get daily note for a specific date (YYYY-MM-DD)
   */
  async getDailyNote(date: string): Promise<{ path: string; content: string; isNew: boolean }> {
    const notePath = join(DEFAULT_VAULT_STRUCTURE.dailyNotes, `${date}.md`);

    try {
      const content = await this.readFile(notePath);
      return { path: notePath, content, isNew: false };
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        // Create new daily note
        const content = `# ${date}\n\n`;
        await this.createFile(notePath, content);
        return { path: notePath, content, isNew: true };
      }
      throw err;
    }
  }

  /**
   * Get all existing daily note dates
   */
  async getDailyNoteDates(): Promise<string[]> {
    if (!this.vaultPath) {
      throw new Error('Vault not initialized');
    }

    const dailyNotesDir = join(this.vaultPath, DEFAULT_VAULT_STRUCTURE.dailyNotes);
    const dates: string[] = [];

    try {
      const files = await fs.readdir(dailyNotesDir);

      for (const file of files) {
        // Match YYYY-MM-DD.md pattern
        const match = file.match(/^(\d{4}-\d{2}-\d{2})\.md$/);
        if (match) {
          dates.push(match[1]);
        }
      }

      return dates.sort();
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        return [];
      }
      throw err;
    }
  }

  /**
   * Load vault configuration
   */
  private async loadConfig(): Promise<VaultConfig | null> {
    try {
      const data = await fs.readFile(this.configPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  /**
   * Save vault configuration
   */
  private async saveConfig(config: VaultConfig): Promise<void> {
    await fs.writeFile(this.configPath, JSON.stringify(config, null, 2));
  }

  /**
   * Get current vault path
   */
  getVaultPath(): string | null {
    return this.vaultPath;
  }
}

// Singleton instance
export const vaultManager = new VaultManager();
