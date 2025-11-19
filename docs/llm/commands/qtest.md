---
description: Test writing workflow for both Ruby and JavaScript
alwaysApply: false
---

# QTEST - Test Writing (Ruby and JavaScript)

## Workflow Selection

This command delegates to language-specific test writing workflows based on the file type or user request:

- **Ruby/RSpec tests**: See @docs/llm/workflows/test-writing-ruby.md
- **JavaScript/Vitest tests**: See @docs/llm/workflows/test-writing-javascript.md
- **Core TDD principles**: See @docs/llm/workflows/test-writing.md

## Usage

When the user types "qtest":
1. Determine the language based on context (file extension, user request, or ask if unclear)
2. Execute the appropriate language-specific test writing workflow
3. If writing tests for both languages, execute both workflows sequentially
