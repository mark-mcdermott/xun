# Feature Development Workflow (JS/TS)

## Purpose
Coordinate an end-to-end feature delivery using TDD, code review, and CI-driven deployments to Vercel previews.

## Overview
Phases: Planning → Tests (TDD) → Implementation → Review → QA → Deploy (staging preview) → Merge to main.

### Quick checklist
- Work from `staging` branch.
- Write tests first (unit + E2E as required).
- Push to GitHub when local tests pass; GitHub Actions runs CI and deploys preview to Vercel.
- Merge `staging` → `main` only after CI and reviews pass.

## Artifacts
- `docs/plans/{JIRA}/plan.v1.md`
- PR with preview link and test evidence
