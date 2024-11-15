import { kv } from "$/kv";
import { Command } from "@cliffy/command";
import { Input, Number, prompt } from "@cliffy/prompt";

const setAlias = async (alias: string, name: string, port: number) => {
  const res = await kv.set(["tool", "tunnel", "list", alias], {
    alias,
    name,
    port,
  });

  if (res.ok) {
    Deno.exit(0);
  } else {
    Deno.exit(-1);
  }
};

const action = async () => {
  const { alias, name, port } = await prompt([{
    name: "alias",
    message: "Enter tunnel alias:",
    type: Input,
  }, {
    name: "name",
    message: "Enter tunnel name:",
    type: Input,
  }, {
    name: "port",
    message: "Enter tunnel port",
    type: Number,
  }]);

  await setAlias(alias as string, name as string, port as number);
};

const command = new Command()
  .description("set alias for tunnel")
  .arguments("<alias:string> <tunnel_name:string> <port:number>")
  // .example("set tunnel", "pp set sevapp 8000")
  .action(async (_options: any, ...args: [string, string, number]) => {
    await setAlias(...args);
  });

export default {
  command,
  action,
};
