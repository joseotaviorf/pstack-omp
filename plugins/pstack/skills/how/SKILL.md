---
name: how
description: "Use for \"how does X work\", code walkthroughs before changing something, and placement / ownership / layering questions (\"where should this live\", \"which package owns this\", \"is this the right layer\"). Explains subsystem architecture, runtime flow, onboarding mental models. Use why for motivation."
disable-model-invocation: true
---

# How

In omp, map the Cursor names in this skill with these rows. `skill://pstack-omp-adapter` has the full map. If a Cursor field has no row in either, drop it and say so. Never pass a field or value the tool schema rejects. Write the omp name, never the Cursor one, in replies, briefs, and questions to the user. Where the operator's own `RULES.md` or `AGENTS.md` sets a limit this text loosens, the operator's rule wins.

pstack names a model for each role. In omp the operator's model roles decide instead: each role's model comes from `modelRoles`, and `retry.fallbackChains` takes over when it fails. So pick the agent bound to the role, and never set `model` on a task item. Raise or lower a role's level with the item's `effort` (`hi` or `lo`) when the `task` schema offers it; otherwise drop the level.

| Cursor | omp |
| --- | --- |
| `Task` | `task`. With the batch schema, send `{ context, tasks: [{ agent, name, task, solutionSpace }] }`: `context` is shared background and each `task` is self-contained. |
| `subagent_type: generalPurpose` | Omit `agent`. The default `task` agent runs. |
| `readonly: true` | Set `agent: "pstack-readonly"`. It runs on the session's model. Its `bash` is for read-only commands, so it is not a sandbox: check `git status` afterward. |
| A pstack file in a `Task` brief, such as a reference prompt or a playbook | Name it as `skill://<name>/<path>`, such as `skill://poteto-mode/playbooks/feature.md`. Subagents resolve it as you do; a relative or `plugins/pstack/...` path sends them searching the disk. When the brief has them follow a pstack skill or reference prompt, also tell them to read `skill://pstack-omp-adapter` first. |
| The `Task` tool rejects the slug | Never pass `model`, so this cannot happen. If preflight rejects an `agent`, run the item without `agent` and say so. |

Explore the codebase to answer "how does X work?" questions.

If the scope is ambiguous, state your interpretation and explore. The user can redirect.

## 1. Explain

Spawn one Task subagent with `subagent_type: generalPurpose` and `readonly: true` that explores and explains in one pass. Give it the user's question and this brief:

> You are writing an architectural explanation for a senior engineer. Explore the codebase and write an explanation that a senior engineer unfamiliar with this area could read and walk away with a solid mental model. They should understand the architecture well enough to start working in it confidently. You have read-only access to the codebase.

## 2. Present

Present the subagent's output. Light edits for clarity or context from the conversation are fine. Do not substantially rewrite it.
