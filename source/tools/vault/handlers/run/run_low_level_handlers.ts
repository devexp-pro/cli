import { createClient, getCurrentConfig } from "../../config_sync.ts";
import { green, red } from "../../deps.ts";

export async function executeCommandWithSecrets(cmd: string[]) {
  const { currentConfig } = await getCurrentConfig();
  if (!currentConfig?.currentEnvUUID) {
    throw new Error("No environment selected.");
  }

  const client = await createClient();
  const response = await client.call("getSecrets", [
    currentConfig.currentEnvUUID,
  ]);

  if (!response.success) {
    throw new Error(`Failed to fetch secrets: ${response.message}`);
  }

  const secrets = response.secrets;
  const command = new Deno.Command(cmd[0], {
    args: cmd.slice(1),
    env: { ...Deno.env.toObject(), ...secrets },
    stdout: "piped",
    stderr: "piped",
  });

  const child = command.spawn();

  async function streamOutput(
    stream: ReadableStream<Uint8Array> | null,
    writable: WritableStream<Uint8Array>,
  ) {
    if (stream) {
      const reader = stream.getReader();
      const writer = writable.getWriter();
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) await writer.write(value);
        }
      } catch (err) {
        console.error("Error reading stream:", err);
      } finally {
        reader.releaseLock();
        writer.releaseLock();
      }
    }
  }

  streamOutput(child.stdout, Deno.stdout.writable);
  streamOutput(child.stderr, Deno.stderr.writable);

  const { code } = await child.status;
  if (code === 0) {
    console.log(green("Process completed successfully."));
  } else {
    console.error(red(`Process exited with code ${code}.`));
  }
}
