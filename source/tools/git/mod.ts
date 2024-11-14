import { config } from "$/constants";
import { Command } from "@cliffy/command";
import clone from "./commands/clone.ts";
import commit from "./commands/commit.ts";
import profile from "./commands/profile.ts";
import feature from "./commands/feature.ts";
import fix from "./commands/fix.ts";
import release from "./commands/release.ts";

const action = async () => {
  tool.showHelp();
  Deno.exit(0);
};

const tool = new Command();
if (config.data.tools.git.hidden) tool.hidden();

tool
  .name("git")
  .description(
    "git helpers for profile management, repository cloning and more",
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

export default {
  tool,
  action,
};
