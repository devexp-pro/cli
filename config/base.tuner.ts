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
      alias: {
        hidden: false,
      },
      db: {
        hidden: true,
      },
      term: {
        hidden: true,
      },
      hyper: {
        hidden: false,
      },
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
        hidden: false,
      },
      clip: {
        hidden: false,
      },
      flow: {
        hidden: false,
      },
      llm: {
        hidden: false,
      },
      shortcuts: {
        hidden: true,
      },
    },

    integrations: {
      hidden: false,
    },
  },
});

export default baseCfg;
export type BaseCfgType = typeof baseCfg;
