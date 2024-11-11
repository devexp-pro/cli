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
      alias: {
        hidden: false,
      },
    },
  },
});

export default baseCfg;
export type BaseCfgType = typeof baseCfg;
