import Tuner from "@artpani/tuner";

const baseCfg = Tuner.tune({
  data: {
    features: {
      auth: {
        times: {
          // ms
          sessionTTL: 10000000,
        },
      },
    },
    providers: {},
    repositories: {},
    commands: {
      dash: {
        hidden: false,
      },
    },
    tools: {
      tunnel: {
        hidden: false,
      },
      config: {
        hidden: false,
      },
      vault: {
        hidden: false,
      },
      git: {
        hidden: false,
      },
      clip: {
        hidden: false,
      },
      flow: {
        hidden: false,
      },
      cheat: {
        hidden: false,
      },
    },
  },
});

export default baseCfg;
export type BaseCfgType = typeof baseCfg;
