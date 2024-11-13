// source/tools/vault/commands/project_commands.ts

import { createClient, getCurrentConfig, getFullConfigKV, setCurrentConfigKV } from "../api.ts";
import { Command, green, red, Input } from "../deps.ts";
import { TUUID } from "../GuardenDefinition.ts";
import { Select } from "@cliffy/prompt/select";

export async function displayCurrentProjectInfo() {
  const { currentConfig } = await getCurrentConfig();

  if (!currentConfig || !currentConfig.currentProjectName) {
    console.log(red("Текущий проект не выбран."));
    return;
  }

  console.log(green(`Текущий проект: ${currentConfig.currentProjectName}`));
  if (currentConfig.currentEnvName) {
    console.log(green(`Текущее окружение: ${currentConfig.currentEnvName}`));
  } else {
    console.log(red("Окружение не выбрано."));
  }
}

export function createProjectCommand() {
  return new Command()
    .description("Создать новый проект.")
    .arguments("<projectName:string>")
    .action(async (_options: any, projectName: string) => {
      try {
        const client = await createClient();
        const response = await client.call("createProject", [projectName]);

        if (!response.success) {
          throw new Error(`Не удалось создать проект: ${response.message}`);
        }

        await setCurrentConfigKV({
          currentProjectName: response.project!.name,
          currentProjectUUID: response.project!.uuid,
          currentEnvName: response.project?.environments[0]?.name || null,
          currentEnvUUID: response.project?.environments[0]?.uuid || null,
        });

        console.log(green(`Проект '${projectName}' успешно создан.`));
        Deno.exit();
      } catch (error) {
        console.error(red(`Ошибка: ${(error as Error).message}`));
        Deno.exit();
      }
    });
}

export function deleteProjectCommand() {
  return new Command()
    .description("Удалить проект.")
    .option("--project-name <projectName:string>", "Название проекта для удаления.")
    .action(async (options) => {
      const projects = await getFullConfigKV();
      const { currentConfig } = await getCurrentConfig();

      if (projects === null || !projects.length) {
        console.log(red("Проекты отсутствуют."));
        Deno.exit();
      }

      let projectUUID: TUUID;
      if (options.projectName) {
        const project = projects.find((p) => p.name === options.projectName);
        if (!project) {
          console.log(red(`Проект с именем ${options.projectName} не найден.`));
          Deno.exit();
        }
        projectUUID = project.uuid;
      } else {
        const projectOptions = projects.map((p) => ({
          name: p.uuid === currentConfig?.currentProjectUUID ? `${p.name} (Текущий)` : p.name,
          value: p.uuid,
        }));
        projectUUID = (await Select.prompt({
          message: "Выберите проект для удаления:",
          options: projectOptions,
        })) as TUUID;
      }

      const client = await createClient();
      const response = await client.call("deleteProject", [projectUUID]);

      if (!response.success) {
        console.error(red(`Не удалось удалить проект: ${response.message}`));
        Deno.exit();
      }

      if (currentConfig?.currentProjectUUID === projectUUID) {
        console.log(red("Удален текущий проект, сброс текущей конфигурации."));
        await setCurrentConfigKV({
          currentProjectName: null,
          currentProjectUUID: null,
          currentEnvName: null,
          currentEnvUUID: null,
        });
      }

      console.log(green(`Проект успешно удален.`));
      Deno.exit();
    });
}

export function renameProjectCommand() {
  return new Command()
    .description("Переименовать проект.")
    .option("--old-name <oldName:string>", "Старое имя проекта.")
    .option("--new-name <newName:string>", "Новое имя проекта.")
    .action(async (options) => {
      const projects = await getFullConfigKV();
      const { currentConfig } = await getCurrentConfig();

      if (projects === null || !projects.length) {
        console.log(red("Проекты отсутствуют."));
        Deno.exit();
      }

      let projectUUID: TUUID;
      let newProjectName: string;

      if (options.oldName && options.newName) {
        const project = projects.find((p) => p.name === options.oldName);
        if (!project) {
          console.log(red(`Проект с именем ${options.oldName} не найден.`));
          Deno.exit();
        }
        projectUUID = project.uuid;
        newProjectName = options.newName;
      } else {
        const projectOptions = projects.map((p) => ({
          name: p.uuid === currentConfig?.currentProjectUUID ? `${p.name} (Текущий)` : p.name,
          value: p.uuid,
        }));

        projectUUID = (await Select.prompt({
          message: "Выберите проект для переименования:",
          options: projectOptions,
        })) as TUUID;

        newProjectName = await Input.prompt("Введите новое имя проекта:");
      }

      const client = await createClient();
      const response = await client.call("updateProject", [projectUUID, newProjectName]);

      if (!response.success) {
        console.error(red(`Не удалось переименовать проект: ${response.message}`));
        Deno.exit();
      }

      if (currentConfig?.currentProjectUUID === projectUUID) {
        await setCurrentConfigKV({
          ...currentConfig,
          currentProjectName: newProjectName,
        });
        console.log(green("Текущий проект переименован и обновлен в конфигурации."));
      } else {
        console.log(green(`Проект переименован в '${newProjectName}'.`));
      }
      Deno.exit();
    });
}

export  function selectProjectCommand() {
  return new Command()
    .description("Выбрать проект.")
    .option("--project-name <projectName:string>", "Имя проекта для выбора.")
    .action(async (options) => {
      const projects = await getFullConfigKV();
      const { currentConfig } = await getCurrentConfig();

      if (projects === null || !projects.length) {
        console.log(red("Проекты отсутствуют."));
        Deno.exit();
      }

      let selectedProjectUUID: TUUID;

      if (options.projectName) {
        const project = projects.find((p) => p.name === options.projectName);
        if (!project) {
          console.log(red(`Проект с именем ${options.projectName} не найден.`));
          Deno.exit();
        }
        selectedProjectUUID = project.uuid;
      } else {
        const projectOptions = projects.map((p) => ({
          name: p.uuid === currentConfig?.currentProjectUUID ? `${p.name} (Текущий)` : p.name,
          value: p.uuid,
        }));
        
        selectedProjectUUID =( await Select.prompt({
          message: "Выберите проект:",
          options: projectOptions,
        })) as TUUID;
      }

      const selectedProject = projects.find((p) => p.uuid === selectedProjectUUID);
      if (selectedProject) {
        await setCurrentConfigKV({
          currentProjectName: selectedProject.name,
          currentProjectUUID: selectedProject.uuid,
          currentEnvName: selectedProject.environments[0]?.name || null,
          currentEnvUUID: selectedProject.environments[0]?.uuid || null,
        });
        console.log(green(`Выбран проект: ${selectedProject.name}`));
      } else {
        console.error(red("Проект не найден."));
      }
      Deno.exit();
    });
}
