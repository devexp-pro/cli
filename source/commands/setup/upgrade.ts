import { Command } from "@cliffy/command";
import { upgradeVersion } from "$/providers/version.ts";

export const upgrade = new Command()
  .description("Upgrade the DevExp CLI")
  .action(async (_options: any, ..._args: any) => {
    await upgradeVersion();
  });
