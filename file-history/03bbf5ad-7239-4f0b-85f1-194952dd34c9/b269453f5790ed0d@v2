// Claude Code StatusLine — real-time context + cost display
const data = JSON.parse(require("fs").readFileSync(0, "utf8"));
const pct = data.context_window?.used_percentage ?? 0;
const model = data.model?.display_name ?? "";
const cost = data.cost?.total_cost_usd ?? 0;

const barLen = 10;
const filled = Math.round((pct / 100) * barLen);
const bar = "█".repeat(filled) + "░".repeat(barLen - filled);

let color;
if (pct > 75) color = "\x1b[31m";       // red
else if (pct > 50) color = "\x1b[33m";  // yellow
else color = "\x1b[32m";                 // green

process.stdout.write(`${color}${bar}\x1b[0m ${pct.toFixed(1)}%  |  ${model}  |  $${cost.toFixed(2)}`);
