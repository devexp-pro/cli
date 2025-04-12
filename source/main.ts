import { Command } from "@cliffy/command";
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
// Integrations
import integrations from "$/integrations/mod.ts";
// Just a commands
import { dash } from "$/commands/dash/mod.ts";
import { intro } from "$/commands/intro.ts";
import { setup } from "$/commands/setup/mod.ts";
import { cfg } from "$/commands/cfg.ts";
import { logo2 } from "$/strings";

const dx = new Command()
  .name("dx")
  .usage("[command]")
  .description(
    "This is a powerful entry point for all developers, significantly\nimproving the developer experience",
  )
  .action((_options: any, ..._args: any) => {
    console.log(logo2);
    dx.showHelp();
    Deno.exit();
  })
  // tools
  .command(toolTunnel.tool.getName(), toolTunnel.tool)
  .command(toolVault.tool.getName(), toolVault.tool)
  .command(toolHyper.tool.getName(), toolHyper.tool)
  .command(toolDB.tool.getName(), toolDB.tool)
  .command(toolFlow.tool.getName(), toolFlow.tool)
  .command(toolAlias.tool.getName(), toolAlias.tool)
  .command(toolGit.tool.getName(), toolGit.tool)
  .command(toolClip.tool.getName(), toolClip.tool)
  .command(toolTerm.tool.getName(), toolTerm.tool)
  .command(toolLLM.tool.getName(), toolLLM.tool)
  // integrations
  .command(integrations.getName(), integrations)
  // commands
  .command("dash", dash)
  .command("intro", intro)
  .command("cfg", cfg)
  .command("setup", setup);

await dx.parse(Deno.args);
