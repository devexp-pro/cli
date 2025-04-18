import { BASE_REPO_PATH, MODE, MODE_TYPE } from "$/constants";
import { BaseCfgType } from "$config/base.tuner.ts";
import Tuner from "@artpani/tuner";
import "$config/base.tuner.ts";
import "$config/dev.tuner.ts";
import "$config/prod.tuner.ts";

export const loadConfig = async () => {
  if (!MODE || !(MODE in MODE_TYPE)) {
    console.log(`Cannot get config for mode ${MODE ?? "undefined"}, using dev`);
  }

  const configMap: Record<
    keyof typeof MODE_TYPE,
    { absolutePathPrefix?: string; configName: string }
  > = {
    [MODE_TYPE.LOCAL_DEV]: {
      absolutePathPrefix: undefined,
      configName: "dev",
    },
    [MODE_TYPE.LOCAL_PROD]: {
      absolutePathPrefix: undefined,
      configName: "prod",
    },
    [MODE_TYPE.REMOTE_DEV]: {
      absolutePathPrefix: BASE_REPO_PATH,
      configName: "dev",
    },
    [MODE_TYPE.REMOTE_PROD]: {
      absolutePathPrefix: BASE_REPO_PATH,
      configName: "prod",
    },
  };

  const config = configMap[MODE as keyof typeof MODE_TYPE];

  return await Tuner.use.loadConfig<BaseCfgType>({
    ...config,
    configDirPath: "./config",
    add_salt_to_path: false,
  });
};

export const config = await loadConfig();
