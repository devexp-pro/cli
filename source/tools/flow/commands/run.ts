import { Command } from "@cliffy/command";

const action = async () => {
};

const command = new Command()
  .name("run")
  .usage("[path]")
  .arguments("[path] [output:string]")
  .description("run subcommand description")
  .action(async (options: any, ...args: any) => {
    console.log(options);
    console.log(args);
    for (const dir of Deno.readDirSync(Deno.cwd())) {
      if (dir.isFile) console.log(dir.name);
    }
    Deno.exit(0);
  });

export default {
  action,
  command,
};
