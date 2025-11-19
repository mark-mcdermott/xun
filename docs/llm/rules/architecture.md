---
description: Design patterns, principles, and function quality standards for building maintainable code
alwaysApply: false
---
# Architecture Guidelines

## Purpose
Defines architectural patterns, design principles, and structural decisions for building maintainable, testable code in Olite.

## Core Principles
- **MUST** rules are enforced by linting/CI; **SHOULD** rules are strongly recommended.
- Terms "function" and "method" are used interchangeably.

## Design Patterns

### Module Organization
- **ARCH.MOD-1 (SHOULD)**: Organize code by feature/domain, not by type
- **ARCH.MOD-2 (SHOULD)**: Keep related functionality together (colocation)
- **ARCH.MOD-3 (SHOULD)**: Use clear boundaries between main process, renderer, and preload

### Utility Functions
- **ARCH.UTIL-1 (SHOULD)**: Extract pure functions for reusable logic
- **ARCH.UTIL-2 (SHOULD)**: Keep utilities stateless and deterministic
- **ARCH.UTIL-3 (SHOULD)**: Place utilities in `src/renderer/lib/` or `src/main/utils/`

### Custom Hooks (React)
- **ARCH.HOOK-1 (SHOULD)**: Encapsulate stateful logic in custom hooks
- **ARCH.HOOK-2 (MUST)**: Prefix all hooks with `use`
- **ARCH.HOOK-3 (SHOULD)**: Keep hooks focused on single responsibility

### Error Handling
- **ARCH.ERR-1 (SHOULD)**: Create custom error classes for domain-specific errors
- **ARCH.ERR-2 (MUST)**: Handle all async errors with try/catch
- **ARCH.ERR-3 (SHOULD)**: Display user-friendly error messages in UI

## Design Principles

### Single Responsibility
- **ARCH.SRP-1 (SHOULD)**: Functions and modules should have one clear purpose
- **ARCH.SRP-2 (SHOULD)**: Components should do one thing well

### Separation of Concerns
- **ARCH.SOC-1 (MUST)**: Keep business logic out of UI components
- **ARCH.SOC-2 (MUST)**: Handle all file I/O in main process, not renderer
- **ARCH.SOC-3 (SHOULD)**: Separate data fetching from presentation

### Composition Over Inheritance
- **ARCH.COMP-1 (SHOULD)**: Use hooks and functions for shared behavior
- **ARCH.COMP-2 (SHOULD NOT)**: Use class inheritance for code reuse
- **ARCH.COMP-3 (SHOULD)**: Compose small functions to build complex behavior

### Immutability
- **ARCH.IMMUT-1 (SHOULD)**: Prefer immutable data structures
- **ARCH.IMMUT-2 (SHOULD)**: Use spread operators or methods like `map()` instead of mutation

### Pattern Consistency
- **ARCH.PATTERN-1 (SHOULD)**: Follow existing patterns in the codebase before creating new ones
- **ARCH.PATTERN-2 (SHOULD)**: Use consistent naming conventions throughout

## Code Organization

### Naming and Vocabulary
- **ARCH.NAME-1 (MUST)**: Use clear, descriptive names that match domain vocabulary
- **ARCH.NAME-2 (SHOULD)**: Avoid abbreviations unless widely understood
- **ARCH.NAME-3 (SHOULD)**: Use verb-noun pairs for function names (`parseMarkdown`, `extractTags`)

### Function Design
- **ARCH.FUNC-1 (SHOULD)**: Prefer small, composable, testable functions
- **ARCH.FUNC-2 (SHOULD)**: Keep functions under 50 lines when possible
- **ARCH.FUNC-3 (SHOULD NOT)**: Extract a new function unless:
  - It will be reused elsewhere
  - It's the only way to unit-test otherwise untestable logic
  - It drastically improves readability

### Comments and Documentation
- **ARCH.DOC-1 (SHOULD NOT)**: Add comments except for critical caveats or complex algorithms
- **ARCH.DOC-2 (SHOULD)**: Rely on self-explanatory code with good naming
- **ARCH.DOC-3 (SHOULD)**: Document complex IPC message schemas with JSDoc

## Function Quality Checklist

When evaluating function quality, check:

1. **ARCH.Q-1 (SHOULD)**: Ensure functions are readable and easy to follow
2. **ARCH.Q-2 (SHOULD)**: Avoid high cyclomatic complexity (excessive branching)
3. **ARCH.Q-3 (SHOULD)**: Use appropriate data structures to improve clarity
4. **ARCH.Q-4 (MUST NOT)**: Include unused parameters in function signatures
5. **ARCH.Q-5 (SHOULD NOT)**: Hide dependencies; pass them as arguments
6. **ARCH.Q-6 (MUST)**: Use descriptive function names consistent with domain vocabulary

## Electron-Specific Architecture

### Main Process
- **ARCH.MAIN-1 (MUST)**: Handle all file system operations in main process
- **ARCH.MAIN-2 (SHOULD)**: Keep window management logic in main process
- **ARCH.MAIN-3 (SHOULD)**: Use IPC handlers for renderer communication

### Renderer Process
- **ARCH.RENDER-1 (MUST)**: Keep all UI logic in renderer process
- **ARCH.RENDER-2 (MUST NOT)**: Import Node.js or Electron APIs directly
- **ARCH.RENDER-3 (MUST)**: Use preload APIs for all system interactions

### Preload Scripts
- **ARCH.PRELOAD-1 (MUST)**: Define all IPC channels in preload script
- **ARCH.PRELOAD-2 (MUST)**: Use `contextBridge` to expose APIs safely
- **ARCH.PRELOAD-3 (SHOULD)**: Keep preload script minimal (just API definitions)

## Testability

### Test Design
- **ARCH.TEST-1 (SHOULD)**: Design functions to be easily testable
- **ARCH.TEST-2 (SHOULD)**: Avoid mocking core features when possible
- **ARCH.TEST-3 (SHOULD)**: Mock IPC and file system in isolated tests
- **ARCH.TEST-4 (SHOULD)**: Use E2E tests for integration scenarios

## Performance Considerations

- **ARCH.PERF-1 (SHOULD)**: Avoid premature optimization
- **ARCH.PERF-2 (SHOULD)**: Profile before optimizing
- **ARCH.PERF-3 (SHOULD)**: Cache computed values appropriately
- **ARCH.PERF-4 (SHOULD)**: Use file watchers instead of polling
