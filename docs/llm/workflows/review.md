# Comprehensive Code Review Workflow (JS/TS)

## Purpose
Skeptical, end-to-end code review for major PRs targeting `staging`.

## Steps
1. Function quality reviews (review-functions).
2. Test quality reviews (review-tests).
3. Architecture & design review (small surface, large impact).
4. Accessibility smoke check (Playwright axe run).
5. Lint, typecheck, and build verification.

## Output
- Review summary with Critical / Major / Minor issues and suggested fixes.
- Example refactor snippets for high-impact simplifications.
