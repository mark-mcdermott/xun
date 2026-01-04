import { promises as fs } from 'fs';
import { join } from 'path';
import { extractTags, parseTaggedSections, type ParsedNote, type TaggedSection } from './tagUtils';
import type { VaultManager } from './VaultManager';

export interface TaggedContent {
  date: string;
  filePath: string;
  content: string;
  timestamp: number;
}

export interface TagIndex {
  [tag: string]: TaggedContent[];
}

export class TagManager {
  private vaultManager: VaultManager;
  private tagIndex: TagIndex = {};
  private lastIndexed: number = 0;

  constructor(vaultManager: VaultManager) {
    this.vaultManager = vaultManager;
  }

  /**
   * Build tag index by scanning all markdown files
   */
  async buildIndex(): Promise<void> {
    const vaultPath = this.vaultManager.getVaultPath();
    if (!vaultPath) {
      throw new Error('Vault not initialized');
    }

    this.tagIndex = {};

    // Scan daily notes and regular notes
    await this.scanDirectory(join(vaultPath, 'daily-notes'));
    await this.scanDirectory(join(vaultPath, 'notes'));

    this.lastIndexed = Date.now();
  }

  /**
   * Recursively scan directory for markdown files
   */
  private async scanDirectory(dirPath: string): Promise<void> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);

        if (entry.isDirectory()) {
          await this.scanDirectory(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          await this.indexFile(fullPath);
        }
      }
    } catch (err) {
      // Directory might not exist yet
      console.error(`Failed to scan directory ${dirPath}:`, err);
    }
  }

  /**
   * Index a single file
   */
  private async indexFile(filePath: string): Promise<void> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const vaultPath = this.vaultManager.getVaultPath();
      if (!vaultPath) return;

      // Get relative path from vault root
      const relativePath = filePath.substring(vaultPath.length + 1);

      // Parse tagged sections
      const parsed = parseTaggedSections(content, relativePath);

      // Get file stats for timestamp (once per file)
      const stats = await fs.stat(filePath);

      // Index each tagged section
      for (const section of parsed.sections) {
        // Skip sections with invalid/empty tags
        if (!section.tag || typeof section.tag !== 'string') {
          continue;
        }

        const tag = section.tag;
        if (!this.tagIndex[tag]) {
          this.tagIndex[tag] = [];
        }

        this.tagIndex[tag].push({
          date: parsed.date || stats.mtime.toISOString().split('T')[0],
          filePath: relativePath,
          content: section.content,
          timestamp: stats.mtimeMs
        });
      }
    } catch (err) {
      console.error(`Failed to index file ${filePath}:`, err);
    }
  }

  /**
   * Get all tags
   */
  getAllTags(): string[] {
    return Object.keys(this.tagIndex).sort();
  }

  /**
   * Get all content for a specific tag
   */
  getTaggedContent(tag: string): TaggedContent[] {
    const content = this.tagIndex[tag] || [];

    // Sort by date (oldest first) then by timestamp
    return content.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.timestamp - b.timestamp;
    });
  }

  /**
   * Extract tags from content (utility method)
   */
  extractTagsFromContent(content: string): string[] {
    return extractTags(content);
  }

  /**
   * Get tag statistics
   */
  getTagStats(tag: string): { count: number; lastUpdated: number } {
    const content = this.tagIndex[tag] || [];
    const lastUpdated = content.length > 0
      ? Math.max(...content.map(c => c.timestamp))
      : 0;

    return {
      count: content.length,
      lastUpdated
    };
  }

  /**
   * Delete all content for a tag (for job separation feature)
   */
  async deleteTagContent(tag: string): Promise<{ filesModified: string[]; sectionsDeleted: number }> {
    const content = this.getTaggedContent(tag);
    const vaultPath = this.vaultManager.getVaultPath();
    if (!vaultPath) {
      throw new Error('Vault not initialized');
    }

    const filesModified = new Set<string>();
    let sectionsDeleted = 0;

    for (const item of content) {
      const fullPath = join(vaultPath, item.filePath);

      try {
        // Read file
        const fileContent = await fs.readFile(fullPath, 'utf-8');
        const parsed = parseTaggedSections(fileContent, item.filePath);

        // Filter out sections with this tag
        const newSections = parsed.sections.filter(s => s.tag !== tag);
        sectionsDeleted += parsed.sections.length - newSections.length;

        // Reconstruct file without the deleted tag sections
        const lines = fileContent.split('\n');
        const linesToKeep = new Set<number>();

        // Mark lines that should be kept
        for (let i = 0; i < lines.length; i++) {
          linesToKeep.add(i);
        }

        // Remove lines from deleted sections
        for (const section of parsed.sections) {
          if (section.tag === tag) {
            // Remove tag line and content lines
            for (let i = section.startLine - 1; i <= section.endLine + 1; i++) {
              linesToKeep.delete(i);
            }
          }
        }

        // Reconstruct content
        const newContent = lines.filter((_, i) => linesToKeep.has(i)).join('\n');

        // Write back to file
        await fs.writeFile(fullPath, newContent, 'utf-8');
        filesModified.add(item.filePath);
      } catch (err) {
        console.error(`Failed to delete tag content from ${fullPath}:`, err);
      }
    }

    // Rebuild index
    await this.buildIndex();

    return {
      filesModified: Array.from(filesModified),
      sectionsDeleted
    };
  }

  /**
   * Check if index needs rebuilding
   */
  needsRebuild(): boolean {
    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() - this.lastIndexed > fiveMinutes;
  }
}
