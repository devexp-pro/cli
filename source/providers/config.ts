import { BASE_REPO_PATH, IS_DEVELOP, IS_REMOTE } from "$/constants";
import { BaseCfgType } from "$config/base.tuner.ts";
import { kv } from "$/repositories/kv.ts";
import Tuner from "@artpani/tuner";

export const loadConfig = async () => {
  if (IS_REMOTE) {
    const kvTunerConfig = (await kv.get(["tuner", "config"]))
      .value as BaseCfgType;
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

export const config = await loadConfig();
