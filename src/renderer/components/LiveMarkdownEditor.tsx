import React, { useEffect, useRef, useCallback } from 'react';
import { EditorState, StateField, Text, Range } from '@codemirror/state';
import {
  EditorView,
  Decoration,
  DecorationSet,
  WidgetType,
  ViewPlugin,
  ViewUpdate,
  keymap,
  drawSelection
} from '@codemirror/view';
import { markdown } from '@codemirror/lang-markdown';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { autocompletion, CompletionContext, Completion, startCompletion } from '@codemirror/autocomplete';

// ============================================================================
// Types for markdown element parsing
// ============================================================================

interface MarkdownElement {
  type: 'bold' | 'italic' | 'code' | 'strikethrough' | 'link' | 'image' | 'tag';
  from: number;  // Start of entire element (including markers)
  to: number;    // End of entire element (including markers)
  openMarker: { from: number; to: number };
  closeMarker: { from: number; to: number };
  // For links: extra info
  linkUrl?: string;
}

interface HeaderElement {
  type: 'header';
  level: number;
  from: number;
  to: number;
  markerFrom: number;
  markerTo: number;  // includes the space after #
  isComplete: boolean;  // true if has space after #, false if just # or #text (tag-like)
}

interface ListElement {
  type: 'list';
  listType: 'ul' | 'ol' | 'task';
  checked?: boolean;
  from: number;
  to: number;
  markerFrom: number;
  markerTo: number;
  indent: number;
}

interface BlockquoteElement {
  type: 'blockquote';
  from: number;
  to: number;
  markerFrom: number;
  markerTo: number;
}

// ============================================================================
// Markdown element parser - identifies inline elements and their marker positions
// ============================================================================

