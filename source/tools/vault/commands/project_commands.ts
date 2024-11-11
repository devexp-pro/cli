

import { kv } from "$/kv";
import { createClient, getCurrentConfig, setCurrentProject, setCurrentEnv } from "../api.ts";
import { Command, green, red } from "../deps.ts";
import { ProjectData, TUUID } from "../GuardenDefinition.ts";
import { Select } from "@cliffy/prompt/select";


export async function setFullConfigKV(projects: ProjectData[]): Promise<void> {
  try {
    await kv.set(["service", "vault", "fullConfig"], projects);
    console.log(green("Полная конфигурация успешно обновлена."));
  } catch (error) {
    console.error(red("Ошибка при сохранении полной конфигурации:"), error.message);
  }
}

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



export async function syncProjects() {
  try {
    const client = await createClient();
    const [response, error] = await client.get();

    if (error) {
      console.error(red("Ошибка при синхронизации проектов."));
      return;
    }

    const projects = response!.state.projects!;
    if (projects===undefined || projects.length === 0) {
      console.log(red("Проекты отсутствуют."));
      return;
    }

    
    await setFullConfigKV(projects as ProjectData[]);

    const { currentConfig } = await getCurrentConfig();
    const currentProjectUUID = currentConfig?.currentProjectUUID;
    const currentEnvUUID = currentConfig?.currentEnvUUID;

    let projectUpdated = false;
    let envUpdated = false;

    
    if (!currentConfig) {
      const defaultProject = projects[0] as ProjectData;
      await setCurrentProject(defaultProject.name, defaultProject.uuid);

      if (defaultProject.environments && defaultProject.environments.length > 0) {
        const defaultEnv = defaultProject.environments[0];
        await setCurrentEnv(defaultEnv.name, defaultEnv.uuid);
      } else {
        await setCurrentEnv(null, null);
      }

      console.log(green("Текущий проект и окружение установлены по умолчанию."));
      return;
    }

    for (const project of projects as ProjectData[]) {
      if (project.uuid === currentProjectUUID) {
        if (project.name !== currentConfig.currentProjectName) {
          await setCurrentProject(project.name, project.uuid);
          console.log(green(`Обновлено имя текущего проекта: ${project.name}`));
          projectUpdated = true;
        }

        if (!project.environments || project.environments.length === 0) {
          await setCurrentEnv(null, null);
          console.log(green("Окружения для текущего проекта отсутствуют, сброс текущего окружения."));
          envUpdated = true;
        } else {
          for (const env of project.environments) {
            if (env.uuid === currentEnvUUID && env.name !== currentConfig.currentEnvName) {
              await setCurrentEnv(env.name, env.uuid);
              console.log(green(`Обновлено имя текущего окружения: ${env.name}`));
              envUpdated = true;
            }
          }
        }
      }
    }

    if (!projectUpdated && !envUpdated) {
      console.log(green("Синхронизация завершена. Изменений не найдено."));
    }
  } catch (error) {
    console.error(red("Ошибка синхронизации проектов:"), error.message);
    Deno.exit();
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

        await setCurrentProject(response.project!.name, response.project!.uuid);
        await setCurrentEnv(response.project?.environments[0].name, response.project?.environments[0].uuid);
        console.log(green(`Проект '${projectName}' успешно создан.`));
      } catch (error) {
        console.error(red(`Ошибка: ${(error as Error).message}`));
        Deno.exit();
      }
    });
}

export function deleteProjectCommand() {
  return new Command()
    .description("Удалить проект.")
    .arguments("<projectUUID:string>")
    .action(async (_options: any, projectUUID: string) => {
      const client = await createClient();
      const response = await client.call("deleteProject", [projectUUID as TUUID]);

      if (!response.success) {
        console.error(red(`Не удалось удалить проект: ${response.message}`));
        return;
      }

      const { currentConfig } = await getCurrentConfig();
      if (currentConfig?.currentProjectUUID === projectUUID) {
        console.log(red("Удален текущий проект, сброс текущей конфигурации."));
        await setCurrentProject(null, null);
        await setCurrentEnv(null, null);
      }

      console.log(green(`Проект '${projectUUID}' успешно удален.`));
    });
}

export function selectProjectCommand() {
  return new Command()
    .description("Выбрать проект.")
    .action(async () => {
      const client = await createClient();
      const [response, error] = await client.get();
  return new Command()
    .description("Выбрать проект.")
    .action(async () => {
      const client = await createClient();
      const [response, error] = await client.get();

      if (error) {
        console.error(red("Ошибка при получении списка проектов."));
        return;
      }
      if (error) {
        console.error(red("Ошибка при получении списка проектов."));
        return;
      }

      const projects = response!.state!.projects!;
      if (projects.length === 0) {
        console.log(red("Проекты отсутствуют."));
        return;
      }

      const projectOptions = projects.map((p) => ({ name: p!.name, value: p!.uuid }));
      const selectedProjectUUID = await Select.prompt({
        message: "Выберите проект:",
        options: projectOptions,
      });

      const selectedProject = projects.find((p) => p!.uuid === selectedProjectUUID);
      if (selectedProject) {
        await setCurrentProject(selectedProject.name, selectedProject.uuid);
      } else {
        console.error(red("Проект не найден."));
      }
    });
})}

export function renameProjectCommand() {
  return new Command()
    .description("Переименовать проект.")
    .arguments("<newProjectName:string>")
    .action(async (_options: any, newProjectName: string) => {
      const { currentConfig } = await getCurrentConfig();
      const projectUUID = currentConfig?.currentProjectUUID;

      if (!projectUUID) {
        console.error(red("Текущий проект не выбран. Переименование невозможно."));
        return;
      }

      const client = await createClient();
      const response = await client.call("updateProject", [projectUUID, newProjectName]);

      if (!response.success) {
        console.error(red(`Не удалось переименовать проект: ${response.message}`));
        return;
      }

      if (currentConfig?.currentProjectUUID === projectUUID) {
        await setCurrentProject(newProjectName, projectUUID);
        console.log(green(`Проект переименован и обновлен в текущей конфигурации.`));
      } else {
        console.log(green(`Проект переименован в '${newProjectName}'.`));
      }
    });
}

