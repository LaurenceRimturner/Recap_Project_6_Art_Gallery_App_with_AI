---
name: open-pr
description: Verify the branch, run all checks, commit in small steps, push, and open a pull request that closes the issue. Claims nothing it did not check.
argument-hint: <issue-number>
disable-model-invocation: true
---

# open-pr

Argument: `$ARGUMENTS` is the issue number `<n>`. If missing, ask the user.

## Steps

1. **Branch check**: run `git branch --show-current`. If it is `main`, stop and tell the user.
2. **Checks**: run all checks from the **Commands** section of `CLAUDE.md`. If any fail, stop and report the output; do not open the PR. If `CLAUDE.md` or the section is missing, ask the user which checks to run.
3. **Commit in small steps**: review `git status` / `git diff`, group changes into logical commits with clear messages (one concern each). Never use `git add -A` blindly; do not commit unrelated or secret files.
4. **Push**: `git push -u origin <branch>`.
5. **Create the PR** with `gh pr create` and a body containing:
   - `Closes #<n>`
   - **Summary**: what changed and why.
   - **How I tested**: only the checks you actually ran in this session, with their real results.
   - **Acceptance criteria**: the issue's criteria as a checklist (`gh issue view <n>`). Tick (`[x]`) only criteria you verified (e.g. by a passing test); leave others unticked.
6. **Tick the issue**: read the issue body with `gh issue view <n> --json body -q .body`. Set `- [ ]` to `- [x]` only for acceptance criteria and tasks you verified in this session (passing test, check output, or file inspection). Write the result with `gh issue edit <n> --body-file <file>` (temp file in the scratchpad). Leave unverified items unticked and list them in your reply, each ticked item with its proof.
7. Show the user the PR URL.

## Rules

- Claim nothing you did not check. If something was skipped or failed, say so in the PR and in your reply.
- Tick a box in the issue or the PR only with a concrete proof (test name, command output); state the proof in your reply.
- If unsure about anything (title, scope, unticked criteria), ask the user first.
