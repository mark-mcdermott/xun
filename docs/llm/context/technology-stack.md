# Technology Stack

## Runtime Versions

- Node.js 22 (LTS)
- npm (package manager)
- TypeScript 5 (strict mode enabled)
- Electron 33 (desktop application framework)

## Desktop Framework

- Electron 33 (main process + renderer processes)
- Vite 5 (build tool and dev server)
- React 18+ (UI library)
- Electron Builder (packaging and distribution)

## UI and Styling

- React (functional components only)
- Tailwind CSS (utility-first styling)
- shadcn/ui (optional UI component library)
- Markdown rendering library (TBD - likely marked or remark)
- Syntax highlighting for code blocks (TBD)

## Data Storage

- Local filesystem for vault storage (markdown files)
- SQLite or JSON files for metadata (notes index, tags, etc.)
- No remote database - fully local application

## Testing & Quality

- Vitest for unit and component tests
- Playwright for E2E testing (Electron app testing)
- ESLint + Prettier for linting and formatting
- TypeScript type checker in CI

## Publishing Integration

- GitHub API for posting to blog repositories
- Vercel API (if needed for deployment triggers)
- Progress tracking for async publish operations
- Support for multiple blog targets (Astro sites, Next.js, etc.)

## Development Tools

- Hot Module Replacement (HMR) via Vite
- DevTools in Electron renderer
- File watching for vault changes
