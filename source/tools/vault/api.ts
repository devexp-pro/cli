import projectHandlers from "./handlers/project/project_handlers.ts";
import envHandlers from "./handlers/env/env_handlers.ts";
import secretHandlers from "./handlers/secret/secret_handlers.ts";
import { inviteUserToProject } from "./handlers/invite/invite_low_level_handlers.ts";
import { interactiveInviteUser } from "./handlers/invite/invite_interactive_handlers.ts";
import { executeCommandWithSecrets } from "./handlers/run/run_low_level_handlers.ts";

const vaultHandlers = {
  projects: {
    rename: projectHandlers.rename,
    create: projectHandlers.create,
    delete: projectHandlers.delete,
    select: projectHandlers.select,
    view: projectHandlers.view,
  },
  environments: {
    rename: envHandlers.rename,
    create: envHandlers.create,
    delete: envHandlers.delete,
    select: envHandlers.select,
    view: envHandlers.view,
    loadEnv: envHandlers.loadEnv,
  },
  secrets: {
    rename: secretHandlers.update,
    create: secretHandlers.add,
    delete: secretHandlers.delete,
    fetch: secretHandlers.fetch,
  },
  invite: {
    user: {
      byProject: inviteUserToProject,
      interactive: interactiveInviteUser,
    },
  },
  run: {
    command: executeCommandWithSecrets,
  },
};

export default vaultHandlers;
