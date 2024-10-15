import Tuner from "@artpani/tuner";

const baseCfg = Tuner.tune({
  env: {
    STRING_ENV: Tuner.Env.getString.orDefault("defaultString"),
    NUMBER_ENV: Tuner.Env.getNumber.orNothing(),
    BOOLEAN_ENV: Tuner.Env.getBoolean.orExit(),
    COMPUTED_ENV: Tuner.Env.getString.orCompute(() => "computedValue"),
  },
  data: {
    baseParam1: "baseValue1",
    baseParam2: 42,
  },
});

export default baseCfg;
export type BaseCfgType = typeof baseCfg;
