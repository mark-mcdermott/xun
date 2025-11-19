# Testing Strategy

## File Organization

- **Unit Tests:** `tests/unit/**/*.test.ts` or co-located `src/**/*.test.ts(x)` (Vitest)
- **E2E Tests:** `tests/e2e/**/*.spec.ts` (Playwright for Electron)

## Test Types

| Type        | Tools              | Purpose                                  |
| ----------- | ------------------ | ---------------------------------------- |
| Unit        | Vitest             | Pure functions, utilities, React hooks   |
| Component   | Vitest + React RTL | React component behavior                 |
| E2E         | Playwright         | Full Electron app user flows             |

## Electron-Specific Testing

### Main Process Testing
- Test file system operations (vault reading/writing)
- Test IPC handlers
- Mock file system when appropriate
- Test vault initialization and structure

### Renderer Process Testing
- Test React components in isolation
- Test hooks that use IPC (mock IPC calls)
- Test markdown rendering
- Test tag extraction and parsing

### E2E Testing with Playwright
- Launch actual Electron app in test mode
- Test full user workflows:
  - Creating daily notes
  - Writing content with tags
  - Viewing tag-based pages
  - Publishing to blogs (mock GitHub API)
- Test file tree navigation
- Test markdown editor interactions

## Principles

- Write tests for critical paths first (note creation, tag system, publishing).
- Test behavior, not implementation details.
- Mock external systems (GitHub API, file system where appropriate).
- Keep tests fast and deterministic.
- Avoid testing third-party libraries (Electron, React, markdown parsers).

## Coverage & CI

- Run unit tests on every commit.
- Run E2E tests on pull requests.
- Target coverage: 80%+ for critical features (vault, tags, publishing).
- Upload Playwright traces on failures for debugging.
- Use GitHub Actions for CI pipeline.

## Testing Patterns

### File System Operations
```typescript
// Mock fs/promises in tests
vi.mock('fs/promises')
```

### IPC Communication
```typescript
// Mock IPC in renderer tests
const mockIpcRenderer = {
  invoke: vi.fn(),
}
```

### Markdown Parsing
```typescript
// Test tag extraction
expect(extractTags('# Heading\n#project-a\nContent')).toEqual(['project-a'])
```

## Test Data

- Use fixture files for markdown examples
- Create test vaults in temporary directories
- Clean up test data after each test run
