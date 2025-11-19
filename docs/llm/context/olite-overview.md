# Olite Project Overview

## What is Olite?

Olite is a lightweight desktop note-taking and journaling application for macOS, inspired by Obsidian but streamlined for a specific personal workflow. It's designed for a single user and emphasizes simplicity, clean code, and maintainability.

## Core Features

### 1. Daily Notes
- Automatically create daily notes (YYYY-MM-DD.md format)
- Open today's note by default when app launches
- Store daily notes in a dedicated folder

### 2. Tag-Based Content Organization
- Write content with inline tags (e.g., `#project-a`)
- Content sections are delimited by `---` separators
- Each tag automatically generates a "view" page
- Tag views aggregate all content ever written with that tag, in chronological order
- Tag views are read-only (computed from source notes)

Example daily note:
```markdown
# 2025-11-19

#project-a
Working on the authentication flow for the new feature.
Added OAuth integration.
---

#personal
Thinking about the weekend plans.
---
```

### 3. Obsidian-Inspired UI
- Left sidebar: Foldable tree structure for vault navigation
- Right-click menus for creating new notes/folders
- Center area: Tabbed interface with note name at top
- Back arrow and breadcrumbs for navigation
- Markdown editor with live rendering (like Obsidian)
- Split panes: View multiple documents simultaneously

### 4. Blog Publishing Integration
- Write in daily notes or separate notes under specific tags
- Right-click tag views to publish content
- Menu options: "Publish to Blog A", "Publish to Blog B", etc.
- Progress indicator (top-right corner) during publishing
- Publishes to GitHub repositories
- Monitors GitHub Actions for deployment status
- Multiple blog targets with different configurations:
  - Astro sites
  - Next.js sites
  - Other static site generators
  - All hosted on Vercel with Neon Postgres (some)

### 5. Content Separation for Job Changes
- Ability to delete all content for a specific tag
- Useful for maintaining strict separation between work and personal content
- Ensures clean exit from job without taking proprietary notes

### 6. Future Features
- Custom emoji support (to be built later)
- Library for custom emojis that syncs with published blogs

## Technical Architecture

### Electron App Structure
- **Main Process**: File system operations, vault management, window management
- **Renderer Process**: React UI, markdown rendering, user interactions
- **Preload Scripts**: Safe IPC bridge between main and renderer

### Data Storage
- Local vault directory (user-selected, default: `~/Documents/OliteVault`)
- Markdown files for all notes
- JSON/SQLite for metadata (tags index, app config)
- No cloud sync (fully local)

### Tag System Implementation
- Parse markdown files to extract tags
- Build tag index mapping tags to content locations
- Generate tag views on-demand from aggregated content
- Cache tag index for performance

### Publishing System
- GitHub API integration for commits and pushes
- GitHub Actions status polling
- Background task management with UI progress indicators
- Per-blog configuration (repo, branch, path, deployment settings)

## Design Philosophy

1. **Simplicity**: Only include features that are actually used
2. **Personal Tool**: Optimized for one user's workflow, not general purpose
3. **Clean Code**: Maintainable, well-tested, easy to modify
4. **Performance**: Fast startup, instant search, responsive UI
5. **Privacy**: All data stays local, no telemetry or cloud services

## Non-Features (Deliberately Excluded)

- Cloud sync (use Git or file sync if needed)
- Collaboration features
- Plugin system
- Graph view
- Advanced search (start simple)
- Mobile apps
- Cross-platform (macOS only to start)

## Development Priorities

1. Core functionality: Daily notes + tag system
2. File tree sidebar + markdown editor
3. Tag views + content aggregation
4. Publishing system
5. Polish and performance optimization
6. Custom emoji (later phase)
