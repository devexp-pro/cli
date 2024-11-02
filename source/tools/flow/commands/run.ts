import { Command } from "@cliffy/command";
import { execute } from "@vseplet/shibui";

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

    const modules: { [key: string]: any } = {};
    console.log(Deno.cwd());
    for (const dir of Deno.readDirSync(Deno.cwd())) {
      if (!(dir.isFile && dir.name.includes(".flow.ts"))) {
        continue;
      }

      modules[dir.name] = (await import(Deno.cwd() + "/" + dir.name)).default;
      console.log(`run ${dir.name}`);
      await execute(modules[dir.name]);
    }

    Deno.exit(0);
  });

export default {
  action,
  command,
};
