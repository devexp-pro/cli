import Tuner from "@artpani/tuner";
import { BaseCfgType } from "./base.tuner.ts";

const devVsepletCfg = Tuner.tune({
  parent: Tuner.Load.local.configDir<BaseCfgType>("base.tuner.ts"),
  data: {
    features: {
      auth: {
        times: {
          // ms
          sessionTTL: 20 * 60 * 1000, //2 min
        },
      },
    },
  },
});

export default devVsepletCfg;
export type devVsepletCfgType = typeof devVsepletCfg;
