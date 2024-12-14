import { Select, Input } from "@cliffy/prompt";
import { getFullConfigKV } from "../../api.ts";
import { inviteUserToProject } from "./invite_low_level_handlers.ts";
import { TUUID } from "../../GuardenDefinition.ts";

export async function interactiveInviteUser() {
  const projects = await getFullConfigKV();
  if (!projects) {
    throw new Error("No projects available.");
  }

  const projectUUID = await Select.prompt({
    message: "Select a project to invite the user to:",
    options: projects.map((project) => ({
      name: project.name,
      value: project.uuid,
    })),
  });

  const userEmail = await Input.prompt("Enter the email of the user to invite:");
  await inviteUserToProject(projectUUID as TUUID, userEmail);
}
