---
description: JavaScript/TypeScript and React coding standards for Electron apps
alwaysApply: false
---
# JavaScript and TypeScript Guidelines

## Purpose
Defines JavaScript/TypeScript coding standards, React patterns, and Electron-specific best practices for Olite.

## Application Context

Olite is an Electron desktop application using:
- TypeScript with strict mode
- React 18+ with functional components only
- Electron IPC for main/renderer communication
- Vite for bundling and hot reload

## TypeScript Standards

### Type Safety
- **JS.TS-1 (MUST)**: Enable strict mode in `tsconfig.json`
- **JS.TS-2 (MUST)**: Define interfaces for all IPC message types
- **JS.TS-3 (SHOULD)**: Use explicit return types for functions
- **JS.TS-4 (SHOULD)**: Avoid `any` type; use `unknown` when type is truly unknown
- **JS.TS-5 (MUST)**: Define types for all React component props

### Variable Declaration
- **JS.VAR-1 (MUST)**: Use `const` by default; use `let` only when reassignment needed
- **JS.VAR-2 (MUST NOT)**: Use `var`

## React Patterns

### Component Structure
- **JS.REACT-1 (MUST)**: Use functional components only (no class components)
- **JS.REACT-2 (MUST)**: Use hooks for state and effects
- **JS.REACT-3 (SHOULD)**: Keep components small and focused (< 200 lines)
- **JS.REACT-4 (SHOULD)**: Extract complex logic into custom hooks

### Hooks
- **JS.HOOK-1 (MUST)**: Prefix all custom hooks with `use`
- **JS.HOOK-2 (MUST)**: Declare all dependencies in useEffect/useMemo/useCallback
- **JS.HOOK-3 (SHOULD)**: Extract reusable logic into custom hooks
- **JS.HOOK-4 (SHOULD)**: Return objects with named properties from hooks, not arrays (except for simple cases like useState)

### Props and State
- **JS.PROPS-1 (MUST)**: Define prop interfaces for all components
- **JS.PROPS-2 (SHOULD)**: Use destructuring for props
- **JS.PROPS-3 (SHOULD)**: Keep state minimal; derive values when possible
- **JS.PROPS-4 (SHOULD)**: Lift state only when necessary for sharing

## Electron Patterns

### IPC Communication
- **JS.IPC-1 (MUST)**: All IPC channels must be defined in preload script
- **JS.IPC-2 (MUST)**: Use `contextBridge.exposeInMainWorld()` to expose APIs
- **JS.IPC-3 (MUST)**: Never import Node.js or Electron directly in renderer
- **JS.IPC-4 (MUST)**: Use typed interfaces for IPC request/response messages
- **JS.IPC-5 (SHOULD)**: Use async/await pattern for IPC calls

### Main Process
- **JS.MAIN-1 (MUST)**: Handle all file system operations in main process
- **JS.MAIN-2 (SHOULD)**: Use `fs/promises` for async file operations
- **JS.MAIN-3 (MUST)**: Validate all IPC inputs from renderer
- **JS.MAIN-4 (SHOULD)**: Use worker threads for CPU-intensive operations

### Security
- **JS.SEC-1 (MUST)**: Enable context isolation in BrowserWindow
- **JS.SEC-2 (MUST)**: Disable nodeIntegration in renderer
- **JS.SEC-3 (MUST)**: Sanitize all user input before file operations
- **JS.SEC-4 (MUST)**: Validate file paths to prevent directory traversal

## File Organization

See @docs/llm/context/project-structure.md for directory structure.

JavaScript-specific organization:
- **JS.ORG-1 (MUST)**: Place React components in `src/renderer/components/`
- **JS.ORG-2 (MUST)**: Place feature modules in `src/renderer/features/`
- **JS.ORG-3 (MUST)**: Place custom hooks in `src/renderer/hooks/`
- **JS.ORG-4 (MUST)**: Place utilities in `src/renderer/lib/`
- **JS.ORG-5 (MUST)**: Place main process code in `src/main/`

### File Naming
- **JS.NAME-1 (MUST)**: Use PascalCase for component files (`NoteEditor.tsx`)
- **JS.NAME-2 (MUST)**: Use camelCase for utility files (`parseMarkdown.ts`)
- **JS.NAME-3 (MUST)**: Use camelCase with `use` prefix for hooks (`useVault.ts`)

## Async Patterns

### Error Handling
- **JS.ASYNC-1 (MUST)**: Use try/catch for all async operations
- **JS.ASYNC-2 (SHOULD)**: Display user-friendly error messages in UI
- **JS.ASYNC-3 (MUST)**: Log detailed errors to console
- **JS.ASYNC-4 (SHOULD)**: Use AbortController for cancellable operations

### Promises
- **JS.PROM-1 (SHOULD)**: Prefer async/await over raw promises
- **JS.PROM-2 (MUST NOT)**: Leave promises unhandled
- **JS.PROM-3 (SHOULD)**: Use Promise.all() for parallel operations

## Testing Standards

See @docs/llm/context/testing-strategy.md for test organization.
See @docs/llm/rules/testing.md for testing quality standards.

JavaScript-specific testing:
- **JS.TEST-1 (MUST)**: Write unit tests for utilities and hooks
- **JS.TEST-2 (SHOULD)**: Write component tests for React components
- **JS.TEST-3 (MUST)**: Mock IPC calls in renderer tests
- **JS.TEST-4 (SHOULD)**: Mock file system in main process tests
- **JS.TEST-5 (SHOULD)**: Use Playwright for E2E Electron app testing

## Code Quality

### Linting
- **JS.LINT-1 (MUST)**: ESLint must pass with zero errors
- **JS.LINT-2 (MUST)**: Prettier must pass (consistent formatting)
- **JS.LINT-3 (MUST)**: TypeScript compiler must pass with zero errors
- **JS.LINT-4 (SHOULD)**: Fix all ESLint warnings

### Code Style
- **JS.STYLE-1 (MUST)**: Use 2-space indentation
- **JS.STYLE-2 (SHOULD)**: Limit line length to 100 characters
- **JS.STYLE-3 (MUST)**: Use semicolons
- **JS.STYLE-4 (SHOULD)**: Use single quotes for strings (unless interpolating)

## Performance

### React Performance
- **JS.PERF-1 (SHOULD)**: Use React.memo() for expensive components
- **JS.PERF-2 (SHOULD)**: Use useMemo() for expensive computations
- **JS.PERF-3 (SHOULD)**: Use useCallback() for functions passed to optimized children
- **JS.PERF-4 (SHOULD NOT)**: Optimize prematurely; measure first

### File Operations
- **JS.PERF-5 (SHOULD)**: Cache file metadata to avoid excessive disk reads
- **JS.PERF-6 (SHOULD)**: Use file watchers instead of polling
- **JS.PERF-7 (SHOULD)**: Debounce file write operations

## Markdown Processing

### Tag Extraction
- **JS.MD-1 (MUST)**: Extract tags using regex pattern `/^#[a-zA-Z0-9-]+$/`
- **JS.MD-2 (MUST)**: Support content sections delimited by `---`
- **JS.MD-3 (SHOULD)**: Process markdown parsing in main process for large files

### Rendering
- **JS.MD-4 (SHOULD)**: Render markdown incrementally for large documents
- **JS.MD-5 (MUST)**: Sanitize HTML output to prevent XSS
