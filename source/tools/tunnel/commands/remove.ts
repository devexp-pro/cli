import { kv } from "$/kv";
import { Command } from "@cliffy/command";
import { Checkbox } from "@cliffy/prompt";

const action = async () => {
  const tunnels = await Array.fromAsync(
    kv.list({ prefix: ["tool", "tunnel", "list"] }),
  );

  const aliasesToRemove: string[] = await Checkbox.prompt({
    message: "Please select tunnels:\n",
    options: tunnels.map((entry) => ({
      // @ts-ignore
      name: `${entry.value.alias} ${entry.value.name} ${entry.value.port}`,
      // @ts-ignore
      value: entry.value.alias,
    })),
  });

  aliasesToRemove.forEach(async (name) => {
    await kv.delete(["tool", "tunnel", "list", name]);
    console.log(`  Tunnel ${name} has been removed!`);
  });

  Deno.exit(0);
};

const command = new Command()
  .description("remove tunnel alias")
  .arguments("<tunnel_name:string>")
  .action(async (_options: any, ...args: [any]) => {
    const [name] = args;
    await kv.delete(["tool", "tunnel", "list", name]);
    console.log(`  Tunnel ${name} has been removed!`);
    Deno.exit(0);
  });

export default {
  action,
  command,
};
