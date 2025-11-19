# LLM Context Documentation

This directory contains tool-agnostic documentation and guidelines for AI coding assistants (Claude Code, GitHub Copilot, Cursor, Codex CLI, etc.).


## Directory Structure

```
docs/llm/
├── root-context.md          # Main entry point (symlinked to /CLAUDE.md and /AGENTS.md)
├── command-index.md         # Universal workflow shortcut definitions
├── agents/                  # AI agent configurations
├── commands/                # Tool-specific command definitions
├── workflows/               # Development workflow procedures
├── rules/                   # Coding standards and best practices
├── context/                 # Project knowledge and runtime environment
└── local/                   # Local/project-specific documentation
```

### Dependency Graph (DAG)

The documentation follows a **directed acyclic graph** to prevent circular dependencies:

```
agents/    ─────┐
                ├──> workflows/ ──> rules/ ──> context/
commands/  ─────┘
   ↑
command-index
```

**Rules:**
- `context/` - No dependencies (pure facts about project and runtime)
- `rules/` - Can reference `context/` only
- `workflows/` - Can reference `rules/` and `context/`
- `commands/`, `agents/`, `command-index.md` - Reference `workflows/` for implementation

## File Organization

### `root-context.md`
- **Purpose**: Main entry point that imports all relevant context and guidelines
- **Usage**: Symlinked to `/CLAUDE.md` (Claude Code) and `/AGENTS.md` (GitHub Copilot)
- **Format**: Markdown with `@` syntax for importing other files

### `command-index.md`
- **Purpose**: List commands for agents that don't natively support commands
- **Usage**: Referenced by GitHub Copilot when a /command is invoked
- **Format**: Lists shortcuts with brief descriptions and references to their workflows

### `context/` - Project Knowledge & Environment
Project knowledge and runtime configuration (all `alwaysApply: true`):
- `technology-stack.md` - Languages, frameworks, versions, key dependencies
- `project-structure.md` - Directory structure and architecture
- `coding-patterns.md` - Service objects, queries, Vue patterns, etc.
- `testing-strategy.md` - Test organization and when to use each type
- `api-conventions.md` - API design, serialization, error handling
- `development-commands.md` - How to run specs, start services, generate docs
- `web-access.md` - Development environment URLs and credentials

### `workflows/` - Development Workflows
Procedures for accomplishing development tasks (all `alwaysApply: false`):
- `planning.md` - Planning workflow (qnew)
- `validation.md` - Plan validation workflow (qplan)
- `implementation.md` - Implementation workflow (qcode)
- `review.md` - Comprehensive review workflow (qcheck)
- `review-functions.md` - Function review workflow (qcheckf)
- `review-tests.md` - Test review workflow (qcheckt)
- `ux-testing.md` - UX testing scenarios workflow (qux)
- `git-workflow.md` - Git operations workflow (qgit)
- `documentation.md` - Documentation workflow (qdoc)
- `test-writing.md` - Test writing workflow (qtest)
- `test-writing-ruby.md` - Ruby test writing workflow (qtest-ruby)
- `test-writing-javascript.md` - JavaScript test writing workflow (qtest-js)
- `feature-development.md` - Feature development workflow (qfeature)
- `pr-description.md` - Pull request description workflow (pr/qpr)

**Frontmatter**:
- `description` - Brief description of the file's purpose (Cursor required)
- `alwaysApply: true` - Always loaded (context/)
- `alwaysApply: false` - On-demand (workflows/, commands/, agents/)

### `rules/` - Coding Standards
Files defining coding standards with numbered rules for easy reference:
- `architecture.md` - Design patterns, principles (`ARCH.*` codes)
- `rails.md` - Ruby/Rails standards (`RB.*` codes)
- `javascript.md` - JavaScript/Vue.js standards (`JS.*` codes)
- `testing.md` - Testing standards (`TEST.*` codes)
- `documentation.md` - Documentation guidelines (`DOC.*` codes)

**Frontmatter**:
- `description` - Brief description of the file's purpose (Cursor required)
- `alwaysApply: true/false` - Whether to include in all contexts (Cursor)

**Rule Codes**: Each rule has a unique code (e.g., `RB.TEST-1`, `ARCH.SVC-2`) organized by:
- Prefix: Technology/domain (RB, JS, ARCH, TEST, DOC)
- Section: Abbreviated topic (TEST, SVC, AR, etc.)
- Number: Sequential within section

This allows adding new rules to specific sections without renumbering all subsequent rules.

**Rule Writing Standards**:
- **Format**: `- **PREFIX.SECTION-N (SEVERITY)**: Description`
- **Severity Levels** (required for all rules):
  - `MUST` - Enforced by CI/tooling, critical requirement
  - `SHOULD` - Strongly recommended best practice
  - `MUST NOT` - Prohibited behavior, enforced by CI/tooling
  - `SHOULD NOT` - Discouraged practice, avoid unless necessary
- **Style**:
  - Use directive statements, not questions (e.g., "Ensure functions are readable" not "Can you read the function?")
  - End with period if complete sentence
  - Keep concise and specific
  - Use backticks for code references
  - Reference other files using `@` syntax to avoid duplication
- **Context vs Rules**:
  - Use prose paragraphs for contextual information (e.g., "This app uses Vue 3...")
  - Use numbered rules only for actionable requirements
  - Never use "NOTE" as a severity level - context belongs in prose or README

### `commands/` - User Commands

Codex CLI users can "install" slash commands via symlink:

    ln -sfn $PWD/docs/llm/commands ~/.codex/prompts

