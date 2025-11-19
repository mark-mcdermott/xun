# JavaScript Test Writing Workflow (Vitest + Playwright)

## Purpose
Write high-quality JavaScript/TypeScript tests following strict TDD: tests are the spec. Primary frameworks: Vitest (unit/component) and Playwright (E2E).

## Core Principles
- **TDD-first**: Write failing tests before implementation (Red → Green → Refactor).  
- **Behavior-focused**: Tests should describe expected behavior, not implementation details.  
- **Fast & Deterministic**: Keep unit tests fast; E2E tests cover critical user journeys.

## File Layout & Naming
- Unit/component tests colocated with source: `src/features/.../Component.test.tsx` or `hook.test.ts`.
- E2E tests under `tests/e2e/**/*.spec.ts` using Playwright.

## Test Types & When to Use
- **Unit (Vitest)**: Pure functions, hooks, small components — use jsdom or happy DOM as needed.
- **Integration (Vitest)**: Multiple modules working together (network mocked).
- **E2E (Playwright)**: User flows in the browser (auth, forms, navigation).

## Test Authoring Checklist
1. Write a clear test name describing behavior.  
2. Parameterize inputs where useful (`it.each`).  
3. Use Testing Library idioms for components (`render`, `screen`, `userEvent`).  
4. Mock external HTTP/DB in unit tests; prefer dependency injection.  
5. For Playwright, prefer role/aria/data-testid selectors over brittle CSS.
6. Record traces/screenshots for failed E2E runs.
7. Keep tests independent and idempotent.

## Example (Vitest + React Testing Library)
```ts
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import Login from './Login'

describe('Login', () => {
  it('redirects to dashboard after successful login', async () => {
    render(<Login />)
    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    expect(await screen.findByText(/welcome/i)).toBeInTheDocument()
  })
})
```

## Running Tests
- Unit: `npm run test:unit`  
- E2E: `npm run test:e2e` (ensure `npx playwright install` ran at least once)  
- Coverage: `npm run test:coverage`

## Output
- Tests added/updated next to code.  
- Clear test names and fixtures.  
- Playwright traces/screenshots for failures attached to CI artifacts.
