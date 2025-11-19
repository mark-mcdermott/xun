# Test-Specific Review Workflow (JS/TS)

## Purpose
Assess the quality and effectiveness of tests added or modified.

## Checklist
- Tests fail for real defects (no tautologies).
- Parameterized where appropriate (`it.each` / data-driven tests).
- Avoid fragile selectors in Playwright; use roles/aria or data-testid.
- Tests are deterministic and isolated.
- E2E covers happy paths and key edge cases; keep long scenarios selective.

## Output
- Test review report with flaky test suggestions and missing scenarios.
