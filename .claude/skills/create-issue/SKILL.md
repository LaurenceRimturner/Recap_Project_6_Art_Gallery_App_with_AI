---
name: create-issue
description: Turn an idea into a GitHub issue in the repo's issue-template format (value proposition, acceptance criteria, tasks). Shows a draft and only creates the issue after the user agrees.
argument-hint: <your idea>
disable-model-invocation: true
---

# create-issue

Argument: `$ARGUMENTS` is the user's idea. If empty, ask for it.

## Steps

1. Look at the existing format: check `.github/ISSUE_TEMPLATE/` and a few existing issues (`gh issue list`, `gh issue view <n>`) and match their structure and tone.
2. Draft the issue with:
   - **Title**: short and specific.
   - **Value proposition**: who benefits and why (e.g. "As a … I want … so that …").
   - **Acceptance criteria**: a checklist of testable, observable statements.
   - **Tasks**: a checklist of concrete implementation steps.
3. If the idea is vague or the scope is unclear, ask the user before drafting.
4. **Show the draft** to the user and wait for their feedback. Revise as asked.
5. Only after the user explicitly agrees, run `gh issue create --title "<title>" --body "<body>"` (add labels only if the template requires them). Report the issue URL.

## Rules

- Never run `gh issue create` before the user has agreed to the shown draft.
