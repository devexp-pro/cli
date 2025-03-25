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
      vault: {
        hidden: false,
      },
      flow: {
        hidden: true,
      },
      config: {
        hidden: true,
      },
      git: {
        hidden: false,
      },
      clip: {
        hidden: false,
      },
      cheat: {
        hidden: true,
      },
    },
  },
});

export default prodCfg;
export type prodCfgType = typeof prodCfg;
