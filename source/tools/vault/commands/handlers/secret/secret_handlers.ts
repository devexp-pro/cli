import * as lowLevel from "./secret_low_level_handlers.ts";
import * as midLevel from "./secret_mid_level_handlers.ts";
import * as interactive from "./secret_interactive_handlers.ts";

const secretHandlers = {
  add: {
    byUUID: lowLevel.addSecret,
    byName: midLevel.addSecretByName,
    interactive: interactive.interactiveAddSecret,
  },
  update: {
    byUUID: lowLevel.updateSecret,
    byName: midLevel.updateSecretByName,
    interactive: interactive.interactiveUpdateSecret,
  },
  delete: {
    byUUID: lowLevel.deleteSecret,
    byName: midLevel.deleteSecretByName,
    interactive: interactive.interactiveDeleteSecret,
  },
  fetch: {
    byUUID: lowLevel.fetchSecrets,
    byName: midLevel.fetchSecretsByName,
    interactive: interactive.interactiveFetchSecrets,
  },
};

export default secretHandlers;
