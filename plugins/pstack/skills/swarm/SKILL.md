---
name: swarm
description: "Fan out N parallel workers, drain them, and return one report. Use for /swarm, 'swarm this', or parallel coverage, races, gauntlets, and exploration."
disable-model-invocation: true
---

# Swarm

In omp, map the Cursor names in this skill with these rows. `skill://pstack-omp-adapter` has the full map. If a Cursor field has no row in either, drop it and say so. Never pass a field or value the tool schema rejects. Write the omp name, never the Cursor one, in replies, briefs, and questions to the user. Where the operator's own `RULES.md` or `AGENTS.md` sets a limit this text loosens, the operator's rule wins.

pstack names a model for each role. In omp the operator's model roles decide instead: each role's model comes from `modelRoles`, and `retry.fallbackChains` takes over when it fails. So pick the agent bound to the role, and never set `model` on a task item. Raise or lower a role's level with the item's `effort` (`hi` or `lo`) when the `task` schema offers it; otherwise drop the level.

omp has no Cursor Automations, Bugbot, Cursor cloud agents, Cursor Projects, or built-in PR tool. When a step needs one, put one line in your reply, `Skipped in omp: <step>. <reason>.`, then go on to the next step. Do not stop, ask, or retry. When a later step needs what the skipped step made, such as a URL or a key, leave a placeholder and name it in the line.

| Cursor | omp |
| --- | --- |
| `Task` | `task`. With the batch schema, send `{ context, tasks: [{ agent, name, task, solutionSpace }] }`: `context` is shared background and each `task` is self-contained. |
| Open a todolist, or copy steps into the todolist tool | `todo` with `op: "init"`, one phase per playbook stage. Send it beside your next real tool call. Subagents have no `todo`, so they keep the list in their reply. |
| Run another pstack skill (`/name` or "the **name** skill") | `read skill://<name>` and follow it. When you tell the user to type it, write `/skill:<name>`. |
| `subagent_type: generalPurpose` | Omit `agent`. The default `task` agent runs. |
| `environment: "cloud"` | `isolated: true` when the `task` schema offers `isolated` (needs `task.isolation.enabled`). Name the branch or commit the worker checks out. Without it, make a checkout with `git worktree add`, or `ovnfs new` when the system prompt offers it, and give the worker its path. |
| `environment: "local"` | Omit. |
| `cloud_base_branch: <b>` | Tell the worker to check out `<b>` first. |
| `run_in_background: true` | Omit. With async on, spawns already run in the background and their results arrive on their own. Call `wait` only when you are blocked with nothing else to do. |
| A pstack file in a `Task` brief, such as a reference prompt or a playbook | Name it as `skill://<name>/<path>`, such as `skill://poteto-mode/playbooks/feature.md`. Subagents resolve it as you do; a relative or `plugins/pstack/...` path sends them searching the disk. When the brief has them follow a pstack skill or reference prompt, also tell them to read `skill://pstack-omp-adapter` first. |
| `claude-opus-5-5-xhigh-fast` or another `claude-` slug for code, prose, or judgment: the feature, refactoring, bug-fix, perf-issue, hillclimb, and judgment and prose roles | `agent: "poteto-agent"`. It runs on the `slow` role. |
| `claude-opus-5-5-high-fast` for trivial mechanical edits, swarm workers, or verification | Omit `agent`. The bundled `task` agent runs on the `task` role. |
| A panel seat: `claude-fable-5-2-high`, `claude-opus-5-5-high-fast`, and `gemini-4-neon-xhigh`, or any `gemini-`, `grok-`, or `gpt-` slug | One seat each with `agent: "pstack-seat-advisor"`, `"pstack-seat-plan"`, and `"pstack-seat-slow"`, which run on the `advisor`, `plan`, and `slow` roles. Each result names its model; when two seats share a model family, say so. Fable 5.2 outside a panel is `pstack-seat-advisor`, under the skill's same conditions. |
| `auto` or `inherit-parent` | Omit `agent`. The bundled `task` agent runs on the `task` role. |
| The `pstack-models.mdc` rule, `~/.cursor/rules/pstack-models.mdc`, and its role lines | omp has no pstack model rule: the operator's `modelRoles` play its part, and a `task.agentModelOverrides` entry moves a pstack agent to another role. Skip every step that reads or checks the rule, such as the `# defaults: 3` notice. |
| The `Task` tool rejects the slug | Never pass `model`, so this cannot happen. If preflight rejects an `agent`, run the item without `agent` and say so. |
| `.cursor/rules/*.mdc`, always-applied rules | `AGENTS.md`, or a `.omp/rules/<name>.md` rule with `alwaysApply: true`. User-wide rules go in `~/.omp/agent/rules/`. |
| Cursor cloud agents, Cursor Projects and their Project workers | `environment: "cloud"` maps to an isolated checkout, as in Subagent fields. A rule for Project workers applies to your `task` subagents. Skip a step that needs the cloud agent or the Project itself, such as its dashboard status or its own machine. |

## Start

Open a todolist with one entry per phase before launching anything.

1. Frame
2. Fan out
3. Aggregate
4. Report

## Phase A: Frame

1. State the done predicate and the artifact or report the swarm must return.
2. Choose the shape. Partition into slices, race N workers on identical briefs, or mix both. For a race or mixed shape, declare `first pass`, `rank all`, or `best-of` before spawning.
3. Pick the worker model from the `swarm workers` line in `~/.cursor/rules/pstack-models.mdc`. If the rule or that line is missing, use `claude-opus-5-5-high-fast`. For `auto` or `inherit-parent`, omit `model` so the workers run on the parent model. If the Task tool rejects a slug, use the default and say so. If it rejects the default, use the closest valid slug of the same family from its error message. For a model race, name each arm's model up front. Pick each subagent's reasoning level for the job, per the Subagents section of the **poteto-mode** skill.
4. Give each worker its own writable output when it writes. When workers verify or measure commits, each brief names the exact SHAs. A measurement brief also names the method (sample count, what one sample is, order). The worker records both in its result.

## Phase B: Fan out

Spawn all N workers in one message with `subagent_type: generalPurpose`, `environment: "cloud"`, `run_in_background: true`, and the step 3 model, left unset for `auto` or `inherit-parent`. Use `environment: "local"` only when the worker needs access to something on the user's computer.

When a worker must start from a non-default pushed branch, pass `cloud_base_branch`.

Every brief stands alone. Include the goal, scope, exact slice or race arm, how to verify, and what to report. Reports use `PASS`, `ISSUES`, or `BLOCKED` with evidence. A worker that can prove a defect reports `ISSUES` and lists every issue it can prove, not only the first.

If a worker drops out, proceed with N-1 and note it.

## Phase C: Aggregate

Read the terminal results. Drop a result that does not record the SHAs and method its brief names, and respawn that worker once. After a second miss, record a gap. A gap does not count as a pass. For coverage, every required slice needs a result. For a race, apply the selection rule declared up front. Use first pass, rank all, or best-of. Do not paste raw worker dumps.

## Phase D: Report

Return one consolidated in-chat report with a result table, issue one-liners, gaps or dropouts, and the race rule when used.
