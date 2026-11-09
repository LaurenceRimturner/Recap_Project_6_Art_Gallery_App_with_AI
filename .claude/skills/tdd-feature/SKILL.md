---
name: tdd-feature
description: Implement an approved plan test-first, one acceptance criterion at a time (red, verify failure, minimal green, clean up), then run all project checks. Does only what the plan says.
argument-hint: <plan-file>
disable-model-invocation: true
---

# tdd-feature

Argument: `$ARGUMENTS` is the path to the approved plan file (e.g. `docs/plans/<n>-<slug>.md`). If missing or unreadable, ask the user.

## Setup

1. Read the plan file completely. It is the only source of scope.
2. Confirm you are on the plan's feature branch, not `main`. If not, stop and ask.

## For each acceptance criterion, in plan order

1. **Red**: write a failing test for the criterion, as specified in the plan.
2. Run that test once. Check that it fails **for the right reason** (the feature is missing or wrong, not a typo, import error or broken setup). If it fails for the wrong reason, fix the test and rerun.
3. **Green**: write the minimal code that makes the test pass. Nothing more.
4. Run the test again until it passes. Also make sure previously passing tests still pass.
5. **Clean up**: refactor for clarity without changing behavior; rerun the tests.

## Finish

Run all checks listed in the **Commands** section of `CLAUDE.md` (e.g. tests, lint, type check, build). Report each result honestly, including failures. If `CLAUDE.md` or its Commands section is missing, ask the user which checks to run (check `package.json` scripts as a suggestion).

## Rules

- Never change an existing test unless the approved plan explicitly says so. If an existing test blocks you, stop and ask.
- Do nothing that is not in the plan: no extra features, refactors, dependencies or files. If the plan seems wrong or incomplete, stop and ask.
- Do not commit or push unless the plan or user says so (that is `open-pr`'s job).
