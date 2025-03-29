import { Command } from "@cliffy/command";
import { Checkbox } from "@cliffy/prompt";
import { kv } from "$/repositories/kv.ts";

type TunnelEntry = {
  key: string[];
  value: {
    alias: string;
    name: string;
    port: number;
  };
  versionstamp: string;
};

const action = async () => {
  const tunnels = (await Array.fromAsync(
    kv.list({ prefix: ["tool", "tunnel", "list"] }),
  )) as TunnelEntry[];

  if (!tunnels.length) {
    console.log("No tunnels found.");
    Deno.exit(0);
  }

  console.log("Loaded tunnels:", tunnels);

  const aliasesToRemove: string[] = await Checkbox.prompt({
    message: "Please select tunnels to remove:\n",
    //@ts-ignore
    options: tunnels.map((entry) => {
      const alias = entry.value?.alias;
      const name = entry.value?.name;
      const port = entry.value?.port;

      if (!alias || !name || !port) {
        console.warn("Invalid tunnel entry:", entry);
        return null;
      }

      return {
        name: `${alias} ${name} ${port}`,
        value: alias,
      };
    }).filter(Boolean),
  });

  if (aliasesToRemove.length === 0) {
    console.log("No tunnels selected. Exiting.");
    Deno.exit(0);
  }

  for (const name of aliasesToRemove) {
    try {
      await kv.delete(["tool", "tunnel", "list", name]);
      console.log(`  Tunnel ${name} has been removed!`);
    } catch (error) {
      console.warn(`  Failed to remove tunnel ${name}:`, error);
    }
  }

  Deno.exit(0);
};

const command = new Command()
  .description("remove tunnel alias")
  .arguments("<tunnel_name:string>")
  .action(async (_options: any, ...args: [any]) => {
    const [name] = args;
    try {
      await kv.delete(["tool", "tunnel", "list", name]);
      console.log(`  Tunnel ${name} has been removed!`);
    } catch (error) {
      console.warn(`  Failed to remove tunnel ${name}:`, error);
    }
    Deno.exit(0);
  });

export default {
  action,
  command,
};
