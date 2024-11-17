import { renderMarkdown } from "@littletof/charmd";
import { Command } from "@cliffy/command";
import { BASE_REPO_PATH, IS_DEVELOP, IS_REMOTE } from "$/constants";
import Tuner from "@artpani/tuner";
import { BaseCfgType } from "$config/base.tuner.ts";
import { kv } from "$/kv";

export async function fetchJSON(url: URL | string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Response not OK (${response.status})`);
  return await response.json();
}

export const loadConfig = async () => {
  if (IS_REMOTE) {
    const kvTunerConfig = (await kv.get(["tuner", "config"])).value;
    if (kvTunerConfig) {
      return kvTunerConfig;
    } else {
      const config = await Tuner.use.loadConfig<BaseCfgType>({
        absolutePathPrefix: BASE_REPO_PATH,
        configDirPath: "./config",
        configName: IS_DEVELOP ? "dev" : "prod",
      });
      await kv.set(["tuner", "config"], config);
      return config;
    }
  } else {
    return await Tuner.use.loadConfig<BaseCfgType>({
      absolutePathPrefix: undefined,
      configDirPath: "./config",
      configName: IS_DEVELOP ? "dev" : "prod",
    });
  }
};

export const addMAN = (command: Command, type: "tools" = "tools") => {
  const nameOfParentCommand = command.getName();

  const manCommand = new Command()
    .name("man")
    .description(`user manual for '${nameOfParentCommand}'`)
    .action(() => {
      const pathToMan = `./source/${type}/${nameOfParentCommand}/MAN.md`;
      if (!nameOfParentCommand) Deno.exit(-1);

      try {
        Deno.lstatSync(pathToMan);
        console.clear();
        console.log(renderMarkdown(
          Deno.readTextFileSync(pathToMan),
        ));
        Deno.exit(0);
      } catch (e) {
        console.log(` user manual for '${nameOfParentCommand}' not found =(`);
        Deno.exit(-1);
      }
    });

  command.command(
    "man",
    manCommand,
  );

  return command;
};
