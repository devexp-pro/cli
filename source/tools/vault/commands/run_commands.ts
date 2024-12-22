import { Command } from "@cliffy/command";
import { executeCommandWithSecrets } from "../handlers/run/run_low_level_handlers.ts";

const runCommand = new Command()
  .description("Execute a command with secrets as environment variables.")
  .arguments("<cmd:string>")
  .action(async (_options: any, cmd: string) => {
    const cmdArray = cmd.split(" ");
    await executeCommandWithSecrets(cmdArray);
    Deno.exit();
  });

export default runCommand;
