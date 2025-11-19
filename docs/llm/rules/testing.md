---
description: Testing standards, quality criteria, and best practices for Ruby and JavaScript tests
alwaysApply: false
---

# Testing Guidelines

## Purpose
Defines testing standards, quality criteria, and best practices for both Ruby and JavaScript tests.

See @docs/llm/context/testing-strategy.md for test file organization and when to write different types of tests.

## Core Testing Principles

### Test-Driven Development
- **TEST.TDD-1 (SHOULD)**: Follow TDD: scaffold stub � write failing test � implement

### Test Separation
- **TEST.SEP-1 (MUST)**: ALWAYS separate pure-logic unit tests from DB-touching integration tests

### Test Coverage
- **TEST.COV-1 (MUST)**: Cover all new code by tests
- **TEST.COV-2 (SHOULD)**: Test edge cases, realistic input, unexpected input, and value boundaries

### Database Constraint Testing
- **TEST.DB-1 (MUST NOT)**: Test database constraints (uniqueness indexes, foreign keys) at the model spec level
- **TEST.DB-2 (SHOULD)**: Trust database to enforce DB-level constraints defined in migrations
- **TEST.DB-3 (SHOULD)**: Use shoulda-matchers only for domain validations (presence, format) not DB constraints (uniqueness, length limits)

## Test Quality Checklist

When evaluating test quality, check:

### Parameterization
- **TEST.Q-1 (SHOULD)**: Parameterize inputs; never embed unexplained literals such as 42 or "foo" directly in the test

### Meaningful Tests
- **TEST.Q-2 (SHOULD NOT)**: Add a test unless it can fail for a real defect. Trivial asserts (e.g., `expect(2).toBe(2)`) are forbidden

### Clear Descriptions
- **TEST.Q-3 (SHOULD)**: Ensure test description states exactly what the final expect verifies. If wording and assert don't align, rename or rewrite

### Independent Expectations
- **TEST.Q-4 (SHOULD)**: Compare results to independent, pre-computed expectations or to properties of the domain, never to the function's output re-used as the oracle

### Style Consistency
- **TEST.Q-5 (SHOULD)**: Follow the same lint and style rules as prod code (Rubocop, ESLint)

### Assertion Strength
- **TEST.Q-6 (SHOULD)**: Use `expect.any(...)` when testing for parameters that can be anything (e.g. variable ids)
- **TEST.Q-7 (MUST)**: Use strong assertions over weaker ones e.g. `expect(x).toEqual(1)` instead of `expect(x).toBeGreaterThanOrEqual(1)`

### Structure Testing
- **TEST.Q-8 (SHOULD)**: Test the entire structure in one assertion if possible:
  ```js
  expect(result).toEqual([value]) // Good

  expect(result).toHaveLength(1); // Bad
  expect(result[0]).toBe(value); // Bad
  ```

### Axiom-Based Testing
- **TEST.Q-9 (SHOULD)**: Express invariants or axioms (e.g., commutativity, idempotence, round-trip) rather than single hard-coded cases whenever practical

## Test Organization

### Grouping
- **TEST.ORG-1 (MUST)**: Group unit tests for an instance method under `describe "#method_name"` and a class method under `describe ".class_method_name"`
- **TEST.ORG-2 (SHOULD NOT)**: Wrap every test in a context or describe block

### Named Subjects
- **TEST.ORG-3 (SHOULD)**: Use named subjects for service and callable classes that use methods in the assertion
- **TEST.ORG-4 (SHOULD)**: Use a specifically named subject over generic names like `data` or `result`

## Test Strategy

### Unit vs Integration
- **TEST.STRAT-1 (SHOULD)**: Prefer integration tests over heavy mocking
- **TEST.STRAT-2 (SHOULD)**: Unit-test complex algorithms thoroughly
- **TEST.STRAT-3 (SHOULD)**: Use integration tests when unit testing would require extensive mocking of core features

### Mocking Guidelines
- **TEST.MOCK-1 (SHOULD NOT)**: Stub/mock components in integration specs unless external to system under test
- **TEST.MOCK-2 (SHOULD)**: Mock external dependencies appropriately

## Test Coverage Strategy

### What to Test
- **TEST.COVER-1 (SHOULD)**: Cover all public functions
- **TEST.COVER-2 (SHOULD)**: Test critical edge cases and failure modes
- **TEST.COVER-3 (SHOULD)**: Test integration points at the boundaries
- **TEST.COVER-4 (SHOULD NOT)**: Test trivial methods or framework-provided behavior
- **TEST.COVER-5 (SHOULD NOT)**: Exhaustively test combinatorial input unless high risk
- **TEST.COVER-6 (MUST NOT)**: Duplicate existing tests
- **TEST.COVER-7 (SHOULD NOT)**: Test implementation details; focus on observable behavior
- **TEST.COVER-8 (SHOULD NOT)**: Duplicate unit-level assertions in request specs, testing only critical flows

### Test Optimization
- **TEST.OPT-1 (SHOULD)**: Optimize for fast execution
- **TEST.OPT-2 (SHOULD)**: Optimize for ease of maintenance
- **TEST.OPT-3 (SHOULD)**: Optimize for behavioral correctness over implementation details

## Test Readability

### Helper Methods
- **TEST.READ-1 (SHOULD)**: Use helper methods and custom matchers to keep test bodies readable

### Descriptive Names
- **TEST.READ-2 (MUST)**: Use descriptive test names that explain what is being tested
