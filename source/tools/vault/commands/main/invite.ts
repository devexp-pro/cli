// source/tools/vault/commands/main/invite.ts

import { Command } from "@cliffy/command";
import { Select } from "@cliffy/prompt/select";
import { green, Input, red } from "../../deps.ts";
import { getFullConfigKV, syncProjects } from "../../api.ts";
import { createClient } from "../../api.ts";
import { displayCurrentProjectInfo } from "../project_commands.ts";
import { TUUID } from "../../GuardenDefinition.ts";

async function inviteUserToProject(projectUUID: TUUID, userEmail: string) {
  try {
    const client = await createClient();
    const response = await client.call("inviteUser", [projectUUID, userEmail]);

    if (!response.success) {
      console.error(`Failed to invite user: ${response.message}`);
      return;
    }

    console.log(
      green(
        `User with email '${userEmail}' was successfully invited to the project.`,
      ),
    );
  } catch (error) {
    console.error(red(`Error: ${(error as Error).message}`));
  }
}

async function findProjectUUIDByName(
  projectName: string,
): Promise<TUUID | null> {
  const projects = await getFullConfigKV();
  if (!projects) {
    console.error(red("Projects are missing in the local config."));
    return null;
  }

  const project = projects.find((p) => p.name === projectName);
  if (!project) {
    console.error(red(`Project with name '${projectName}' not found.`));
    return null;
  }
  return project.uuid;
}

const inviteMenu = async () => {
  await syncProjects();
  await displayCurrentProjectInfo();

  const projects = await getFullConfigKV();
  if (projects === null) {
    console.log(red("No projects available."));
    Deno.exit();
  }

  const projectUUID = await Select.prompt({
    message: "Select a project to invite the user to:",
    options: projects.map((project) => ({
      name: project.name,
      value: project.uuid,
    })),
  });

  const userEmail = await Input.prompt(
    "Enter the email of the user to invite:",
  );

  await inviteUserToProject(projectUUID as TUUID, userEmail);
};

const inviteCommand = new Command()
  .description("Invite a user to a project.")
  .option("--project-name <projectName:string>", "Project name.")
  .option("--email <email:string>", "User's email to invite.")
  .example(
    "invite --project-name=MyProject --email=user@example.com",
    "Invite user with email 'user@example.com' to project 'MyProject'.",
  )
  .example("invite", "Open the menu to invite users")
  .action(async (options) => {
    await syncProjects();
    await displayCurrentProjectInfo();

    if (options.projectName && options.email) {
      const projectUUID = await findProjectUUIDByName(options.projectName);
      if (!projectUUID) {
        console.error(red(`Project '${options.projectName}' not found.`));
        Deno.exit();
      }

      await inviteUserToProject(projectUUID, options.email);
    } else {
      await inviteMenu();
    }

    Deno.exit();
  });

export default inviteCommand;
