import { createClient, getCurrentConfig } from "../../api.ts";
import { green, red } from "../../deps.ts";

export async function executeCommandWithSecrets(cmd: string[]) {
  const { currentConfig } = await getCurrentConfig();
  if (!currentConfig?.currentEnvUUID) {
    throw new Error("No environment selected.");
  }

  const client = await createClient();
  const response = await client.call("getSecrets", [currentConfig.currentEnvUUID]);

  if (!response.success) {
    throw new Error(`Failed to fetch secrets: ${response.message}`);
  }

  const secrets = response.secrets;
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
}
