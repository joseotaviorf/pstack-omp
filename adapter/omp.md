# pstack in omp

pstack skills use Cursor names. In omp, read this once per session, then map each Cursor name in a skill with the tables below. `<pstack>` means the folder that holds `skills/` and `docs/`. If a Cursor field has no row, drop it and say so. Never pass a field or value the tool schema rejects. Write the omp name, never the Cursor one, in replies, briefs, and questions to the user.

The operator's own rules win over pstack. Where their `RULES.md` or `AGENTS.md` sets a limit that a pstack skill or `worker.md` loosens, such as on commits, merges, production or shared-system writes, pull request format, or model choice, follow the operator's rule.

`read skill://<name>` opens any pstack skill, including the ones your skill catalog hides. Its first line, `[Skill file: <path>]`, is the real path. Resolve a relative link in a skill against that path's folder, so `<pstack>` is two folders above it.

## Tools

| Cursor | omp |
| --- | --- |
| `Task` | `task`. With the batch schema, send `{ context, tasks: [{ agent, name, task, solutionSpace }] }`: `context` is shared background and each `task` is self-contained. |
| `AskQuestion` | `ask`, one HTML form: radio inputs for one-of, checkboxes for many-of, the recommended option preselected. In `-p` mode and in subagents it is absent or fails, so ask in plain text, or put the question in your final answer. |
| Open a todolist, or copy steps into the todolist tool | `todo` with `op: "init"`, one phase per playbook stage. Send it beside your next real tool call. Subagents have no `todo`, so they keep the list in their reply. |
| Run another pstack skill (`/name` or "the **name** skill") | `read skill://<name>` and follow it. When you tell the user to type it, write `/skill:<name>`. |
| The `deslop`, `control-cli`, `control-ui`, or `verify-this` skill from the `cursor-team-kit` plugin | pstack for omp ships all four, so there is nothing to install. `read skill://<name>` and follow it, as for a pstack skill. |
| Cursor's built-in `create-skill` skill, `/create-skill` | `read skill://skill-creator` and follow it. pstack for omp ships Anthropic's skill-creator, adapted for omp. Its draft, test, and iterate loop runs test cases as `task` subagents, and its description optimization (`scripts/run_loop.py`) runs on `omp -p`. |
| Cursor's Plan Mode | omp's plan mode. The user toggles it with `/plan` or Alt+Shift+P. |

## Subagent fields

| Cursor | omp |
| --- | --- |
| `subagent_type: generalPurpose` | Omit `agent`. The default `task` agent runs. |
| `poteto-agent`, `comment-sicko`, `subagent_type: "poteto-agent"` | Set `agent: "poteto-agent"` or `agent: "comment-sicko"` on each task item. The plugin ships both without a prefix. An item without `agent` runs the generic `task` agent, which never loads poteto-mode. |
| `readonly: true` | Set `agent: "pstack-readonly"`. It runs on the session's model. Its `bash` is for read-only commands, so it is not a sandbox: check `git status` afterward. |
| `readonly: false` | Omit `agent`. The `task` agent keeps the session's MCP tools. |
| `environment: "cloud"` | `isolated: true` when the `task` schema offers `isolated` (needs `task.isolation.enabled`). Name the branch or commit the worker checks out. Without it, make a checkout with `git worktree add`, or `ovnfs new` when the system prompt offers it, and give the worker its path. |
| `environment: "local"` | Omit. |
| `cloud_base_branch: <b>` | Tell the worker to check out `<b>` first. |
| `run_in_background: true` | Omit. With async on, spawns already run in the background and their results arrive on their own. Call `wait` only when you are blocked with nothing else to do. |
| `resume` | `write agent://<id>` with the follow-up. omp revives an idle or parked agent with its context. To steer a running agent, write to it the same way. |
| `file_attachments` | List the paths in `task`. Put long shared material in a `local://<name>.md` file and name it, since subagents share your `local://` root. |
| A pstack file in a `Task` brief, such as a reference prompt or a playbook | Name it as `skill://<name>/<path>`, such as `skill://poteto-mode/playbooks/feature.md`. Subagents resolve it as you do; a relative or `plugins/pstack/...` path sends them searching the disk. When the brief has them follow a pstack skill or reference prompt, also tell them to read `skill://pstack-omp-adapter` first. |

## Models

pstack names a model for each role. In omp the operator's model roles decide instead: each role's model comes from `modelRoles`, and `retry.fallbackChains` takes over when it fails. So pick the agent bound to the role, and never set `model` on a task item. Raise or lower a role's level with the item's `effort` (`hi` or `lo`) when the `task` schema offers it; otherwise drop the level.

