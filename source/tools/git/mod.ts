import { config } from "$/providers/config.ts";
import { Command } from "@cliffy/command";
import clone from "./commands/clone.ts";
import commit from "./commands/commit.ts";
import profile from "./commands/profile.ts";
import feature from "./commands/feature.ts";
import fix from "./commands/fix.ts";
import release from "./commands/release.ts";
import { addMAN } from "$/helpers";

const spotlight = [];

const action = async () => {
  tool.showHelp();
  Deno.exit(0);
};

const tool = new Command();
if (config.data.tools.git.hidden === true) tool.hidden();

tool
  .name("git")
  .description(
    "Git helpers for profile management, repository cloning and more",
  )
  .action(action)
  .command("profile", profile.command)
  .command("clone", clone.command)
  .command("commit", commit.command)
  .hidden()
  .command("feature", feature.command)
  .hidden()
  .command("fix", fix.command)
  .hidden()
  .command("release", release.command)
  .hidden();

addMAN(tool);

spotlight.push({
  tag: "cmd",
  name: "git help",
  stringForSearch: "git help",
  description: "Show help for git tool",
  handler: async () => {
    tool.showHelp();
    Deno.exit();
  },
});

export default {
  spotlight,
  tool,
  action,
};
