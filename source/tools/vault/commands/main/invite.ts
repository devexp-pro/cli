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
      console.error(`Ошибка приглашения пользователя: ${response.message}`);
      return;
    }

    console.log(
      green(`Пользователь с email '${userEmail}' успешно приглашен в проект.`),
    );
  } catch (error) {
    console.error(red(`Ошибка: ${(error as Error).message}`));
  }
}

async function findProjectUUIDByName(
  projectName: string,
): Promise<TUUID | null> {
  const projects = await getFullConfigKV();
  if (!projects) {
    console.error(red("Проекты отсутствуют в локальном конфиге."));
    return null;
  }

  const project = projects.find((p) => p.name === projectName);
  if (!project) {
    console.error(red(`Проект с именем '${projectName}' не найден.`));
    return null;
  }
  return project.uuid;
}

const inviteMenu = async () => {
  await syncProjects();
  await displayCurrentProjectInfo();

  const projects = await getFullConfigKV();
  if (projects === null) {
    console.log(red("Проекты отсутствуют."));
    Deno.exit();
  }

  const projectUUID = await Select.prompt({
    message: "Выберите проект для приглашения пользователя:",
    options: projects.map((project) => ({
      name: project.name,
      value: project.uuid,
    })),
  });

  const userEmail = await Input.prompt(
    "Введите email пользователя для приглашения:",
  );

  await inviteUserToProject(projectUUID as TUUID, userEmail);
};

const inviteCommand = new Command()
  .description("Пригласить пользователя в проект.")
  .option("--project-name <projectName:string>", "Название проекта.")
  .option("--email <email:string>", "Email пользователя для приглашения.")
  .example(
    "invite --project-name=MyProject --email=user@example.com",
    "Пригласить пользователя с email 'user@example.com' в проект 'MyProject'.",
  )
  .example("invite", "Открыть меню для приглашения пользователей")
  .action(async (options) => {
    await syncProjects();
    await displayCurrentProjectInfo();

    if (options.projectName && options.email) {
      const projectUUID = await findProjectUUIDByName(options.projectName);
      if (!projectUUID) {
        console.error(red(`Проект '${options.projectName}' не найден.`));
        Deno.exit();
      }

      await inviteUserToProject(projectUUID, options.email);
    } else {
      await inviteMenu();
    }

    Deno.exit();
  });

export default inviteCommand;
