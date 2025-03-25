import { BASE_REPO_PATH, MODE, MODE_TYPE } from "$/providers/version.ts";
import { BaseCfgType } from "$config/base.tuner.ts";
import Tuner from "@artpani/tuner";

export const loadConfig = async () => {
  console.log(MODE);
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
    [MODE_TYPE.REMOTE_TAG]: {
      absolutePathPrefix: BASE_REPO_PATH,
      configName: "prod",
    },
    [MODE_TYPE.REMOTE_BRANCH]: {
      absolutePathPrefix: BASE_REPO_PATH,
      configName: "dev",
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
