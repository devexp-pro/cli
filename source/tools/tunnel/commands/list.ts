import { kv } from "$/kv";
import { Table } from "@cliffy/table";
import { Command } from "@cliffy/command";
import set from "./set.ts";

const action = async () => {
  const tunnels = await Array.fromAsync(
    kv.list({ prefix: ["tool", "tunnel", "list"] }),
  );

  if (tunnels.length > 0) {
    const table = new Table()
      .header(["alias", "tunnel name", "port"])
      .border(true)
      // .padding(1)
      .indent(2);

    tunnels.forEach((tunnel, index) => {
      const value = tunnel.value as any;
      table.push([value.alias, value.name, value.port]);
      // console.log(
      //   `${index}: ${tunnel.key[1] as string}, port ${tunnel.value}`,
      // );
    });

    table.render();
  } else {
    console.log(`  No tunnels found! Use set:`);
    set.command.showHelp();
  }

  Deno.exit(0);
};

const command = new Command()
  .name("list")
  .description("list subcommand description")
  .action(action);

export default {
  command,
  action,
};
