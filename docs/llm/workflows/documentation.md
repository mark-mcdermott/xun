# Documentation Workflow (JS/TS)

## Purpose
Add or improve documentation for features, APIs, and complex code paths. Documentation should explain *why* and provide usage examples for public APIs, components, and hooks.

## Steps
1. Read the code and related rules (`@docs/llm/rules/documentation.md`, `@docs/llm/context/project-structure.md`).
2. Add or update file-level documentation (top of module or component) describing responsibility and usage.
3. Add JSDoc/TSDoc for public functions, hooks, and API handlers where helpful.
4. Add short examples for public APIs and components (props, return shape, side effects).
5. Add or update `docs/features/{JIRA_ID}.md` with feature summary, API contract, and preview URL.
6. Keep inline comments minimal — explain non-obvious rationale or caveats only.
7. Commit docs in the same PR as code changes.

## Output
- Updated file-level headers and TSDoc/JSDoc comments.
- `docs/features/{JIRA_ID}.md` created/updated when feature completes.
