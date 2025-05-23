// Types
import type { DxTool } from "$/types";
// Modules
import { Command } from "@cliffy/command";
import spotlight from "$/spotlight/mod.ts";
// Tools
import toolAlias from "$/tools/alias/mod.ts";
import toolHyper from "$/tools/hyper/mod.ts";
import toolDB from "$/tools/db/mod.ts";
import toolTunnel from "$/tools/tunnel/mod.ts";
import toolVault from "$/tools/vault/mod.ts";
import toolGit from "$/tools/git/mod.ts";
import toolFlow from "$/tools/flow/mod.ts";
import toolClip from "$/tools/clip/mod.ts";
import toolTerm from "$/tools/term/mod.ts";
import toolLLM from "$/tools/llm/mod.ts";
import toolShortcuts from "$/tools/shortcuts/mod.ts";
import toolIntegrations from "$/tools/integrations/mod.ts";
import toolLink from "$/tools/link/mod.ts";
// Main commands
import { dash } from "$/commands/dash/mod.ts";
import { intro } from "$/commands/intro.ts";
import { setup } from "$/commands/setup/mod.ts";
import { cfg } from "$/commands/cfg.ts";
// Constants
import { logo2 } from "$/strings";

const tools: Array<DxTool> = [
  toolTunnel,
  toolVault,
  toolHyper,
  toolDB,
  toolFlow,
  toolAlias,
  toolGit,
  toolClip,
  toolTerm,
  toolLLM,
  toolShortcuts,
  toolIntegrations,
  toolLink,
];

const commands: Array<Command<any>> = [
  dash,
  intro,
  setup,
  cfg,
];

const dx = new Command()
  .name("dx")
  .usage("[command]")
  .option("-s, --spotlight", "Run 'dx' in spotlight mode", {
    default: false,
  })
  .description(
    "This is a powerful entry point for all developers, significantly\nimproving the developer experience",
  )
  .action(async (options, ..._args) => {
    if (options.spotlight) {
      const spotlightRunner = spotlight.init(tools);
      await spotlightRunner();
      Deno.exit();
    } else {
      console.log(logo2);
      dx.showHelp();
      Deno.exit();
    }
  });

// tools
tools.forEach((tool) => {
  dx.command(tool.tool.getName(), tool.tool);
});

// main commands
commands.forEach((command) => {
  dx.command(command.getName(), command);
});

await dx.parse(Deno.args);
