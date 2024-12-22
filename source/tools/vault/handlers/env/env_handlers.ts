import * as lowLevel from "./env_low_level_handlers.ts";
import * as midLevel from "./env_mid_level_handlers.ts";
import * as interactive from "./env_interactive_handlers.ts";

const envHandlers = {
  create: {
    byName: lowLevel.createEnvironment,
    interactive: interactive.interactiveCreateEnvironment,
  },
  delete: {
    byUUID: lowLevel.deleteEnvironmentByUUID,
    byName: midLevel.deleteEnvironmentByName,
    interactive: interactive.interactiveDeleteEnvironment,
  },
  rename: {
    byUUID: lowLevel.renameEnvironmentByUUID,
    byName: midLevel.renameEnvironmentByName,
    interactive: interactive.interactiveRenameEnvironment,
  },
  select: {
    byUUID: lowLevel.selectEnvironmentByUUID,
    byName: midLevel.selectEnvironmentByName,
    interactive: interactive.interactiveSelectEnvironment,
  },
  view: {
    current: lowLevel.viewCurrentEnv,
  },
  loadEnv: {
    byUUID: lowLevel.loadEnvironmentVariablesByUUID,
    byName: midLevel.loadEnvironmentVariablesByName,
    interactive: interactive.interactiveLoadEnvFile,
  },
};

export default envHandlers;
