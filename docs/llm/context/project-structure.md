# Project Structure

## Top-Level Layout

```
olite/
├── src/
│   ├── main/              # Electron main process
│   │   ├── index.ts       # Main process entry point
│   │   ├── ipc/           # IPC handlers
│   │   └── vault/         # Vault management logic
│   ├── renderer/          # Electron renderer process (React app)
│   │   ├── components/    # React components
│   │   ├── features/      # Feature-specific modules
│   │   │   ├── editor/    # Markdown editor
│   │   │   ├── sidebar/   # File tree sidebar
│   │   │   ├── tags/      # Tag view system
│   │   │   └── publish/   # Blog publishing
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and helpers
│   │   ├── styles/        # Global styles and Tailwind
│   │   └── index.tsx      # Renderer entry point
│   └── preload/           # Electron preload scripts
│       └── index.ts       # Preload script for IPC bridge
├── tests/
│   ├── unit/              # Unit tests (Vitest)
│   └── e2e/               # E2E tests (Playwright)
├── public/                # Static assets
├── docs/                  # Documentation
│   └── llm/               # LLM context and guidelines
└── dist/                  # Build output
```

## Key Directories

### `/src/main` - Electron Main Process
- Window management
- File system operations (reading/writing notes)
- IPC message handling
- Menu bar and system tray
- Vault initialization and management

### `/src/renderer` - React Application
- All UI components and views
- Markdown editor with live preview
- File tree sidebar with folders
- Tag-based view generation
- Publishing UI and progress tracking

### `/src/preload` - Bridge Layer
- Exposes safe APIs from main process to renderer
- Type-safe IPC communication
- No direct Node.js access in renderer

## Naming Conventions

- **Components:** PascalCase (`NoteEditor.tsx`, `FileTree.tsx`)
- **Hooks:** camelCase starting with `use` (`useVault.ts`, `useTagView.ts`)
- **Utilities:** camelCase (`parseMarkdown.ts`, `extractTags.ts`)
- **Tests:** mirror source with `.test.ts` or `.spec.ts` suffix

## Data Organization

### Vault Structure
```
vault/
├── daily-notes/           # Auto-generated daily notes
│   └── YYYY-MM-DD.md
├── notes/                 # User-created notes
└── .olite/                # App metadata
    ├── tags.json          # Tag index
    └── config.json        # User preferences
```

## Build & Package

- `npm run dev` - Development mode with HMR
- `npm run build` - Production build
- `npm run package` - Create macOS app bundle
- Environment configuration in `.env` files
