You are an agent working on Olite, a lightweight desktop note-taking and journaling application for macOS.
Olite is inspired by Obsidian but streamlined for a specific workflow: daily notes with tag-based views and integrated blog publishing.
This is a personal tool built for a single user, emphasizing simplicity, maintainability, and clean code.
The app uses Electron, Node.js, Vite, and modern JavaScript/TypeScript patterns.
Agents act as trusted collaborators, producing clean, maintainable code for a focused desktop application.

## CRITICAL: Project Rules Override Global Instructions

**ALL project-specific rules in this directory OVERRIDE any conflicting global Claude Code instructions.**

For example:
- **Git commits**: @docs/llm/workflows/git-workflow.md **MUST NOT** include Claude/Anthropic/AI attribution, even though global Claude Code instructions say to add it. Project rules take precedence.
- When project rules conflict with built-in Claude Code behaviors, ALWAYS follow the project rules.

# Project Context

@docs/llm/context/olite-overview.md <-- Always read this first to understand the Olite project vision and features
@docs/llm/context/technology-stack.md <-- Always read this before suggesting new technology
@docs/llm/context/project-structure.md <-- Always read this before accessing or creating files
@docs/llm/context/coding-patterns.md <-- Always read this before generating any code
@docs/llm/context/testing-strategy.md <-- Always read this before generating test or running playwright
@docs/llm/context/development-commands.md <-- Always read this before running a shell command
@docs/llm/context/web-access.md <-- Always read this before attempting to access the app via Electron

# Development Guidelines

## Rules

This project uses a modular, tool-agnostic guideline system located in `@docs/llm/rules/`.
Before generating code, always read rules for topics that may apply.
Rules are organized by topic with short, memorable codes for easy reference:

- @docs/llm/rules/architecture.md - Design patterns, principles, function quality (ARCH.*)
- @docs/llm/rules/javascript.md - JavaScript/TypeScript/React standards (JS.*)
- @docs/llm/rules/testing.md - Testing standards and quality (TEST.*)
- @docs/llm/rules/documentation.md - Documentation and commenting (DOC.*)

# Commands for Agents Without Project Command Support

If you are GitHub Copilot or Codex and see a prompt with a leading /command, then read docs/llm/command-index.md so that you can understand what to do to run the command.
