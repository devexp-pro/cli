import * as lowLevel from "./project_low_level_handlers.ts";
import * as midLevel from "./project_mid_level_handlers.ts";
import * as interactive from "./project_interactive_handlers.ts";

const projectHandlers = {
  rename: {
    byUUID: lowLevel.renameProjectByUUID,
    byName: midLevel.renameProjectByName,
    interactive: interactive.interactiveRenameProject,
  },
  create: {
    byName: lowLevel.createProject,
    interactive: interactive.interactiveCreateProject,
  },
  delete: {
    byUUID: lowLevel.deleteProjectByUUID,
    byName: midLevel.deleteProjectByName,
    interactive: interactive.interactiveDeleteProject,
  },
  select: {
    byUUID: lowLevel.selectProjectByUUID,
    byName: midLevel.selectProjectByName,
    interactive: interactive.interactiveSelectProject,
  },
  view: {
    current: lowLevel.viewCurrentProject,
  },
};

export default projectHandlers;
