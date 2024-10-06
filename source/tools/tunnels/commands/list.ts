import { Table } from "https://deno.land/x/cliffy@v0.25.7/table/table.ts";
import { Command } from "../../deps.ts";
import { kv } from "../kv.ts";
import { set } from "./set.ts";

export const list = new Command()
  .name("list")
  .description("list subcommand description")
  .action(async (_options, ..._args) => {
    const tunnels = await Array.fromAsync(kv.list({ prefix: ["tunnels"] }));

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
      set.showHelp();
    }

    Deno.exit(0);
  });