Shortcuts that users can invoke (e.g., "qnew", "qcode"):
- `qnew.md` - Planning and approach
- `qplan.md` - Codebase consistency analysis
- `qcode.md` - Implementation with testing
- `qcheck.md` - Comprehensive code review
- `qcheckf.md` - Function-specific review
- `qcheckt.md` - Test-specific review
- `qux.md` - UX testing scenarios
- `qgit.md` - Git workflow
- `qdoc.md` - Documentation
- `qtest.md` - Test writing (Ruby and JavaScript)
- `qtest-ruby.md` - Ruby test writing
- `qtest-js.md` - JavaScript test writing
- `qfeature.md` - Feature development
- `pr.md` - Pull request generation
- `qpr.md` - Pull request generation (alternative)
- `dhh.md` - DHH-style agent command

**Frontmatter** (superset for Claude Code + Cursor):
- `description` - Brief description of the command (both tools)
- `alwaysApply: false` - Commands are invoked on-demand (Cursor)
- `allowed-tools` - Comma-separated list of permitted tools (Claude Code optional)
- `argument-hint` - Description of expected arguments (Claude Code optional)
- `model` - Specific model to use (Claude Code optional)
- `disable-model-invocation` - Prevent SlashCommand tool invocation (Claude Code optional)

**DRY Principle**: Commands reference guideline files using `@` syntax rather than duplicating content.

### `agents/` - AI Agents
Specialized AI agent configurations for different roles and tasks:
- `application-architect.md` - Architecture-focused agent
- `code-documentation-writer.md` - Documentation-focused agent
- `code-quality-enforcer.md` - Code quality and standards agent
- `deployment-coordinator.md` - Deployment-focused agent
- `dhh.md` - DHH-style agent
- `feature-implementer.md` - Feature development agent
- `integration-tester.md` - Integration testing agent
- `test-writer-javascript.md` - JavaScript test writing agent
- `test-writer-ruby.md` - Ruby test writing agent

### `local/` - Local/Project-Specific Documentation
Agent insructions that are specific to you, ignored by git.

## Tool-Specific Setup

### Claude Code
- **Entry Point**: `/CLAUDE.md` (symlink to `docs/llm/root-context.md`)
- **Syntax**: Uses `@` syntax to import files (e.g., `@docs/llm/guidelines/rails.md`)
- **Loading**: Files referenced in `CLAUDE.md` are loaded automatically

### GitHub Copilot
- **Entry Point**: `/AGENTS.md` (symlink to `docs/llm/root-context.md`)
- **Syntax**: Uses `@` syntax to import files
- **Loading**: Depends on Copilot's implementation
- **Commands**: Read from `docs/llm/command-index.md` when a command is invoked

### Cursor
- **Entry Point**: Uses both `.cursor` directory and can read `AGENTS.md`
- **Frontmatter**: Respects `alwaysApply: true/false` in YAML frontmatter
- **Syntax**: Uses `@` syntax and frontmatter-based loading

## Symlink Setup

To set up the symlinks from the project root:

```bash
ln -s docs/llm/root-context.md CLAUDE.md
ln -s docs/llm/root-context.md AGENTS.md
```

## Maintenance Guidelines

### Adding New Rules
1. Find the appropriate rule file (`rules/rails.md`, etc.)
2. Add to the relevant section with next sequential number
3. Use format: `- **PREFIX.SECTION-N (MUST|SHOULD|SHOULD NOT)**: Description`

### Adding New Commands
1. Create file in `commands/` directory
2. Include YAML frontmatter with `name`, `description`, `alwaysApply: false`
3. Reference existing guideline files using `@` syntax (DRY principle)
4. Update `root-context.md` if command should be prominently featured

### Adding New Context Files
1. Create file in `context/` directory (project knowledge, commands, credentials, runtime info)
2. Include YAML frontmatter with `alwaysApply: true`
3. Must NOT reference any other `@docs/llm/` files (leaf nodes in DAG)
4. Add reference in `root-context.md` under "Project Context"

### Adding New Workflows
1. Create file in `workflows/` directory (step-by-step procedures)
2. Include YAML frontmatter with `alwaysApply: false`
3. Can reference `rules/` and `context/`
4. Create corresponding command in `commands/` that references the workflow
5. Add entry in `command-index.md` that references the workflow
6. (Optional) Create agent in `agents/` that references the workflow

### Modifying Rules
- **DO**: Update rule descriptions, add new sections
- **DON'T**: Change rule codes (breaks references in commands/other docs)
- **DON'T**: Duplicate content - use `@` references instead

## Design Principles

1. **DRY (Don't Repeat Yourself)**: Use `@` syntax to reference files, never duplicate content
2. **Tool-Agnostic**: Files work across Claude Code, Cursor, and Copilot
3. **Modular**: Each file has a single, clear purpose
4. **Versioned**: All guidelines are in git and change-tracked
5. **Single Source of Truth**: One place to maintain, symlinks everywhere else
6. **Scannable**: Short codes make rules easy to reference and discuss

## Example Usage

When an LLM assistant loads this context:

1. Reads `root-context.md` (via `CLAUDE.md` or `AGENTS.md`)
2. Loads all `context/` files (tech stack, patterns, architecture, commands, credentials)
3. Loads architecture rules (always applied)
4. Conditionally loads language-specific rules based on task
5. Loads `command-index.md` for available workflow shortcuts
6. User can invoke shortcuts (e.g., "qcode") which load relevant workflows

This creates a composable, maintainable system where:
- **context/** provides "what is this codebase and how do I run it"
- **rules/** enforce "how should I code"
- **workflows/** define "how do I accomplish development tasks"
- **commands/agents/command-index.md** trigger workflows (tool-agnostic)
- **local/** contains project-specific documentation (e.g., analytics)
- All following a DAG to prevent circular dependencies
