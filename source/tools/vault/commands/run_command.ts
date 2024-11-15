import { Command } from "@cliffy/command";
import { createClient, getCurrentConfig } from "../api.ts";
import { green, red } from "../deps.ts";

export async function runCommand(cmd: string[]) {
  try {
    const { currentConfig } = await getCurrentConfig();

    if (!currentConfig?.currentProjectUUID || !currentConfig.currentEnvUUID) {
      console.error(red("Project or environment is not selected."));
      return;
    }

    const client = await createClient();
    const response = await client.call("getSecrets", [
      currentConfig.currentEnvUUID,
    ]);

    if (!response.success) {
      console.error(red(`Failed to fetch secrets: ${response.message}`));
      return;
    }

    const { secrets } = response;
    if (Object.keys(secrets).length === 0) {
      console.log(
        green(
          `No secrets found in environment '${currentConfig.currentEnvName}' of project '${currentConfig.currentProjectName}'.`,
        ),
      );
      return;
    }

    const denoCommand = new Deno.Command(cmd[0], {
      args: cmd.slice(1),
      env: { ...Deno.env.toObject(), ...secrets },
      stdout: "piped",
      stderr: "piped",
    });

    const { code, stdout, stderr } = await denoCommand.output();
    if (code === 0) {
      console.log(new TextDecoder().decode(stdout));
    } else {
      console.error(new TextDecoder().decode(stderr));
    }
  } catch (error) {
    console.error(red(`Error: ${(error as Error).message}`));
  }
}

const runCmd = new Command()
  .description("Execute a command with secrets as environment variables.")
  .arguments("<cmd:string>")
  .action(async (_options: any, cmd: string) => {
    if (cmd.length === 0) {
      runCmd.showHelp();
      Deno.exit();
    }
    await runCommand(cmd.split(" "));
    Deno.exit();
  });

export default runCmd;
