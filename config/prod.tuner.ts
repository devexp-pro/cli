import Tuner from "@artpani/tuner";
import { BaseCfgType } from "./base.tuner.ts";

const prodCfg = Tuner.tune({
  parent: Tuner.Load.local.configDir<BaseCfgType>("base.tuner.ts"),

  data: {
    features: {
      auth: {
        times: {
          // ms
          sessionTTL: 24 * 60 * 60 * 1000, // 1 day
        },
      },
    },
    commands: {
      dash: {
        hidden: true,
      },
    },
    tools: {
      config: {
        hidden: true,
      },
      cheat: {
        hidden: true,
      },
    },
  },
});

export default prodCfg;
export type prodCfgType = typeof prodCfg;
