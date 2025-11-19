# Olite

> A lightweight desktop note-taking app for macOS, inspired by Obsidian.

## What is Olite?

Olite (Obsidian Lite) is a streamlined note-taking and journaling application designed for a specific workflow:
- Daily notes with automatic date-based creation
- Tag-based content organization (`#project-a`, `#personal`, etc.)
- Auto-generated tag views that aggregate all content by tag
- Integrated blog publishing to GitHub/Vercel
- Clean, Obsidian-inspired UI with split panes and tabs

This is a personal tool built for a single user, focusing on simplicity and maintainability.

## Features

### Core Features
- Daily notes (auto-created with YYYY-MM-DD format)
- Tag-based content sections (delimited by `---`)
- Tag views (read-only aggregated content pages)
- File tree sidebar with right-click context menus
- Markdown editor with live rendering
- Split pane support for viewing multiple notes

### Publishing System
- Publish tagged content to multiple blog targets
- GitHub integration for commits and deploys
- Progress tracking for async publish operations
- Support for Astro, Next.js, and other static sites on Vercel

### Future Features
- Custom emoji support
- Content deletion by tag (for job separation)

## Tech Stack

- **Electron 33** - Desktop app framework
- **React 18+** - UI library
- **Vite 5** - Build tool and dev server
- **TypeScript 5** - Type safety
- **Tailwind CSS** - Styling
- **Vitest** - Unit testing
- **Playwright** - E2E testing

## Project Structure

```
olite/
├── src/
│   ├── main/              # Electron main process
│   ├── renderer/          # React UI
│   └── preload/           # IPC bridge
├── tests/
│   ├── unit/              # Unit tests
│   └── e2e/               # E2E tests
├── docs/llm/              # AI assistant context
└── dist/                  # Build output
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build

# Package for macOS
npm run package
```

## AI Assistant Integration

This project includes comprehensive LLM documentation in `docs/llm/` for AI coding assistants like Claude Code, GitHub Copilot, and Cursor.

Entry points:
- `CLAUDE.md` - Claude Code
- `AGENTS.md` - GitHub Copilot

These files provide context about the project architecture, coding standards, and development workflows.

## License

Private project - not open source.

## Status

Currently in initial development phase. The first step is updating all LLM documentation to match this project.
