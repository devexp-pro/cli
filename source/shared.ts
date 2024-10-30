import Tuner from "@artpani/tuner";
import { BaseCfgType } from "../config/base.tuner.ts";

export const config = await Tuner.use.loadConfig<BaseCfgType>({
  configDirPath: "config",
});
