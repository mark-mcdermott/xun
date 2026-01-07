/**
 * In-memory draft storage for edited remote posts
 * Drafts are lost on app restart (by design)
 */

export interface Draft {
  blogId: string;
  path: string;
  content: string;
  originalSha: string;
  originalContent: string;
  lastModified: number;
}

export class DraftManager {
  // Key format: "blogId:path"
  private drafts: Map<string, Draft> = new Map();

  private getKey(blogId: string, path: string): string {
    return `${blogId}:${path}`;
  }

  /**
   * Save a draft edit
   */
  saveDraft(
    blogId: string,
    path: string,
    content: string,
    originalSha: string,
    originalContent: string
  ): void {
    const key = this.getKey(blogId, path);

    // Only save if content actually differs from original
    if (content === originalContent) {
      // If content matches original, remove any existing draft
      this.drafts.delete(key);
      return;
    }

    this.drafts.set(key, {
      blogId,
      path,
      content,
      originalSha,
      originalContent,
      lastModified: Date.now()
    });
  }

  /**
   * Get a draft if it exists
   */
  getDraft(blogId: string, path: string): Draft | null {
    const key = this.getKey(blogId, path);
    return this.drafts.get(key) || null;
  }

  /**
   * Check if a draft exists
   */
  hasDraft(blogId: string, path: string): boolean {
    const key = this.getKey(blogId, path);
    return this.drafts.has(key);
  }

  /**
   * Delete a draft (e.g., after publishing or discarding)
   */
  deleteDraft(blogId: string, path: string): void {
    const key = this.getKey(blogId, path);
    this.drafts.delete(key);
  }

  /**
   * Get all paths with unpublished changes for a blog
   */
  getModifiedPaths(blogId: string): string[] {
    const paths: string[] = [];
    for (const [key, draft] of this.drafts) {
      if (draft.blogId === blogId) {
        paths.push(draft.path);
      }
    }
    return paths;
  }

  /**
   * Get all drafts for a blog
   */
  getDraftsForBlog(blogId: string): Draft[] {
    const drafts: Draft[] = [];
    for (const draft of this.drafts.values()) {
      if (draft.blogId === blogId) {
        drafts.push(draft);
      }
    }
    return drafts;
  }

  /**
   * Get content to display (draft if exists, otherwise original)
   */
  getDisplayContent(blogId: string, path: string, originalContent: string): string {
    const draft = this.getDraft(blogId, path);
    return draft ? draft.content : originalContent;
  }

  /**
   * Check if content has unsaved changes
   */
  hasUnsavedChanges(blogId: string, path: string): boolean {
    return this.hasDraft(blogId, path);
  }

  /**
   * Clear all drafts
   */
  clearAll(): void {
    this.drafts.clear();
  }

  /**
   * Clear all drafts for a specific blog
   */
  clearBlog(blogId: string): void {
    for (const [key, draft] of this.drafts) {
      if (draft.blogId === blogId) {
        this.drafts.delete(key);
      }
    }
  }

  /**
   * Get total number of drafts
   */
  getDraftCount(): number {
    return this.drafts.size;
  }

  /**
   * Get draft count for a specific blog
   */
  getDraftCountForBlog(blogId: string): number {
    let count = 0;
    for (const draft of this.drafts.values()) {
      if (draft.blogId === blogId) {
        count++;
      }
    }
    return count;
  }
}
