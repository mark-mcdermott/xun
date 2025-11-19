# Implementation Workflow (JS/TS)

## Purpose
Implement features adhering to the validated plan with strict TDD and small iterative commits.

## Steps
1. Run failing tests (create tests if not present).
2. Implement minimal code to make tests pass.
3. Run full unit suite; fix regressions.
4. Add/adjust E2E tests as UI changes require.
5. Run linters, typecheck, and formatters.
6. Push branch and open PR targeting `staging`.

## Commit Strategy
- Small commits tied to logical steps (test, implementation, refactor).
- Include test evidence in commit body when relevant.
