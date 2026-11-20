import type { ExtensionAPI, ExtensionContext } from "@oh-my-pi/pi-coding-agent";

// Read once per session from the installed tree, so each pstack sync updates the mode without touching this file.
const skill = await Bun.file(new URL("../skills/poteto-mode/SKILL.md", import.meta.url)).text();
const body = skill.replace(/^---\n[\s\S]*?\n---\n/, "").trim();
const instructions = `<poteto-mode>
Poteto mode is on for this session: follow the skill below on every task, without loading skill://poteto-mode again. Files it names by relative path, such as \`playbooks/feature.md\`, are \`skill://poteto-mode/<path>\`. The user turns the mode off with \`/poteto-mode off\`.

${body}
</poteto-mode>`;

const ENTRY = "poteto-mode";

export default function potetoMode(pi: ExtensionAPI) {
	let on = false;

	const show = (ctx: ExtensionContext) => ctx.ui.setStatus(ENTRY, on ? "poteto" : undefined);

	pi.on("session_start", async (_event, ctx) => {
		const saved = ctx.sessionManager
			.getBranch()
			.findLast(entry => entry.type === "custom" && entry.customType === ENTRY);
		const data: unknown = saved?.type === "custom" ? saved.data : undefined;
		on = typeof data === "object" && data !== null && "on" in data && data.on === true;
		show(ctx);
	});

	// Subagents get their brief and pstack's worker prompt; the orchestrator's mode would fight both.
	pi.on("before_agent_start", async (event, ctx) => {
		if (on && ctx.agent.kind === "main") return { systemPrompt: [...event.systemPrompt, instructions] };
	});

	pi.registerCommand(ENTRY, {
		description: "Keep poteto mode on every turn of this session: on, off, or no argument for the current state",
		getArgumentCompletions: prefix =>
			["on", "off"].filter(value => value.startsWith(prefix)).map(value => ({ value, label: value })),
		handler: async (args, ctx) => {
			const wanted = args.trim().toLowerCase();
			if (wanted === "on" || wanted === "off") {
				on = wanted === "on";
				pi.appendEntry(ENTRY, { on });
				show(ctx);
			} else if (wanted) {
				ctx.ui.notify(`Usage: /${ENTRY} on|off`, "warning");
				return;
			}
			ctx.ui.notify(`Poteto mode is ${on ? "on" : "off"}.`, "info");
		},
	});
}
