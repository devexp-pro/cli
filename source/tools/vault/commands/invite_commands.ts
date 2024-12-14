import { Command } from "@cliffy/command";
import { interactiveInviteUser } from "../handlers/invite/invite_interactive_handlers.ts";
import { getFullConfigKV } from "../config_sync.ts";
import { inviteUserToProject } from "../handlers/invite/invite_low_level_handlers.ts";
import { TUUID } from "../GuardenDefinition.ts";

const inviteCommand = new Command()
  .description("Invite a user to a project.")
  .option("--project-name <projectName:string>", "Project name.")
  .option("--email <email:string>", "User's email to invite.")
  .example(
    "invite --project-name=MyProject --email=user@example.com",
    "Invite user to the specified project.",
  )
  .example("invite", "Open the menu to invite users.")
  .action(async (options) => {
    if (options.projectName && options.email) {
      const projects = await getFullConfigKV();
      const project = projects?.find((p) => p.name === options.projectName);
      if (!project) {
        throw new Error(`Project '${options.projectName}' not found.`);
      }

      await inviteUserToProject(project.uuid, options.email);
    } else {
      await interactiveInviteUser();
    }
    Deno.exit()
  });

export default inviteCommand;
