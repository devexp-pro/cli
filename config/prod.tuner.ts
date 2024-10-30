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
      tunnel: {
        hidden: false,
      },
      config: {
        hidden: true,
      },
      vault: {
        hidden: false,
      },
      git: {
        hidden: true,
      },
      clip: {
        hidden: false,
      },
    },
  },
});

export default prodCfg;
export type prodCfgType = typeof prodCfg;
