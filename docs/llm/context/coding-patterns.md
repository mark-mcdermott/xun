# Coding Patterns

## Functional Composition

- Prefer pure, small functions.
- Extract shared logic into utilities or custom hooks.
- Compose behavior with React hooks and context, not inheritance.

## React Patterns

- Function components only (no class components).
- Co-locate state and side effects with components.
- Keep state minimal and derive from props where possible.
- Use `useReducer` for complex state management.
- Lift state only when necessary for sharing between components.

## Hooks

- Prefix all hooks with `use` (e.g., `useVault`, `useTagExtractor`).
- Return plain data and actions, not complex objects.
- Ensure effects declare all dependencies correctly.
- Custom hooks should encapsulate reusable logic (file operations, tag parsing, etc.).

## Electron IPC Patterns

- **Main Process**: Handle all file system operations, vault management, and system APIs.
- **Preload Script**: Expose type-safe APIs via `contextBridge.exposeInMainWorld()`.
- **Renderer Process**: Use exposed APIs only, no direct Node.js or Electron imports.
- IPC channels should be well-typed with TypeScript interfaces.
- Use async/await pattern for IPC communication.

## File System Patterns

- All file operations happen in the main process.
- Use Node.js `fs/promises` for async file operations.
- Implement file watchers for detecting external changes to vault.
- Cache file metadata to avoid excessive disk reads.

## State Management

- Local component state → `useState` or `useReducer`.
- Shared app state → React Context API.
- Vault data → IPC calls to main process.
- Tag index → Computed from file contents, cached in memory.

## Error Handling

- Use try/catch blocks for async operations (file I/O, IPC).
- Display user-friendly error messages in UI.
- Log detailed errors to console for debugging.
- Handle file not found, permission errors, and disk full scenarios.

## Async Patterns

- Prefer async/await over promises.
- Wrap loading and error states in custom hooks.
- Use AbortController for cancellable operations (search, file reads).

## Markdown Processing

- Parse markdown in main process for heavy operations.
- Extract tags using regex patterns (`#tag-name`).
- Support content sections delimited by `---` separator.
- Render markdown in renderer process using chosen library.

## Tag System

- Tags are case-sensitive (or normalized to lowercase - TBD).
- Tag format: `#project-name` (alphanumeric and hyphens).
- Auto-generate tag views by aggregating content from daily notes.
- Tag views are read-only (computed from source notes).
- Maintain tag index for fast lookups.

## Publishing System

- Publishing runs as background tasks with progress tracking.
- Use GitHub API to commit and push to blog repositories.
- Poll for GitHub Actions status to detect publish completion.
- Show progress indicator in UI (top-right corner).
- Support multiple blog targets with different configurations.
