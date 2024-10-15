import Tuner from "@artpani/tuner";
import { BaseCfgType } from "./base.tuner.ts";

const devCfg = Tuner.tune({
  parent: Tuner.Load.local.configDir<BaseCfgType>("base.tuner.ts"),
  data: {
    devParam1: "specificValue1",
    devParam2: 100,
  },
});

export default devCfg;
export type devCfgType = typeof devCfg;
