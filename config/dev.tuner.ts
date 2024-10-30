import Tuner from "@artpani/tuner";
import { BaseCfgType } from "./base.tuner.ts";

const devCfg = Tuner.tune({
  parent: Tuner.Load.local.configDir<BaseCfgType>("base.tuner.ts"),
  data: {
    features: {
      auth: {
        times: {
          // ms
          sessionTTL: 20*60*1000, //2 min
        },
      },
    },
  },
});

export default devCfg;
export type devCfgType = typeof devCfg;
