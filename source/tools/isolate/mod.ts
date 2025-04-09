import { Command } from "@cliffy/command";
import { config } from "$/providers/config.ts";
import hev from "@devexp/hev";

const add = new Command()
  .name("add")
  .alias("a")
  .usage("<text...>")
  .description("")
  .arguments("<path_to_script:string> <slug:string> [group:string]")
  .option("-s, --show", "show stored data")
  .action(async (options: any, ...args: any) => {
    const [entrypoint, slug, group] = args;
    // "https://docs.deno.com/examples/scripts/hello_world.ts"

    const isolateParams = {
      slug,
      group: group || "default",
      entrypoint,
      importMap: "",
      env: {},
    };

    const ok = await hev.isolator.pm.add(isolateParams);

    if (ok) {
      console.log(
        ` added isolate "${isolateParams.slug}" with entrypoint: "${isolateParams.entrypoint}" to group "${isolateParams.group}"`,
      );
    } else {
      console.log(
        ` failed to add isolate "${isolateParams.slug}" with entrypoint: "${isolateParams.entrypoint}" to group "${isolateParams.group}"`,
      );
    }

    Deno.exit();
  });

const remove = new Command()
  .name("remove")
  .alias("r")
  .usage("")
  .description("")
  .option("-s, --show", "show loaded data")
  .action(async (options: any) => {
    Deno.exit();
  });

const list = new Command()
  .name("list")
  .alias("l")
  .usage("")
  .description("show all isolates")
  .option("-g, --group", "show all isolates by group")
  .action(async (options: any) => {
    const list = await hev.isolator.pm.get("", "");
    console.log(list);
    Deno.exit();
  });

const serve = new Command()
  .name("serve")
  .alias("s")
  .usage("")
  .description("start isolate server")
  .option("-s, --slug <slug:string>", "serve single isolate (can buy -g)", {
    default: null,
  })
  .option("-g, --group <group:string>", "serve group of isolates", {
    default: "default",
  })
  .action(
    async (
      options: { slug: string | undefined; group: string },
    ) => {
      if (options.slug) {
        console.log(
          `serve single isolate ${options.slug} from group ${options.group}`,
        );
      } else {
        console.log(`serve all isolates from group ${options.group}`);
      }
      const list = await hev.isolator.pm.start(options.group, options.slug);
      // console.log(list);
      // Deno.exit();
      hev.init();
    },
  );

const tool = new Command();
if (config.data.tools.isolate.hidden) tool.hidden();
tool
  .name("isolate")
  .alias("i")
  .usage("")
  .description("Isolate manager and local server")
  .action(() => {
    tool.showHelp();
    Deno.exit();
  })
  .command("add", add)
  .command("remove", remove)
  .command("list", list)
  .command("serve", serve);

// addMAN(tool);

export default {
  tool,
};
