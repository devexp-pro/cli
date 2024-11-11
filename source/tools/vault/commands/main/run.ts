import { Command } from "@cliffy/command";
import { runCommand } from "../secondary/run.ts";

const runCmd = new Command()
  .description("Выполнить команду с секретами как переменными окружения.")
  .arguments("<cmd...:string>") 
  .action(async (_options: any, ...cmd: string[]) => {
    if (cmd.length === 0) {
      runCmd.showHelp();
      Deno.exit();
    }
    await runCommand(cmd).parse([]);
  });

export default runCmd;
