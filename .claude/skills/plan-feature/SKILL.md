---
name: plan-feature
description: Plan a feature from a GitHub issue. Reads the issue, explores the relevant code, presents a plan in Plan mode, and after approval creates the branch and commits the plan file. Writes no application code.
argument-hint: <issue-number>
disable-model-invocation: true
---

# plan-feature

Argument: `$ARGUMENTS` is the issue number `<n>`. If it is missing or not a number, ask the user for it.

## Phase 1: Research (Plan mode)

1. Enter Plan mode (EnterPlanMode). Stay read-only until the plan is approved.
2. Read the issue: `gh issue view <n>`.
3. Explore only the code that matters for the issue (components, hooks, data, existing tests, test setup).
4. Present a plan containing:
   - **Summary** of the feature in one or two sentences.
   - **Test per acceptance criterion**: a table mapping each acceptance criterion to the test(s) that cover it (file, test name, what it asserts).
   - **Files that change**: each file to create or modify and why.
   - **Out of scope**: what this issue deliberately does not do.
   - **Open questions**: anything unclear in the issue or code. Ask the user if you are unsure.

Do NOT write any application code or tests in this skill.

## Phase 2: After the user approves the plan

Do exactly these three things, then stop:

1. Create the branch `feature/<n>-<slug>` (`<slug>` = short kebab-case of the issue title): `git switch -c feature/<n>-<slug>`.
2. Save the approved plan as `docs/plans/<n>-<slug>.md`.
3. Commit it (only that file) with a clear message, e.g. `docs: add plan for #<n> <title>`.

Then stop. Do not push, do not implement, do not open a PR. Tell the user the plan file path and that `tdd-feature` is the next step.

If the plan is not approved, revise it with the user; do not create the branch or file.
