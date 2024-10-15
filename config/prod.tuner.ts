import Tuner from "@artpani/tuner";
import { BaseCfgType } from "./base.tuner.ts";

const prodCfg = Tuner.tune({
  parent: Tuner.Load.local.configDir<BaseCfgType>("base.tuner.ts"),
  data: {
    prodParam1: "specificValue1",
    prodParam2: 100,
  },
});

export default prodCfg;
export type prodCfgType = typeof prodCfg;