| Cursor | omp |
| --- | --- |
| `claude-opus-5-5-xhigh-fast` or another `claude-` slug for code, prose, or judgment: the feature, refactoring, bug-fix, perf-issue, hillclimb, and judgment and prose roles | `agent: "poteto-agent"`. It runs on the `slow` role. |
| `claude-opus-5-5-high-fast` for trivial mechanical edits, swarm workers, or verification | Omit `agent`. The bundled `task` agent runs on the `task` role. |
| A panel seat: `claude-fable-5-2-high`, `claude-opus-5-5-high-fast`, and `gemini-4-neon-xhigh`, or any `gemini-`, `grok-`, or `gpt-` slug | One seat each with `agent: "pstack-seat-advisor"`, `"pstack-seat-plan"`, and `"pstack-seat-slow"`, which run on the `advisor`, `plan`, and `slow` roles. Each result names its model; when two seats share a model family, say so. Fable 5.2 outside a panel is `pstack-seat-advisor`, under the skill's same conditions. |
| `auto` or `inherit-parent` | Omit `agent`. The bundled `task` agent runs on the `task` role. |
| The `pstack-models.mdc` rule, `~/.cursor/rules/pstack-models.mdc`, and its role lines | omp has no pstack model rule: the operator's `modelRoles` play its part, and a `task.agentModelOverrides` entry moves a pstack agent to another role. Skip every step that reads or checks the rule, such as the `# defaults: 3` notice. |
| The `Task` tool rejects the slug | Never pass `model`, so this cannot happen. If preflight rejects an `agent`, run the item without `agent` and say so. |

## setup-pstack

In omp, pstack's models follow the operator's model roles (see Models), so this skill writes no rule, adds no role, and turns on no per-call model. Replace its steps with these. `<config>` is the active `config.yml`: `~/.omp/agent/config.yml`, or `~/.omp/profiles/<name>/agent/config.yml` under a named profile.

1. Show the routing. `read cfg://modelRoles` and `cfg://task`, then show one table: each pstack role, the agent that runs it, the omp role that agent uses, and that role's model. Code, prose, and judgment run on `poteto-agent` (`slow`). Trivial edits, swarm workers, and verification run on `task` (`task`). The panel seats run on `pstack-seat-advisor`, `pstack-seat-plan`, and `pstack-seat-slow` (`advisor`, `plan`, `slow`). A `task.agentModelOverrides` entry for one of these agents replaces its role. Flag two seats whose models share a family.
2. Offer moves. Ask whether to move any pstack agent to another role. A move is a `task.agentModelOverrides` entry whose value is a role alias, such as `poteto-agent: "@plan"`, never a model id, so the role's fallback chain still applies. To change a model itself, the user edits their `modelRoles`; never touch them.
3. Write. Keep every override already set and add the moves. Run `chezmoi source-path <config>` in `bash`. Exit 0, printing the source path, means chezmoi manages the config: write the merged map to `cfg://task/agentModelOverrides` for this session only, add the same entries to that source file and keep every `{{ … }}` directive, run `chezmoi diff <config>`, show it, and run `chezmoi apply <config>` once the user approves. A missing `chezmoi` or a non-zero exit means unmanaged: write the merged map to `cfg://task/agentModelOverrides/save`. omp asks the user to approve each `cfg://` write.
4. Under `omp -p`, or anywhere else without an interactive session, `cfg://` writes fail. Print the entries and the commands for the user, and stop.

## Rewritten paths

pstack for omp already has these swapped in every skill and agent, so the text you follow names the omp folder. If you meet the Cursor form anywhere else, such as in upstream docs, use the omp form.

| Cursor | omp |
| --- | --- |
| `~/.cursor/skills/` | `~/.omp/agent/skills/` |
| `.cursor/skills/` | `.omp/skills/` |

## Paths

