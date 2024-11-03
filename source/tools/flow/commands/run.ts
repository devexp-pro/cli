import { Command } from "@cliffy/command";
import { execute } from "@vseplet/shibui";
import { Select } from "@cliffy/prompt/select";
import { Confirm } from "@cliffy/prompt";
import { colors } from "@std/colors";
import flow from "../mod.ts";

const availableLoggingLevels = ["none", "dbg", "trc"];

const interactiveAction = async () => {
};

const inlineAction = async (options: {
  all?: boolean;
  debug?: boolean;
  logs?: boolean;
  path: string;
}) => {
};

const action = async (
  options: {
    all?: boolean;
    debug?: boolean;
    logs?: boolean;
    path: string;
  },
  interactive: boolean = false,
) => {
  if (interactive) await interactiveAction();
  else await inlineAction(options);

  const modules: { [key: string]: any } = {};
  const selectOptions = [];

  for (const dir of Deno.readDirSync(Deno.cwd())) {
    if (!(dir.isFile && dir.name.includes(".flow.ts"))) continue;
    console.log(colors.green(` found script "${dir.name}"`));
    modules[dir.name] =
      (await import("file://" + Deno.cwd() + "/" + dir.name)).default;
    selectOptions.push({ name: dir.name, value: dir.name });
  }

  const countOfScripts = Object.keys(modules).length;

  if (countOfScripts === 0) {
    console.log(colors.red(`  No scripts found to run!`));
    Deno.exit(-1);
  }

  const runAll = countOfScripts == 1
    ? true
    : options.all == undefined
    ? await Confirm.prompt({
      message: "run all scripts?",
    })
    : options.all;

  const runDebug = options.debug == undefined && interactive
    ? await Confirm.prompt({
      message: "enable debug server?",
    })
    : options.debug;

  const runLogging = options.logs == undefined && interactive
    ? await Select.prompt({
      message: "Select logging level",
      options: availableLoggingLevels,
    })
    : options.logs;

  if (runAll) {
    console.log(`  run all scripts!`);
    for (const scriptName in modules) {
      console.log(`  try to exec "${scriptName}"...`);
      await execute(modules[scriptName]);
    }
  } else {
    const scriptName = await Select.prompt({
      message: "Select a script to run:",
      options: selectOptions,
    });

    await execute(modules[scriptName]);
  }

  flow.action();
};

const command = new Command()
  .name("run")
  .description("run subcommand description")
  .usage("[path]")
  .option("-a, --all", "")
  .option("-d, --debug", "")
  .option("-l, --logs [level:string]", "", {
    action: (options) => {
      const res = availableLoggingLevels.indexOf(options.logs as string);

      if (res == -1) {
        console.log(
          colors.red(
            `  The following level values ​​are available for logging: ${
              availableLoggingLevels.join(", ")
            }`,
          ),
        );

        Deno.exit(-1);
      }
    },
  })
  .arguments("[path] [output:string]")
  .action(async (options: any, ...args: any) => {
    const [path] = args;
    // console.log(args.length);
    // console.log(options);
    const isInteractive = args.length == 0 && Object.keys(options).length == 0;

    await action({
      all: options["all"],
      debug: options["debug"],
      logs: options["logs"],
      path: path || "",
    }, isInteractive);
  });

export default {
  action,
  command,
};
