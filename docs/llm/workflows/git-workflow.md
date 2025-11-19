# Git & Branching Workflow (JS/TS)

## Branching
- Create feature branches from `staging`: `feat/JIRA-123-description`.
- Pull requests target `staging` by default.

## Commits
- Use Conventional Commits: `feat:`, `fix:`, `chore:`, `test:`, etc.
- Write clear messages explaining *why* not just *what*.
- Do not include AI authorship metadata in commits.

## Pull Requests
- PR template must include preview URL, test summary, and how to reproduce locally.
- Require at least one reviewer (Dan Abramov-style review) and passing CI before merge.
- Squash or rebase per repo policy (prefer clean history).

## Releases
- Merge `staging` → `main` when ready for production. Protect `main` with branch protections.
