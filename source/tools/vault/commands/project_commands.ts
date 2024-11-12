// source/tools/vault/commands/project_commands.ts

import { createClient, getCurrentConfig, getFullConfigKV, setCurrentConfigKV } from "../api.ts";
import { Command, green, red, Input } from "../deps.ts";
import {  TUUID } from "../GuardenDefinition.ts";
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
        Deno.exit(); // Завершаем процесс
      } catch (error) {
        console.error(red(`Ошибка: ${(error as Error).message}`));
        Deno.exit();
      }
    });
}

export function deleteProjectCommand() {
  return new Command()
    .description("Удалить проект.")
    .action(async () => {
      const projects = await getFullConfigKV();
      const { currentConfig } = await getCurrentConfig();

      if (projects === null || !projects.length) {
        console.log(red("Проекты отсутствуют."));
        Deno.exit();
      }

      const projectOptions = projects.map((p) => ({
        name: p.uuid === currentConfig?.currentProjectUUID ? `${p.name} (Текущий)` : p.name,
        value: p.uuid,
      }));

      const projectUUID = await Select.prompt({
        message: "Выберите проект для удаления:",
        options: projectOptions,
      });

      const client = await createClient();
      const response = await client.call("deleteProject", [projectUUID as TUUID]);

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

export function selectProjectCommand() {
  return new Command()
    .description("Выбрать проект.")
    .action(async () => {
      const projects = await getFullConfigKV();
      const { currentConfig } = await getCurrentConfig();

      if (projects === null || !projects.length) {
        console.log(red("Проекты отсутствуют."));
        Deno.exit();
      }

      const projectOptions = projects.map((p) => ({
        name: p.uuid === currentConfig?.currentProjectUUID ? `${p.name} (Текущий)` : p.name,
        value: p.uuid,
      }));

      const selectedProjectUUID = await Select.prompt({
        message: "Выберите проект:",
        options: projectOptions,
      });

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

export function renameProjectCommand() {
  return new Command()
    .description("Переименовать проект.")
    .action(async () => {
      const projects = await getFullConfigKV();
      const { currentConfig } = await getCurrentConfig();

      if (projects === null || !projects.length) {
        console.log(red("Проекты отсутствуют."));
        Deno.exit();
      }

      const projectOptions = projects.map((p) => ({
        name: p.uuid === currentConfig?.currentProjectUUID ? `${p.name} (Текущий)` : p.name,
        value: p.uuid,
      }));

      const projectUUID = await Select.prompt({
        message: "Выберите проект для переименования:",
        options: projectOptions,
      });

      const newProjectName = await Input.prompt("Введите новое имя проекта:");
      const client = await createClient();
      const response = await client.call("updateProject", [projectUUID as TUUID, newProjectName]);

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
