# pstack for omp

[pstack](https://github.com/cursor/plugins/tree/main/pstack) by [poteto](https://x.com/poteto), packaged for [omp](https://github.com/can1357/oh-my-pi). It tracks upstream daily. Forked from [gokselk/pstack-omp](https://github.com/gokselk/pstack-omp).

## install

```bash
omp plugin marketplace add joseotaviorf/pstack-omp
omp plugin install pstack@pstack-omp
```

Start a new session, or run `/reload-plugins` in an open one.

## get started

1. Optionally, run `/skill:setup-pstack`. It shows which of your omp model roles runs each pstack role, and can move a pstack agent to another role through `task.agentModelOverrides`. omp asks you to approve each settings change it makes.
2. Use `/skill:poteto-mode <task>` for any task that needs rigor, or run `/poteto-mode on` to keep poteto mode on in every turn of the session. Give the goal and a check that can pass or fail.

New to pstack? Read the [pstack guide](plugins/pstack/docs/guide/README.md). Stuck? Ask `/skill:poteto-help`.

## differences in omp

pstack is written for Cursor. Each skill carries the omp mapping for the Cursor names it uses, so most of pstack works as written. These parts change:

- Upstream docs write commands as `/name`. In omp, type `/skill:name`.
- `omp -p` passes `/skill:name` through as plain text. There, write `read skill://<name> and follow it: <task>` instead.
- Cursor keeps poteto mode on through a Custom Mode. omp has no Custom Modes, so pstack ships an extension: after `/poteto-mode on`, it adds `poteto-mode` to the main session's system prompt on every turn, until `/poteto-mode off`. Sessions start with it off, and resuming a session keeps its setting. Subagents don't get it, because they run on their brief and pstack's worker prompt.
- pstack names a model for each role. In omp, your model roles decide: code, prose, and judgment run on `poteto-agent` (the `slow` role), trivial edits and verification on omp's `task` agent (the `task` role), and panel seats on `pstack-seat-advisor`, `pstack-seat-plan`, and `pstack-seat-slow` (the `advisor`, `plan`, and `slow` roles). Each role keeps its fallback chain.
- Your own `RULES.md` and `AGENTS.md` win where they are stricter than pstack, such as on commits, merges, production writes, or pull request format.
- Steps that need a Cursor-only feature are skipped with a one-line note.

## update

```bash
omp plugin marketplace update pstack-omp
omp plugin upgrade pstack@pstack-omp
```

The first command refreshes the catalog, and the second installs the newer version. Then start a new session, or run `/reload-plugins` in an open one.
## bundled skills

pstack's playbooks run some skills that pstack does not ship, so this plugin ships them too:

- `deslop`, `control-cli`, `control-ui`, and `verify-this` from Cursor's [cursor-team-kit](https://github.com/cursor/plugins/tree/main/cursor-team-kit).
- `skill-creator`, adapted for omp from Anthropic's [skill-creator](https://github.com/anthropics/skills/tree/main/skills/skill-creator). It replaces Cursor's built-in `create-skill`.

These skills load only when a pstack skill runs them or you type `/skill:<name>`.

## license

pstack is MIT, as upstream. See [LICENSE](LICENSE). The cursor-team-kit skills are MIT, copyright Cursor, and each one has its `LICENSE` beside its `SKILL.md`. `skill-creator` is Apache-2.0, with its `LICENSE.txt` in its folder.

Maintainers: see [MAINTAINING.md](MAINTAINING.md).
