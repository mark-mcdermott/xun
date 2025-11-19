# Continuous Integration (CI/CD)

This project uses **GitHub Actions** for continuous integration and deployment, with **Vercel** providing automatic preview environments.  
The goal is to provide fast feedback loops, enforce TDD, and ensure consistent quality across every branch.

![ci-workflow](/docs/imgs/ci/workflow.png?raw=true)

---

## Workflow Overview

Every branch is automatically tested and deployed through **GitHub Actions workflows** defined in [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml).

Key ideas:

- **Immediate feedback:** Run tests, lint, and typechecks in parallel for quick validation.
- **Staging-first deployment:** All branches deploy to Vercel preview environments (e.g., `preview.xyz.com/<branch>`).
- **Protected `main` branch:** Only mergeable after CI and PR approval.
- **Consistent standards:** All teams follow the same TDD and review gates.

---

## Workflow Stages

| Stage              | Purpose                                                | Key Commands                            |
| ------------------ | ------------------------------------------------------ | --------------------------------------- |
| **Setup**          | Install dependencies and cache node modules            | `npm ci`                                |
| **Lint**           | Enforce ESLint, Prettier, and TypeScript rules         | `npm run lint` / `npm run typecheck`    |
| **Unit Tests**     | Run Vitest suites with coverage enabled                | `npm run test:unit -- --coverage`       |
| **E2E Tests**      | Run Playwright browser tests in headless mode          | `npx playwright test`                   |
| **Coverage Check** | Combine unit and E2E reports, enforce thresholds       | `npm run test:coverage`                 |
| **Preview Deploy** | Deploy successful staging builds to Vercel preview URL | Managed via GitHub Actions + Vercel CLI |
| **Main Deploy**    | Deploy production after merge to main                  | Automatic via Vercel Git integration    |

---

## Example GitHub Actions Workflow

```yaml
name: CI

on:
  push:
    branches: [staging, main]
  pull_request:
    branches: [staging]

jobs:
  setup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - run: npm ci

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run lint && npm run typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run test:unit -- --coverage
      - run: npx playwright install --with-deps
      - run: npx playwright test

  deploy-preview:
    if: github.ref == 'refs/heads/staging'
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./
          alias-domains: preview.xyz.com
```
