import { prompt } from "@cliffy/prompt/prompt";
import { Command } from "@cliffy/command";
import { ensureDir } from "@std/fs";
import { Input } from "@cliffy/prompt/input";
import { Confirm } from "@cliffy/prompt";
import { config } from "$/constants";

async function getPackageVersion(): Promise<string> {
  try {
    const jsonText = await Deno.readTextFile("./deno.json");
    const packageJson = JSON.parse(jsonText);
    return packageJson.version;
  } catch (error) {
    console.error("Error reading package version:", error);
    return "unknown";
  }
}

const displayIntro = async () => {
  const version = await getPackageVersion();
  console.log(`
⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️
⚙️ ████████╗██╗   ██╗███╗   ██╗███████╗██████╗ ⚙️
⚙️ ╚══██╔══╝██║   ██║████╗  ██║██╔════╝██╔══██╗⚙️  Version: ${version}
⚙️    ██║   ██║   ██║██╔██╗ ██║█████╗  ██████╔╝⚙️  CLI Configuration Generator
⚙️    ██║   ██║   ██║██║╚██╗██║██╔══╝  ██╔══██╗⚙️  Author: @artpani4 & @vseplet
⚙️    ██║   ╚██████╔╝██║ ╚████║███████╗██║  ██║⚙️  Use "help" for more commands
⚙️    ╚═╝    ╚═════╝ ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝⚙️
⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️
    `);
};

const generateBaseConfig = async (directory: string) => {
  const baseConfigContent = `
import Tuner from 'jsr:@artpani/tuner';

const baseCfg = Tuner.tune({
  env: {
    STRING_ENV: Tuner.Env.getString.orDefault('defaultString'),
    NUMBER_ENV: Tuner.Env.getNumber.orNothing(),
    BOOLEAN_ENV: Tuner.Env.getBoolean.orExit(),
    COMPUTED_ENV: Tuner.Env.getString.orCompute(() => 'computedValue'),
  },
  data: {
    baseParam1: 'baseValue1',
    baseParam2: 42,
  },
});

export default baseCfg;
export type BaseCfgType = typeof baseCfg;
`;

  const baseConfigFilePath = `${directory}/base.tuner.ts`;
  await Deno.writeTextFile(
    baseConfigFilePath,
    baseConfigContent.trim(),
  );
  console.log(`Base config created at: ${baseConfigFilePath}`);
};

const generateDevProdConfig = async (
  directory: string,
  configName: string,
) => {
  const configContent = `
import Tuner from 'jsr:@artpani/tuner';
import { BaseCfgType } from './base.tuner.ts';

const ${configName}Cfg = Tuner.tune({
  parent: Tuner.Load.local.configDir<BaseCfgType>('base.tuner.ts'),
  data: {
    ${configName}Param1: 'specificValue1',
    ${configName}Param2: 100,
  },
});

export default ${configName}Cfg;
export type ${configName}CfgType = typeof ${configName}Cfg;
`;

  const configFilePath = `${directory}/${configName}.tuner.ts`;
  await Deno.writeTextFile(configFilePath, configContent.trim());
  console.log(`${configName} config created at: ${configFilePath}`);
};

const createConfig = async () => {
  // await displayIntro();
  const { directory } = await prompt([
    {
      name: "directory",
      message: "Choose the directory where the config will be created:",
      type: Input,
      default: "./config",
    },
  ]);

  const { createDevProd } = await prompt([
    {
      name: "createDevProd",
      message: "Do you want to create dev and prod configs with a base config?",
      type: Confirm,
      default: true,
    },
  ]);

  if (createDevProd) {
    await ensureDir(directory!);

    await generateBaseConfig(directory!);

    await generateDevProdConfig(directory!, "dev");
    await generateDevProdConfig(directory!, "prod");

    console.log("Dev and Prod configs created successfully!");
  } else {
    const { configName, includeDefaults } = await prompt([
      {
        name: "configName",
        message: "Enter the configuration name:",
        type: Input,
        default: "defaultConfig",
      },
      {
        name: "includeDefaults",
        message: "Include default parameters?",
        type: Confirm,
        default: true,
      },
    ]);

    const configDirPath = `${directory}/${configName}`;
    await ensureDir(configDirPath);
    const configFilePath = `${configDirPath}/${configName}.tuner.ts`;

    const configContent = `
import Tuner from 'jsr:@artpani/tuner';

const cfg = Tuner.tune({
  data: {
    parameter1: 'value1',
    parameter2: 100,
    parameter3: true,
    ${includeDefaults ? "// Add more default parameters here" : ""}
  },
});

export default cfg;
export type ${configName}Type = typeof cfg;
`;

    await Deno.writeTextFile(configFilePath, configContent.trim());
    console.log(`Config created at: ${configFilePath}`);
  }
};

const tool = new Command()
  .name("config")
  // .version("0.1.0")
  .description("generate configuration files")
  .action(createConfig);

if (config.data.tools.config.hidden) tool.hidden();

export default tool;