| Cursor | omp |
| --- | --- |
| `~/.cursor/plugins/`, `.cursor-plugin/plugin.json` | pstack lives in the omp plugin cache, `~/.omp/plugins/cache/plugins/<marketplace>___pstack___<version>/`, with `.omp-plugin/plugin.json`. Do not search for it: `read skill://<name>` prints the real path. |
| `.cursor/rules/*.mdc`, always-applied rules | `AGENTS.md`, or a `.omp/rules/<name>.md` rule with `alwaysApply: true`. User-wide rules go in `~/.omp/agent/rules/`. |
| Installing or updating pstack: `/add-plugin pstack`, Customize in the sidebar, `/plugin install` | `omp plugin marketplace add joseotaviorf/pstack-omp`, then `omp plugin install pstack@pstack-omp`. To update, `omp plugin marketplace update pstack-omp`, then `omp plugin upgrade pstack@pstack-omp`. Then start a new session, or run `/reload-plugins` in an open one. |
| `https://github.com/cursor/plugins/blob/main/pstack/<path>` | `<pstack>/<path>` when that file exists. The plugin ships the skills, `docs/guide/`, and `README.md`. Read the local copy and never fetch it. Give the user the URL when they need a link. |
| Transcripts in `~/.cursor/projects/<slug>/agent-transcripts/` | omp has no `agent-transcripts/` folder, and its system prompt names no transcript. Run `echo "$PI_SESSION_FILE"` in `bash`: omp sets that variable to the absolute path of this conversation's transcript, on every platform. In a subagent it is the subagent's own transcript, and the main conversation's is the `.jsonl` named like the folder that holds it. Earlier sessions of this workspace are the other `.jsonl` files in the main transcript's folder; list that one folder with `glob`. That variable is the only way to find a transcript. Never list, glob, or `find` any other session folder: they hold other workspaces' private chats. Line 1 of a transcript is a `title` record and line 2 the `session` header with `id` and `cwd`. Conversation turns are `{"type":"message","message":{"role":…,"content":[…]}}` lines, where `role` is `user`, `assistant`, `toolResult`, or `developer` (harness notices) and `content` is a list of blocks such as `{"type":"text","text":…}`; skip every other `type`. The folder beside each `.jsonl` with the same name holds its artifacts, including subagent transcripts as `<id>.jsonl`. `history://<id>` renders a subagent transcript as text. |

## Cursor-only features

omp has no Cursor Automations, Bugbot, Cursor cloud agents, Cursor Projects, or built-in PR tool. When a step needs one, put one line in your reply, `Skipped in omp: <step>. <reason>.`, then go on to the next step. Do not stop, ask, or retry. When a later step needs what the skipped step made, such as a URL or a key, leave a placeholder and name it in the line.

| Cursor | omp |
| --- | --- |
| Cursor Automations: routines, `update_state` routine calls, `api2.cursor.sh/automations` webhooks, routine wakes, and `SendToUser` secret requests | Skip with the line. |
| Bugbot | Bugbot comments on a GitHub PR are ordinary review threads, so triage them with the forge command that the step gives. Skip a step that starts, waits for, or configures Bugbot when the PR has no Bugbot check or comment. |
| Cursor cloud agents, Cursor Projects and their Project workers | `environment: "cloud"` maps to an isolated checkout, as in Subagent fields. A rule for Project workers applies to your `task` subagents. Skip a step that needs the cloud agent or the Project itself, such as its dashboard status or its own machine. |
| A built-in PR tool | Use the forge command that the step gives, such as `gh pr create`. `read pr://<n>` shows a GitHub PR and `pr://<n>/diff` its diff. That is not a skip, so write no line. |
| Cursor's `/loop` command, such as `/loop until X` or `/loop 1h` | omp's `/loop` is a command only the user can type, in an interactive session: `/loop [count\|duration] [--while\|--until '<command>'] [prompt]` sends the prompt again after each of your replies until the count, the duration, or the command's exit status stops it. A duration caps the loop, it is not an interval. `/goal <objective>` keeps the session working until you mark the objective done. You cannot start either one. When the user asks how to run until done, give them a `/loop --until '<check command>' <prompt>` line, or `/goal` when no command can check done. To wake yourself on an event (CI, a merge, a ref moving), run the watcher as a background `bash` job or a `task` subagent. Its result wakes the session when it finishes. Start it through the tool, not with `nohup`, `disown`, or a trailing `&`: a detached process cannot wake you and outlives the session. Always give it a time limit, such as a capped number of checks, so it ends even when the event never comes. Never write `while true`. omp has no interval timer, so for a fixed tick such as `/loop 1h`, write the skip line once, then run the tick's audit at each phase boundary and each time a result wakes you. |
| Cursor Custom Modes, such as keeping `/poteto-mode` on with Option+Enter or the Agents Window | omp has no Custom Modes. Instead, `/poteto-mode on` keeps poteto mode on in every turn of the main session, until `/poteto-mode off`. Sessions start with it off. While it is on, do not load `skill://poteto-mode` again. |
