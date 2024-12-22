import { BASE_REPO_PATH, MODE, MODE_TYPE } from "$/providers/version.ts";
import { BaseCfgType } from "$config/base.tuner.ts";
import { kv } from "$/repositories/kv.ts";
import Tuner from "@artpani/tuner";

export const loadConfig = async () => {
  if (MODE == MODE_TYPE.LOCAL_DEV) {
    return await Tuner.use.loadConfig<BaseCfgType>({
      absolutePathPrefix: undefined,
      configDirPath: "./config",
      configName: "dev",
    });
  } else if (MODE == MODE_TYPE.LOCAL_PROD) {
    return await Tuner.use.loadConfig<BaseCfgType>({
      absolutePathPrefix: undefined,
      configDirPath: "./config",
      configName: "prod",
    });
  } else if (MODE == MODE_TYPE.REMOTE_TAG) {
    return await Tuner.use.loadConfig<BaseCfgType>({
      absolutePathPrefix: BASE_REPO_PATH,
      configDirPath: "./config",
      configName: "prod",
    });
  } else if (MODE == MODE_TYPE.REMOTE_BRANCH) {
    const kvTunerConfig = (await kv.get(["tuner", "config"]))
      .value as BaseCfgType;
    if (kvTunerConfig) {
      return kvTunerConfig;
    } else {
      const config = await Tuner.use.loadConfig<BaseCfgType>({
        absolutePathPrefix: BASE_REPO_PATH,
        configDirPath: "./config",
        configName: "dev",
      });
      await kv.set(["tuner", "config"], config);
      return config;
    }
  } else {
    console.log(`Cannot get config for mode ${MODE}, using dev`);
    return await Tuner.use.loadConfig<BaseCfgType>({
      absolutePathPrefix: undefined,
      configDirPath: "./config",
      configName: "dev",
    });
  }
};

export const config = await loadConfig();