function parseInlineElements(text: string, lineFrom: number): MarkdownElement[] {
  const elements: MarkdownElement[] = [];
  let match;

  // First, find all COMPLETE patterns (closed markers)

  // Bold: **text** (must check before italic)
  const boldRegex = /\*\*([^*]+)\*\*/g;
  while ((match = boldRegex.exec(text)) !== null) {
    elements.push({
      type: 'bold',
      from: lineFrom + match.index,
      to: lineFrom + match.index + match[0].length,
      openMarker: { from: lineFrom + match.index, to: lineFrom + match.index + 2 },
      closeMarker: { from: lineFrom + match.index + match[0].length - 2, to: lineFrom + match.index + match[0].length }
    });
  }

  // Bold with underscores: __text__
  const boldUnderscoreRegex = /__([^_]+)__/g;
  while ((match = boldUnderscoreRegex.exec(text)) !== null) {
    elements.push({
      type: 'bold',
      from: lineFrom + match.index,
      to: lineFrom + match.index + match[0].length,
      openMarker: { from: lineFrom + match.index, to: lineFrom + match.index + 2 },
      closeMarker: { from: lineFrom + match.index + match[0].length - 2, to: lineFrom + match.index + match[0].length }
    });
  }

  // Italic: *text* (single asterisk, but not inside bold)
  const italicRegex = /(?<!\*)\*([^*]+)\*(?!\*)/g;
  while ((match = italicRegex.exec(text)) !== null) {
    const from = lineFrom + match.index;
    const to = lineFrom + match.index + match[0].length;
    const overlapsWithBold = elements.some(el =>
      el.type === 'bold' && !(to <= el.from || from >= el.to)
    );
    if (!overlapsWithBold) {
      elements.push({
        type: 'italic',
        from,
        to,
        openMarker: { from, to: from + 1 },
        closeMarker: { from: to - 1, to }
      });
    }
  }

  // Italic with underscores: _text_
  const italicUnderscoreRegex = /(?<![_\w])_([^_]+)_(?![_\w])/g;
  while ((match = italicUnderscoreRegex.exec(text)) !== null) {
    elements.push({
      type: 'italic',
      from: lineFrom + match.index,
      to: lineFrom + match.index + match[0].length,
      openMarker: { from: lineFrom + match.index, to: lineFrom + match.index + 1 },
      closeMarker: { from: lineFrom + match.index + match[0].length - 1, to: lineFrom + match.index + match[0].length }
    });
  }

  // Strikethrough: ~~text~~
  const strikeRegex = /~~([^~]+)~~/g;
  while ((match = strikeRegex.exec(text)) !== null) {
    elements.push({
      type: 'strikethrough',
      from: lineFrom + match.index,
      to: lineFrom + match.index + match[0].length,
      openMarker: { from: lineFrom + match.index, to: lineFrom + match.index + 2 },
      closeMarker: { from: lineFrom + match.index + match[0].length - 2, to: lineFrom + match.index + match[0].length }
    });
  }

  // Inline code: `code`
  const codeRegex = /`([^`]+)`/g;
  while ((match = codeRegex.exec(text)) !== null) {
    elements.push({
      type: 'code',
      from: lineFrom + match.index,
      to: lineFrom + match.index + match[0].length,
      openMarker: { from: lineFrom + match.index, to: lineFrom + match.index + 1 },
      closeMarker: { from: lineFrom + match.index + match[0].length - 1, to: lineFrom + match.index + match[0].length }
    });
  }

  // Links: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  while ((match = linkRegex.exec(text)) !== null) {
    const linkText = match[1];
    const linkUrl = match[2];
    const fullFrom = lineFrom + match.index;
    const fullTo = lineFrom + match.index + match[0].length;
    const textEnd = fullFrom + 1 + linkText.length;

    elements.push({
      type: 'link',
      from: fullFrom,
      to: fullTo,
      openMarker: { from: fullFrom, to: fullFrom + 1 },
      closeMarker: { from: textEnd, to: fullTo },
      linkUrl
    });
  }

  // Tags: #tag-name
  const tagRegex = /(^|\s)(#[a-zA-Z0-9_-]+)/g;
  while ((match = tagRegex.exec(text)) !== null) {
    const tagStart = lineFrom + match.index + match[1].length;
    const tagEnd = tagStart + match[2].length;
    elements.push({
      type: 'tag',
      from: tagStart,
      to: tagEnd,
      openMarker: { from: tagStart, to: tagStart },
      closeMarker: { from: tagEnd, to: tagEnd }
    });
  }

  // Now find UNCLOSED/OPEN patterns (like Obsidian behavior)
  // These apply styling from the marker to end of line

  // Unclosed bold: **text (no closing **)
  const unclosedBoldRegex = /\*\*([^*]*)$/g;
  while ((match = unclosedBoldRegex.exec(text)) !== null) {
    const from = lineFrom + match.index;
    const to = lineFrom + text.length;
    // Check if this position is already covered by a closed bold
    const alreadyCovered = elements.some(el =>
      el.type === 'bold' && el.from <= from && el.to >= from
    );
    if (!alreadyCovered && match[1].length > 0) {
      elements.push({
        type: 'bold',
        from,
        to,
        openMarker: { from, to: from + 2 },
        closeMarker: { from: to, to } // No close marker
      });
    }
  }

  // Unclosed italic: *text (single *, no closing)
  // Must not be part of **
  const unclosedItalicRegex = /(?<!\*)\*(?!\*)([^*]*)$/g;
  while ((match = unclosedItalicRegex.exec(text)) !== null) {
    const from = lineFrom + match.index;
    const to = lineFrom + text.length;
    // Check if already covered by bold or italic
    const alreadyCovered = elements.some(el =>
      (el.type === 'bold' || el.type === 'italic') && el.from <= from && el.to >= from
    );
    if (!alreadyCovered && match[1].length > 0) {
      elements.push({
        type: 'italic',
        from,
        to,
        openMarker: { from, to: from + 1 },
        closeMarker: { from: to, to }
      });
    }
  }

  // Unclosed strikethrough: ~~text (no closing ~~)
  const unclosedStrikeRegex = /~~([^~]*)$/g;
  while ((match = unclosedStrikeRegex.exec(text)) !== null) {
    const from = lineFrom + match.index;
    const to = lineFrom + text.length;
    const alreadyCovered = elements.some(el =>
      el.type === 'strikethrough' && el.from <= from && el.to >= from
    );
    if (!alreadyCovered && match[1].length > 0) {
      elements.push({
        type: 'strikethrough',
        from,
        to,
        openMarker: { from, to: from + 2 },
        closeMarker: { from: to, to }
      });
    }
  }

  // Unclosed inline code: `text (no closing `)
  const unclosedCodeRegex = /`([^`]*)$/g;
  while ((match = unclosedCodeRegex.exec(text)) !== null) {
    const from = lineFrom + match.index;
    const to = lineFrom + text.length;
    const alreadyCovered = elements.some(el =>
      el.type === 'code' && el.from <= from && el.to >= from
    );
    if (!alreadyCovered && match[1].length > 0) {
      elements.push({
        type: 'code',
        from,
        to,
        openMarker: { from, to: from + 1 },
        closeMarker: { from: to, to }
      });
    }
  }

  return elements;
}

function parseHeaderElement(text: string, lineFrom: number): HeaderElement | null {
  // Complete header: # followed by space (standard markdown header)
  const completeMatch = text.match(/^(#{1,6})\s+/);
  if (completeMatch) {
    return {
      type: 'header',
      level: completeMatch[1].length,
      from: lineFrom,
      to: lineFrom + text.length,
      markerFrom: lineFrom,
      markerTo: lineFrom + completeMatch[0].length,
      isComplete: true
    };
  }

  // Incomplete header: just # at start of line (either just # or #text without space)
  // This gives Obsidian-like instant feedback while typing
  const incompleteMatch = text.match(/^(#{1,6})(?=\S|$)/);
  if (incompleteMatch) {
    // Check if this is actually a tag (# followed by word chars) - tags should be styled differently
    const isTagLike = text.match(/^#{1}[a-zA-Z0-9_-]+$/);
    if (isTagLike) {
      // Single # followed immediately by text looks like a tag - don't treat as header
      return null;
    }

    return {
      type: 'header',
      level: incompleteMatch[1].length,
      from: lineFrom,
      to: lineFrom + text.length,
      markerFrom: lineFrom,
      markerTo: lineFrom + incompleteMatch[1].length,
      isComplete: false
    };
  }

  return null;
}

function parseListElement(text: string, lineFrom: number): ListElement | null {
  // Task list: - [ ] or - [x]
  const taskMatch = text.match(/^(\s*)([-*+])\s+\[([ xX])\]\s+/);
  if (taskMatch) {
    return {
      type: 'list',
      listType: 'task',
      checked: taskMatch[3].toLowerCase() === 'x',
      from: lineFrom,
      to: lineFrom + text.length,
      markerFrom: lineFrom + taskMatch[1].length,
      markerTo: lineFrom + taskMatch[0].length,
      indent: taskMatch[1].length
    };
  }

  // Unordered list: - item, * item, + item
  const ulMatch = text.match(/^(\s*)([-*+])\s+/);
  if (ulMatch) {
    return {
      type: 'list',
      listType: 'ul',
      from: lineFrom,
      to: lineFrom + text.length,
      markerFrom: lineFrom + ulMatch[1].length,
      markerTo: lineFrom + ulMatch[0].length,
      indent: ulMatch[1].length
    };
  }

  // Ordered list: 1. item
  const olMatch = text.match(/^(\s*)(\d+)\.\s+/);
  if (olMatch) {
    return {
      type: 'list',
      listType: 'ol',
      from: lineFrom,
      to: lineFrom + text.length,
      markerFrom: lineFrom + olMatch[1].length,
      markerTo: lineFrom + olMatch[0].length,
      indent: olMatch[1].length
    };
  }

  return null;
}

function parseBlockquoteElement(text: string, lineFrom: number): BlockquoteElement | null {
  const match = text.match(/^>\s*/);
  if (match) {
    return {
      type: 'blockquote',
      from: lineFrom,
      to: lineFrom + text.length,
      markerFrom: lineFrom,
      markerTo: lineFrom + match[0].length
    };
  }
  return null;
}

// ============================================================================
// Widgets (kept for special cases: blog blocks, images, code blocks)
// ============================================================================

// Lucide icon SVGs (inline to avoid React component in vanilla DOM widget)
const ROCKET_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`;

const CHECK_CIRCLE_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>`;

// Widget for blog block opening === with rocket publish icon
class BlogBlockHeaderWidget extends WidgetType {
  constructor(
    readonly blockStartLine: number,
    readonly hasPublish: boolean,
    readonly isPublished: boolean
  ) {
    super();
  }

  toDOM() {
    const wrapper = document.createElement('span');
    wrapper.className = 'cm-blog-block-header';
    wrapper.style.cssText = 'display: inline-flex; align-items: center; gap: 12px; line-height: 1;';

    const label = document.createElement('span');
    label.textContent = 'blog post';
    label.style.cssText = 'font-size: 1.75em; font-weight: 700; color: #3f0c8d; line-height: 1;';
    wrapper.appendChild(label);

    if (this.hasPublish) {
      const iconBtn = document.createElement('button');
      iconBtn.className = 'cm-blog-publish-btn';
      const blockLine = this.blockStartLine;

      if (this.isPublished) {
        iconBtn.innerHTML = CHECK_CIRCLE_ICON_SVG;
        iconBtn.title = 'Click to republish';
        iconBtn.style.cssText = 'background: none; border: none; cursor: default; padding: 4px; border-radius: 4px; transition: background-color 0.15s; display: flex; align-items: center; color: #16a34a;';
        iconBtn.onmouseenter = () => { iconBtn.style.backgroundColor = '#f0f0f0'; };
        iconBtn.onmouseleave = () => { iconBtn.style.backgroundColor = 'transparent'; };

        iconBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          // Switch to rocket icon for republishing
          iconBtn.innerHTML = ROCKET_ICON_SVG;
          iconBtn.title = 'Republish this blog post';
          iconBtn.style.color = '#3f0c8d';
          // Now clicking again will publish
          iconBtn.onclick = (e2) => {
            e2.preventDefault();
            e2.stopPropagation();
            window.dispatchEvent(new CustomEvent('blog-publish-click', {
              detail: { blockLine }
            }));
          };
        };
      } else {
        iconBtn.innerHTML = ROCKET_ICON_SVG;
        iconBtn.title = 'Publish this blog post';
        iconBtn.style.cssText = 'background: none; border: none; cursor: pointer; padding: 4px; border-radius: 4px; transition: background-color 0.15s; display: flex; align-items: center; color: #3f0c8d;';
        iconBtn.onmouseenter = () => { iconBtn.style.backgroundColor = '#f0f0f0'; };
        iconBtn.onmouseleave = () => { iconBtn.style.backgroundColor = 'transparent'; };

        iconBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          window.dispatchEvent(new CustomEvent('blog-publish-click', {
            detail: { blockLine }
          }));
        };
      }
      wrapper.appendChild(iconBtn);
    }

    return wrapper;
  }

  eq(other: BlogBlockHeaderWidget) {
    return other.blockStartLine === this.blockStartLine &&
           other.hasPublish === this.hasPublish &&
           other.isPublished === this.isPublished;
  }
}

// Simple widget for code block labels and closing blog markers
class SimpleTextWidget extends WidgetType {
  constructor(readonly html: string) {
    super();
  }

  toDOM() {
    const wrapper = document.createElement('span');
    wrapper.innerHTML = this.html;
    wrapper.className = 'cm-simple-widget';
    return wrapper;
  }

  eq(other: SimpleTextWidget) {
    return other.html === this.html;
  }
}

// Widget for rendering images
class ImageWidget extends WidgetType {
  constructor(readonly src: string, readonly alt: string) {
    super();
  }

  toDOM() {
    const img = document.createElement('img');
    img.src = this.src;
    img.alt = this.alt;
    img.style.cssText = 'max-width: 100%; height: auto; display: block; margin: 8px 0;';
    return img;
  }

  eq(other: ImageWidget) {
    return other.src === this.src && other.alt === this.alt;
  }
}

// ============================================================================
// State field for cursor position tracking
// ============================================================================

const cursorPositionField = StateField.define<number>({
  create() {
    return -1;
  },
  update(value, tr) {
    if (tr.selection) {
      return tr.selection.main.head;
    }
    return value;
  }
});

// ============================================================================
// Create decorations - the core of live preview
// ============================================================================

function createDecorations(
  view: EditorView,
  onPublish?: (blogId: string, content: string) => void,
  blogs?: Array<{ id: string; name: string }>
): DecorationSet {
  const cursorPos = view.state.field(cursorPositionField);
  const decorations: Range<Decoration>[] = [];
  const doc = view.state.doc;

  let inCodeBlock = false;
  let inBlogBlock = false;
  let inBlogFrontmatter = false;
  let blogFrontmatterDashCount = 0;
  let blogBlockStartLine = -1;

  for (let i = 1; i <= doc.lines; i++) {
    const line = doc.line(i);
    const lineText = line.text;
    const cursorOnThisLine = cursorPos >= line.from && cursorPos <= line.to;

    // Track blog block state
    if (lineText.trim() === '===') {
      if (!inBlogBlock) {
        // Opening ===
        inBlogBlock = true;
        inBlogFrontmatter = true;
        blogFrontmatterDashCount = 0;
        blogBlockStartLine = i;

        // Look ahead to check if published: true exists in the block
        let isPublished = false;
        for (let j = i + 1; j <= doc.lines; j++) {
          const checkLine = doc.line(j).text.trim();
          if (checkLine === '===') break;
          if (checkLine.match(/^published:\s*true/)) {
            isPublished = true;
            break;
          }
        }

        // Show widget unless cursor is on this line
        if (!cursorOnThisLine) {
          decorations.push(
            Decoration.replace({
              widget: new BlogBlockHeaderWidget(i, Boolean(onPublish), isPublished)
            }).range(line.from, line.to)
          );
        }
      } else {
        // Closing ===
        inBlogBlock = false;
        inBlogFrontmatter = false;
        blogFrontmatterDashCount = 0;
        blogBlockStartLine = -1;

        if (!cursorOnThisLine) {
          decorations.push(
            Decoration.replace({
              widget: new SimpleTextWidget(`<span style="color: #9ca3af; font-size: 0.85em;">═══</span>`)
            }).range(line.from, line.to)
          );
        }
      }
      continue;
    }

    // Track frontmatter state within blog block (between --- lines)
    if (inBlogBlock && lineText.trim() === '---') {
      blogFrontmatterDashCount++;
      if (blogFrontmatterDashCount >= 2) {
        inBlogFrontmatter = false;
      }
      continue;
    }

    // Track code block state
    if (lineText.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      if (!cursorOnThisLine) {
        const lang = lineText.slice(3);
        const label = lang ? `Code (${lang})` : 'Code';
        decorations.push(
          Decoration.replace({
            widget: new SimpleTextWidget(`<span style="color: #9ca3af; font-size: 0.75em;">${label}</span>`)
          }).range(line.from, line.to)
        );
      }
      continue;
    }

    // Inside code block - apply code styling
    if (inCodeBlock) {
      decorations.push(
        Decoration.mark({ class: 'cm-code-block-line' }).range(line.from, line.to)
      );
      continue;
    }

    // Inside blog block frontmatter - don't apply markdown formatting
    if (inBlogFrontmatter) {
      continue;
    }

    // Empty lines - skip
    if (lineText.trim() === '') {
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(lineText.trim())) {
      if (!cursorOnThisLine) {
        decorations.push(
          Decoration.mark({ class: 'cm-horizontal-rule' }).range(line.from, line.to)
        );
      }
      continue;
    }

    // Check for images: ![alt](url) - use widget to actually render
    const imageMatch = lineText.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageMatch && !cursorOnThisLine) {
      decorations.push(
        Decoration.replace({
          widget: new ImageWidget(imageMatch[2], imageMatch[1])
        }).range(line.from, line.to)
      );
      continue;
    }

    // Parse header
    const header = parseHeaderElement(lineText, line.from);
    if (header) {
      if (header.isComplete) {
        // Complete header (# followed by space): apply header styling to content
        if (header.markerTo < header.to) {
          decorations.push(
            Decoration.mark({ class: `cm-header cm-header-${header.level}` }).range(header.markerTo, header.to)
          );
        }
        // Hide the # markers unless cursor is on this line (keep them visible while editing)
        if (!cursorOnThisLine) {
          decorations.push(
            Decoration.mark({ class: 'cm-hidden-marker' }).range(header.markerFrom, header.markerTo)
          );
        } else {
          // Cursor on line - show markers but style them as header
          decorations.push(
            Decoration.mark({ class: `cm-header cm-header-${header.level} cm-header-marker` }).range(header.markerFrom, header.markerTo)
          );
        }
      } else {
        // Incomplete header (just # or ## etc, or #text without space)
        // Style the entire line as header-sized to give immediate feedback
        // The # markers stay visible since it's incomplete
        if (header.markerTo < header.to) {
          // There's content after the #s - style it as header
          decorations.push(
            Decoration.mark({ class: `cm-header cm-header-${header.level}` }).range(header.markerTo, header.to)
          );
        }
        // Style the # markers themselves too (visible but styled)
        decorations.push(
          Decoration.mark({ class: `cm-header cm-header-${header.level} cm-header-marker` }).range(header.markerFrom, header.markerTo)
        );
      }
    }

    // Parse list elements
    const listEl = parseListElement(lineText, line.from);
    if (listEl) {
      const cursorInMarker = cursorPos >= listEl.markerFrom && cursorPos <= listEl.markerTo;
      if (!cursorInMarker) {
        // Add a decoration to hide the marker
        decorations.push(
          Decoration.mark({ class: 'cm-hidden-marker' }).range(listEl.markerFrom, listEl.markerTo)
        );
      }
      // Add bullet/number via line decoration
      if (listEl.listType === 'ul') {
        decorations.push(
          Decoration.line({ class: 'cm-list-bullet', attributes: { 'data-indent': String(listEl.indent) } }).range(line.from)
        );
      } else if (listEl.listType === 'ol') {
        decorations.push(
          Decoration.line({ class: 'cm-list-number' }).range(line.from)
        );
      } else if (listEl.listType === 'task') {
        decorations.push(
          Decoration.line({ class: listEl.checked ? 'cm-list-task-checked' : 'cm-list-task-unchecked' }).range(line.from)
        );
      }
    }

    // Parse blockquote
    const blockquote = parseBlockquoteElement(lineText, line.from);
    if (blockquote) {
      const cursorInMarker = cursorPos >= blockquote.markerFrom && cursorPos <= blockquote.markerTo;
      if (!cursorInMarker) {
        decorations.push(
          Decoration.mark({ class: 'cm-hidden-marker' }).range(blockquote.markerFrom, blockquote.markerTo)
        );
      }
      decorations.push(
        Decoration.line({ class: 'cm-blockquote' }).range(line.from)
      );
    }

    // Parse inline elements
    const inlineElements = parseInlineElements(lineText, line.from);
    for (const el of inlineElements) {
      const cursorInElement = cursorPos >= el.from && cursorPos <= el.to;

      // Apply styling to content (between markers)
      const contentFrom = el.openMarker.to;
      const contentTo = el.closeMarker.from;

      if (contentFrom < contentTo) {
        if (el.type === 'bold') {
          decorations.push(
            Decoration.mark({ class: 'cm-bold' }).range(contentFrom, contentTo)
          );
        } else if (el.type === 'italic') {
          decorations.push(
            Decoration.mark({ class: 'cm-italic' }).range(contentFrom, contentTo)
          );
        } else if (el.type === 'strikethrough') {
          decorations.push(
            Decoration.mark({ class: 'cm-strikethrough' }).range(contentFrom, contentTo)
          );
        } else if (el.type === 'code') {
          decorations.push(
            Decoration.mark({ class: 'cm-inline-code' }).range(contentFrom, contentTo)
          );
        } else if (el.type === 'link') {
          decorations.push(
            Decoration.mark({
              class: 'cm-link',
              attributes: { 'data-url': el.linkUrl || '' }
            }).range(contentFrom, contentTo)
          );
        } else if (el.type === 'tag') {
          decorations.push(
            Decoration.mark({
              class: 'cm-tag-link',
              attributes: { 'data-tag': lineText.slice(el.from - line.from, el.to - line.from) }
            }).range(el.from, el.to)
          );
        }
      }

      // Hide markers unless cursor is in this element
      if (!cursorInElement && el.type !== 'tag') {
        // Hide opening marker
        if (el.openMarker.from < el.openMarker.to) {
          decorations.push(
            Decoration.mark({ class: 'cm-hidden-marker' }).range(el.openMarker.from, el.openMarker.to)
          );
        }
        // Hide closing marker
        if (el.closeMarker.from < el.closeMarker.to) {
          decorations.push(
            Decoration.mark({ class: 'cm-hidden-marker' }).range(el.closeMarker.from, el.closeMarker.to)
          );
        }
      }
    }
  }

  // Sort decorations by from position (required by CodeMirror)
  decorations.sort((a, b) => a.from - b.from);

  return Decoration.set(decorations, true);
}

// ============================================================================
// Live preview plugin
// ============================================================================

function createLivePreviewPlugin(
  onPublish?: (blogId: string, content: string) => void,
  blogs?: Array<{ id: string; name: string }>
) {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = createDecorations(view, onPublish, blogs);
      }

      update(update: ViewUpdate) {
        if (
          update.docChanged ||
          update.selectionSet ||
          update.viewportChanged
        ) {
          this.decorations = createDecorations(update.view, onPublish, blogs);
        }
      }
    },
    {
      decorations: v => v.decorations
    }
  );
}

// ============================================================================
// Editor theme with CSS classes for styling
// ============================================================================

const editorTheme = EditorView.theme({
  '&': {
    fontSize: '14px',
    height: '100%'
  },
  '.cm-content': {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif',
    padding: '40px 24px 24px 48px',
    lineHeight: '1.75'
  },
  '.cm-line': {
    padding: '2px 0'
  },
  '.cm-cursor, .cm-cursor-primary': {
    borderLeftColor: 'var(--editor-cursor) !important',
    borderLeftWidth: '2px !important'
  },
  '&.cm-focused .cm-cursor, &.cm-focused .cm-cursor-primary': {
    borderLeftColor: 'var(--editor-cursor) !important'
  },
  '.cm-cursorLayer .cm-cursor': {
    borderLeftColor: 'var(--editor-cursor) !important'
  },
  '.cm-selectionBackground': {
    backgroundColor: 'rgba(115, 115, 115, 0.3) !important'
  },
  '&.cm-focused .cm-selectionBackground': {
    backgroundColor: 'rgba(115, 115, 115, 0.3) !important'
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(0, 0, 0, 0.03)'
  },
  '.cm-scroller': {
    overflow: 'auto'
  },

  // Hidden markers - use color transparent to hide but preserve cursor position
  '.cm-hidden-marker': {
    color: 'transparent',
    fontSize: '0.01px',
    letterSpacing: '-1em',
    userSelect: 'none'
  },

  // Inline formatting styles
  '.cm-bold': {
    fontWeight: 'bold'
  },
  '.cm-italic': {
    fontStyle: 'italic'
  },
  '.cm-strikethrough': {
    textDecoration: 'line-through'
  },
  '.cm-inline-code': {
    backgroundColor: 'var(--editor-code-bg)',
    color: 'var(--text-primary)',
    padding: '0 4px',
    borderRadius: '3px',
    fontFamily: 'monospace',
    fontSize: '0.9em'
  },
  '.cm-link': {
    color: '#7c3aed',
    textDecoration: 'underline',
    cursor: 'pointer'
  },
  '.cm-tag-link': {
    color: '#7c3aed',
    cursor: 'pointer',
    textDecoration: 'underline',
    textDecorationColor: 'transparent',
    transition: 'text-decoration-color 0.15s'
  },
  '.cm-tag-link:hover': {
    textDecorationColor: '#7c3aed'
  },

  // Header styles
  '.cm-header': {
    fontWeight: '700'
  },
  '.cm-header-marker': {
    // Visible markers in incomplete headers - slightly muted
    opacity: '0.6'
  },
  '.cm-header-1': {
    fontSize: '1.75em',
    lineHeight: '1.2'
  },
  '.cm-header-2': {
    fontSize: '1.5em',
    lineHeight: '1.25'
  },
  '.cm-header-3': {
    fontSize: '1.25em',
    lineHeight: '1.3'
  },
  '.cm-header-4': {
    fontSize: '1.1em',
    lineHeight: '1.4'
  },
  '.cm-header-5': {
    fontSize: '1em',
    lineHeight: '1.4'
  },
  '.cm-header-6': {
    fontSize: '0.9em',
    lineHeight: '1.4'
  },

  // List styles
  '.cm-list-bullet::before': {
    content: '"•"',
    position: 'absolute',
    left: '24px',
    color: 'inherit'
  },
  '.cm-list-number': {
    // Numbers handled by content
  },
  '.cm-list-task-unchecked::before': {
    content: '"☐"',
    position: 'absolute',
    left: '24px'
  },
  '.cm-list-task-checked::before': {
    content: '"☑"',
    position: 'absolute',
    left: '24px'
  },

  // Blockquote
  '.cm-blockquote': {
    borderLeft: '4px solid #9ca3af',
    paddingLeft: '12px',
    fontStyle: 'italic',
    color: '#6b7280'
  },

  // Horizontal rule
  '.cm-horizontal-rule': {
    display: 'block',
    textAlign: 'center',
    overflow: 'hidden'
  },
  '.cm-horizontal-rule::before': {
    content: '""',
    display: 'inline-block',
    width: '100%',
    height: '1px',
    backgroundColor: '#d1d5db',
    verticalAlign: 'middle'
  },

  // Code block lines
  '.cm-code-block-line': {
    backgroundColor: '#f3f4f6',
    fontFamily: 'monospace',
    fontSize: '0.9em'
  }
});

// ============================================================================
// Component props and helpers
// ============================================================================

interface LiveMarkdownEditorProps {
  initialContent: string;
  filePath: string;
  onSave: (content: string) => Promise<void>;
  onTagClick?: (tag: string, newTab: boolean) => void;
  blogs?: Array<{ id: string; name: string }>;
  onPublishBlogBlock?: (blogId: string, content: string) => Promise<{ success: boolean; slug?: string }>;
}

// Helper to check if a position is inside a === blog block
function isInsideBlogBlock(doc: Text, pos: number): boolean {
  const line = doc.lineAt(pos);
  let openingFound = false;

  for (let i = line.number; i >= 1; i--) {
    const lineText = doc.line(i).text.trim();
    if (lineText === '===') {
      if (openingFound) {
        return false;
      }
      openingFound = true;
    }
  }

  if (!openingFound) return false;

  for (let i = line.number; i <= doc.lines; i++) {
    const lineText = doc.line(i).text.trim();
    if (lineText === '===' && i !== line.number) {
      return true;
    }
  }

  return true;
}

// Helper to find the blog block boundaries
function findBlogBlockBoundaries(doc: Text, pos: number): { start: number; end: number } | null {
  const line = doc.lineAt(pos);
  let startLine = -1;
  let endLine = -1;

  for (let i = line.number; i >= 1; i--) {
    const lineText = doc.line(i).text.trim();
    if (lineText === '===') {
      startLine = i;
      break;
    }
  }

  if (startLine === -1) return null;

  for (let i = line.number; i <= doc.lines; i++) {
    const lineText = doc.line(i).text.trim();
    if (lineText === '===' && i !== startLine) {
      endLine = i;
      break;
    }
  }

  if (endLine === -1) return null;

  return { start: startLine, end: endLine };
}

// ============================================================================
// Main component
// ============================================================================

export const LiveMarkdownEditor: React.FC<LiveMarkdownEditorProps> = ({
  initialContent,
  filePath,
  onSave,
  onTagClick,
  blogs = [],
  onPublishBlogBlock
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const contentRef = useRef(initialContent);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastInitialContentRef = useRef(initialContent);

  const blogsRef = useRef(blogs);
  blogsRef.current = blogs;

  // Generate blog block template
  const getBlogBlockTemplate = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return `---
blog: ""
title: ""
description: ""
publishDate: "${today}"
tags: [""]
---
`;
  }, []);

  // Blog autocomplete source
  const blogCompletionSource = useCallback((context: CompletionContext) => {
    const line = context.state.doc.lineAt(context.pos);
    const lineText = line.text;

    const blogMatch = lineText.match(/^blog:\s*"([^"]*)"?/);
    if (!blogMatch) return null;

    const firstQuoteIndex = lineText.indexOf('"');
    const lastQuoteIndex = lineText.lastIndexOf('"');
    const cursorInLine = context.pos - line.from;

    if (cursorInLine <= firstQuoteIndex || (lastQuoteIndex > firstQuoteIndex && cursorInLine > lastQuoteIndex)) {
      return null;
    }

    if (!isInsideBlogBlock(context.state.doc, context.pos)) return null;

    const from = line.from + firstQuoteIndex + 1;
    const to = context.pos;

    const options: Completion[] = blogsRef.current.map(blog => ({
      label: blog.name,
      type: 'text',
      apply: blog.name,
      detail: 'blog'
    }));

    if (options.length === 0) {
      return null;
    }

    return {
      from,
      to,
      options,
      validFor: /^[^"]*$/
    };
  }, []);

  // Debounced save
  const scheduleSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(() => {
      if (viewRef.current) {
        const content = viewRef.current.state.doc.toString();
        if (content !== contentRef.current) {
          contentRef.current = content;
          onSave(content);
        }
      }
    }, 2000);
  }, [onSave]);

  // Initialize editor
  useEffect(() => {
    if (!containerRef.current) return;

    const saveKeymap = keymap.of([
      {
        key: 'Mod-s',
        run: () => {
          if (viewRef.current) {
            const content = viewRef.current.state.doc.toString();
            if (content !== contentRef.current) {
              contentRef.current = content;
              onSave(content);
            }
          }
          return true;
        }
      }
    ]);

    // Tab key handler for smart navigation in frontmatter
    const tabKeymap = keymap.of([
      {
        key: 'Tab',
        run: (view) => {
          const pos = view.state.selection.main.head;
          const doc = view.state.doc;

          if (!isInsideBlogBlock(doc, pos)) {
            return false;
          }

          const line = doc.lineAt(pos);
          const lineText = line.text;

          const boundaries = findBlogBlockBoundaries(doc, pos);
          if (!boundaries) return false;

          let blogLine = -1, titleLine = -1, descLine = -1, tagsLine = -1, closingDashLine = -1;
          for (let i = boundaries.start + 1; i < boundaries.end; i++) {
            const text = doc.line(i).text;
            if (text.startsWith('blog:')) blogLine = i;
            else if (text.startsWith('title:')) titleLine = i;
            else if (text.startsWith('description:')) descLine = i;
            else if (text.startsWith('tags:')) tagsLine = i;
            else if (text.trim() === '---' && i > boundaries.start + 1) closingDashLine = i;
          }

          let targetLine = -1;
          if (lineText.startsWith('blog:')) {
            targetLine = titleLine;
          } else if (lineText.startsWith('title:')) {
            targetLine = descLine;
          } else if (lineText.startsWith('description:')) {
            targetLine = tagsLine;
          } else if (lineText.startsWith('tags:')) {
            if (closingDashLine !== -1 && closingDashLine + 1 <= doc.lines) {
              const afterClosing = doc.line(closingDashLine + 1);
              view.dispatch({
                selection: { anchor: afterClosing.from }
              });
              return true;
            }
            return false;
          }

          if (targetLine !== -1) {
            const targetLineObj = doc.line(targetLine);
            const targetText = targetLineObj.text;
            const quoteStart = targetText.indexOf('"');
            const quoteEnd = targetText.lastIndexOf('"');
            if (quoteStart !== -1 && quoteEnd > quoteStart) {
              const cursorPos = targetLineObj.from + quoteStart + 1;
              view.dispatch({
                selection: { anchor: cursorPos }
              });
              return true;
            }
          }

          return false;
        }
      }
    ]);

    // Keymap to detect === + Enter and insert template
    const blogBlockKeymap = keymap.of([
      {
        key: 'Enter',
        run: (view) => {
          const pos = view.state.selection.main.head;
          const doc = view.state.doc;
          const line = doc.lineAt(pos);
          const lineText = line.text.trim();

          if (lineText === '===') {
            const template = getBlogBlockTemplate();
            const insertPos = line.to;

            const fullInsert = '\n' + template + '===';
            const blogFieldOffset = template.indexOf('blog: "') + 7;

            view.dispatch({
              changes: { from: insertPos, to: insertPos, insert: fullInsert },
              selection: { anchor: insertPos + 1 + blogFieldOffset }
            });

            return true;
          }
          return false;
        }
      }
    ]);

    const updateListener = EditorView.updateListener.of(update => {
      if (update.docChanged) {
        scheduleSave();
      }
      if (update.selectionSet) {
        const pos = update.state.selection.main.head;
        const line = update.state.doc.lineAt(pos);

        const lineText = line.text;
        if (lineText.match(/^blog:\s*"/) && isInsideBlogBlock(update.state.doc, pos)) {
          setTimeout(() => {
            startCompletion(update.view);
          }, 50);
        }
      }
    });

    const state = EditorState.create({
      doc: initialContent,
      extensions: [
        cursorPositionField,
        drawSelection({ cursorBlinkRate: 0 }), // Disable cursor blink to prevent disappearing
        history(),
        blogBlockKeymap,
        tabKeymap,
        keymap.of([...defaultKeymap, ...historyKeymap]),
        saveKeymap,
        markdown(),
        autocompletion({
          override: [blogCompletionSource],
          activateOnTyping: true,
          defaultKeymap: true
        }),
        createLivePreviewPlugin(onPublishBlogBlock, blogs),
        editorTheme,
        updateListener,
        EditorView.lineWrapping
      ]
    });

    const view = new EditorView({
      state,
      parent: containerRef.current
    });

    viewRef.current = view;
    contentRef.current = initialContent;

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      view.destroy();
    };
  }, [getBlogBlockTemplate, blogCompletionSource, onPublishBlogBlock, blogs]);

  // Update content when file changes externally
  useEffect(() => {
    if (initialContent !== lastInitialContentRef.current) {
      lastInitialContentRef.current = initialContent;

      if (viewRef.current) {
        const currentContent = viewRef.current.state.doc.toString();
        if (currentContent !== initialContent) {
          viewRef.current.dispatch({
            changes: {
              from: 0,
              to: viewRef.current.state.doc.length,
              insert: initialContent
            }
          });
          contentRef.current = initialContent;
        }
      }
    }
  }, [initialContent, filePath]);

  // Listen for publish button clicks from widget
  useEffect(() => {
    const handlePublishClick = async (e: Event) => {
      const customEvent = e as CustomEvent<{ blockLine: number }>;
      const { blockLine } = customEvent.detail;

      if (!viewRef.current || !onPublishBlogBlock) {
        return;
      }

      const doc = viewRef.current.state.doc;

      const line = doc.line(blockLine);
      const boundaries = findBlogBlockBoundaries(doc, line.from);
      if (!boundaries) {
        alert('Could not find blog block boundaries');
        return;
      }

      let blockContent = '';
      let blogName = '';

      for (let j = boundaries.start + 1; j < boundaries.end; j++) {
        const blockLineText = doc.line(j).text;
        const blogMatch = blockLineText.match(/^blog:\s*"([^"]*)"/);
        if (blogMatch) {
          blogName = blogMatch[1];
        }

        if (!blogMatch && !blockLineText.match(/^published:/)) {
          blockContent += blockLineText + '\n';
        }
      }

      if (!blogName) {
        alert('No blog specified in the blog block. Please fill in the blog field.');
        return;
      }

      const blog = blogsRef.current.find(b => b.name === blogName);
      if (!blog) {
        alert(`Blog "${blogName}" not found in settings. Please check your blog configuration.`);
        return;
      }

      const result = await onPublishBlogBlock(blog.id, blockContent.trim());

      if (result.success && viewRef.current) {
        const freshDoc = viewRef.current.state.doc;
        const freshBoundaries = findBlogBlockBoundaries(freshDoc, freshDoc.line(blockLine).from);

        if (freshBoundaries) {
          let freshClosingDashLine = -1;
          let existingSlugLine = -1;
          let existingPublishedLine = -1;
          let dashCount = 0;

          for (let j = freshBoundaries.start + 1; j < freshBoundaries.end; j++) {
            const lineText = freshDoc.line(j).text.trim();
            if (lineText === '---') {
              dashCount++;
              if (dashCount === 2) {
                freshClosingDashLine = j;
                break;
              }
            }
            if (lineText.startsWith('slug:')) {
              existingSlugLine = j;
            }
            if (lineText.startsWith('published:')) {
              existingPublishedLine = j;
            }
          }

          if (freshClosingDashLine !== -1) {
            const changes: Array<{ from: number; to: number; insert: string }> = [];

            // Update or add slug
            if (result.slug) {
              if (existingSlugLine !== -1) {
                // Update existing slug line
                const slugLine = freshDoc.line(existingSlugLine);
                changes.push({
                  from: slugLine.from,
                  to: slugLine.to,
                  insert: `slug: "${result.slug}"`
                });
              } else {
                // Add new slug line before closing ---
                const closingLine = freshDoc.line(freshClosingDashLine);
                changes.push({
                  from: closingLine.from,
                  to: closingLine.from,
                  insert: `slug: "${result.slug}"\n`
                });
              }
            }

            // Update or add published: true
            if (existingPublishedLine !== -1) {
              // Update existing published line
              const pubLine = freshDoc.line(existingPublishedLine);
              changes.push({
                from: pubLine.from,
                to: pubLine.to,
                insert: 'published: true'
              });
            } else {
              // Add new published line before closing ---
              // Need to recalculate position after slug insertion
              const closingLine = freshDoc.line(freshClosingDashLine);
              const offset = result.slug && existingSlugLine === -1 ? `slug: "${result.slug}"\n`.length : 0;
              changes.push({
                from: closingLine.from + offset,
                to: closingLine.from + offset,
                insert: 'published: true\n'
              });
            }

            // Apply all changes at once, sorted by position (descending to avoid offset issues)
            changes.sort((a, b) => b.from - a.from);
            for (const change of changes) {
              viewRef.current.dispatch({
                changes: change
              });
            }

            contentRef.current = viewRef.current.state.doc.toString();

            const newContent = viewRef.current.state.doc.toString();
            onSave(newContent);
          }
        }
      }
    };

    window.addEventListener('blog-publish-click', handlePublishClick);
    return () => {
      window.removeEventListener('blog-publish-click', handlePublishClick);
    };
  }, [onPublishBlogBlock, scheduleSave]);

  // Handle clicks on tags and links
  const handleClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    // Handle tag clicks
    if (target.classList.contains('cm-tag-link')) {
      e.preventDefault();
      e.stopPropagation();
      const tag = target.dataset.tag;
      if (tag && onTagClick) {
        const newTab = e.metaKey || e.ctrlKey;
        onTagClick(tag, newTab);
      }
    }

    // Handle link clicks
    if (target.classList.contains('cm-link')) {
      const url = target.dataset.url;
      if (url && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        e.stopPropagation();
        window.open(url, '_blank');
      }
    }
  }, [onTagClick]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-hidden"
      style={{ backgroundColor: 'var(--bg-primary)' }}
      onClick={handleClick}
    />
  );
};
