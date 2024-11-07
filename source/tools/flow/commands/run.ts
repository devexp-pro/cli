import { Command } from "@cliffy/command";
import { execute } from "@vseplet/shibui";
import { Select } from "@cliffy/prompt/select";
import { Confirm } from "@cliffy/prompt";
import { colors } from "@std/colors";
import flow from "../mod.ts";
import { resolve } from "@std/path";
import { TTaskBuilder, TWorkflowBuilder } from "@vseplet/shibui/core/types";

const availableLoggingLevels = ["none", "dbg", "trc"];

type Options = {
  all?: boolean;
  simple?: boolean;
  debug?: boolean;
  logs?: boolean;
  path: string;
};

type ShibuiBuilder = TTaskBuilder | TWorkflowBuilder;
type BuildersMap = { [key: string]: ShibuiBuilder };
type SelectOption = { name: string; value: string };

const interactiveAction = async (
  countOfScripts: number,
  builders: BuildersMap,
  selectOptions: SelectOption[],
) => {
  const runAll = countOfScripts === 1 ? true : await Confirm.prompt({
    message: "run all scripts?",
  });

  const runDebug = await Confirm.prompt({
    message: "enable debug server?",
  });

  const runLogging = await Select.prompt({
    message: "Select logging level",
    options: availableLoggingLevels,
  });

  if (runAll) {
    console.log(`  run all scripts!`);
    for (const scriptName in builders) {
      console.log(`  try to exec "${scriptName}"...`);
      await execute(builders[scriptName]);
    }
  } else {
    const scriptName = await Select.prompt({
      message: "Select a script to run:",
      options: selectOptions,
    }) as string;

    await execute(builders[scriptName]);
  }

  flow.action();
};

const inlineAction = async (
  options: Options,
  countOfScripts: number,
  builders: BuildersMap,
) => {
  if (countOfScripts > 1 && !options.all) {
    console.log(
      colors.red(
        `  You must specify the --all option to run multiple scripts!`,
      ),
    );

    Deno.exit(-1);
  }

  for (const scriptName in builders) {
    console.log(`  try to exec "${scriptName}"...`);
    await execute(builders[scriptName]);
  }

  Deno.exit(0);
};

const simpleAction = async (
  builders: BuildersMap,
) => {
  Deno.exit(0);
};

const action = async (
  options: Options,
  interactive: boolean = false,
) => {
  let resolvedPath = options.path || Deno.cwd();

  // console.log(Deno.cwd());
  // console.log(resolvedPath);
  // console.log(resolve("file://", Deno.cwd(), resolvedPath));

  resolvedPath = resolvedPath.startsWith("./")
    ? resolve(Deno.cwd(), resolvedPath)
    : resolvedPath;

  const isFile = Deno.lstatSync(resolvedPath).isFile;
  const builders: BuildersMap = {};
  const selectOptions: SelectOption[] = [];

  if (!isFile) {
    for (const dir of Deno.readDirSync(resolvedPath)) {
      if (dir.isFile && dir.name.includes(".flow.ts")) {
        console.log(colors.green(` found script "${dir.name}"`));
        builders[dir.name] =
          (await import("file://" + resolvedPath + "/" + dir.name)).default;
        selectOptions.push({ name: dir.name, value: dir.name });
      }
    }
  } else {
    builders[resolvedPath] = (await import("file://" + resolvedPath)).default;
    selectOptions.push({ name: resolvedPath, value: resolvedPath });
  }

  const countOfScripts = Object.keys(builders).length;

  if (countOfScripts === 0) {
    console.log(colors.red(`  No scripts found to run!`));
    Deno.exit(-1);
  }

  if (options.simple) {
    await simpleAction(builders);
  } else if (interactive) {
    await interactiveAction(
      countOfScripts,
      builders,
      selectOptions,
    );
  } else {
    await inlineAction(options, countOfScripts, builders);
  }
};

const command = new Command()
  .name("run")
  .description("Run scripts")
  .usage("[path]")
  .option("-s, --simple", "run in simple mode", {
    conflicts: ["all", "debug", "logs"],
  })
  .option("-a, --all", "run all scripts", {
    conflicts: ["simple"],
  })
  .option("-d, --debug", "enable debug server", {
    conflicts: ["simple"],
  })
  .option("-l, --logs [level:string]", "set logging level", {
    action: (options) => {
      const res = availableLoggingLevels.indexOf(options.logs as string);

      if (res == -1) {
        console.log(
          colors.red(
            `  The following level values ​are available for logging: ${
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
    const isInteractive = args.length == 0 && Object.keys(options).length == 0;

    await action({
      simple: options["simple"],
      all: options["all"],
      debug: options["debug"],
      logs: options["logs"],
      path,
    }, isInteractive);
  });

export default {
  action,
  command,
};
