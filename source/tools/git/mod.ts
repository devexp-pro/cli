import { Command } from "@cliffy/command";
import clone from "./commands/clone.ts";
import commit from "./commands/commit.ts";
import { config } from "$/constants";
import profile from "./commands/profile.ts";

const action = async () => {
  tool.showHelp();
  Deno.exit(0);
}

const tool = new Command();
if (config.data.tools.git.hidden) tool.hidden();

tool
  .name("git")
  .description("quickly create and run automation scripts")
  .action(action)
  .command("profile", profile.command)
  .command("clone", clone.command)
  .command("commit", commit.command);

export default {
  tool,
  action,
};
