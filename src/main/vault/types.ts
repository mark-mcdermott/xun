/**
 * Vault-related type definitions
 */

export interface VaultConfig {
  vaultPath: string;
  lastOpened: string;
  dailyNotesPath: string;
}

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  extension?: string;
  modifiedAt?: number;
}

export interface NoteMetadata {
  path: string;
  name: string;
  tags: string[];
  createdAt: number;
  modifiedAt: number;
  content?: string;
}

export interface VaultStructure {
  root: string;
  dailyNotes: string;
  notes: string;
  config: string;
}

export const DEFAULT_VAULT_STRUCTURE: VaultStructure = {
  root: '',
  dailyNotes: 'daily-notes',
  notes: 'notes',
  config: '.olite'
};
