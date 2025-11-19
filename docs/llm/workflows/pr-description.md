# PR Description Generation (JS/TS)

## Purpose
Auto-generate clear PR descriptions that help reviewers and QA validate changes quickly.

## Template
```markdown
Title: [JIRA-123] Short description (target: staging)

## Overview
2–3 sentences: what changed and why.

## Technical Details
Optional: non-obvious decisions and trade-offs.

## QA / How to test locally
- Commands to run (dev, seed, run tests)
- Steps for manual QA and critical paths
- Expected behavior and edge cases

## Preview URL
- Vercel preview: https://preview.xyz.com/<branch>

## TDD Evidence
- Links to tests added/modified and notes on failing->passing history
```

## Output
- Save `docs/plans/{JIRA}/pr-description.md` with PR body for copy/paste into GitHub.
