

import apifly, { ApiflyClient } from "@vseplet/apifly";
import type { GuardenDefinition, TUUID } from "./GuardenDefinition.ts";
import { getSession, kv } from "$/kv";
import { SERVICE_URL } from "$/constants";
import { red, green } from "./deps.ts";

export async function createClient(): Promise<ApiflyClient<GuardenDefinition>> {
  const session = await getSession();

  if (!session) {
    throw new Error("No SESSION! Authorize first");
  }
  if (!session.id) throw new Error("No SESSION ID! Authorize first");


  return new apifly.client<GuardenDefinition>({
    baseURL: `${SERVICE_URL}/tool/vault`,
    headers: {
      Authorization: session.key,
      Identifier: session.id,
    },
    limiter: { unlimited: true },
  });
}

interface VaultConfig {
  currentProjectName?: string | null;
  currentEnvName?: string | null;
  currentProjectUUID?: TUUID | null;
  currentEnvUUID?: TUUID | null;
}


async function getCurrentConfigKV(): Promise<VaultConfig | null> {
  try {
    const configData = await kv.get<VaultConfig>(["service", "vault", "curConfig"]);
    return configData.value || null;
  } catch (error) {
    console.error("Ошибка при получении текущей конфигурации:", error);
    return null;
  }
}

async function getFullConfigKV(): Promise<any | null> {
  try {
    const fullConfigData = await kv.get<any>(["service", "vault", "fullConfig"]);
    return fullConfigData.value || null;
  } catch (error) {
    console.error("Ошибка при получении полного конфига:", error);
    return null;
  }
}

async function setCurrentConfigKV(config: VaultConfig): Promise<void> {
  try {
    await kv.set(["service", "vault", "curConfig"], config);

  } catch (error) {
    console.error("Ошибка при обновлении текущей конфигурации:", error);
  }
}

async function setFullConfigKV(fullConfig: any): Promise<void> {
  try {
    await kv.set(["service", "vault", "fullConfig"], fullConfig);
    console.log(green("Полный конфиг успешно сохранен."));
  } catch (error) {
    console.error("Ошибка при сохранении полного конфига:", error);
  }
}


export async function getCurrentConfig(): Promise<{ 
  currentConfig: VaultConfig | null;
  fullConfig: any | null;
}> {
  const [currentConfig, fullConfig] = await Promise.all([
    getCurrentConfigKV(),
    getFullConfigKV(),
  ]);

  return { currentConfig, fullConfig };
}


export async function setCurrentProject(name?: string | null, uuid?: TUUID | null): Promise<void> {
  const currentConfig = await getCurrentConfigKV();
  const updatedConfig = {
    ...currentConfig,
    currentProjectName: name ?? null,
    currentProjectUUID: uuid ?? null,
  };
  await setCurrentConfigKV(updatedConfig);
}


export async function setCurrentEnv(name?: string | null, uuid?: TUUID | null): Promise<void> {
  const currentConfig = await getCurrentConfigKV();
  const updatedConfig = {
    ...currentConfig,
    currentEnvName: name ?? null,
    currentEnvUUID: uuid ?? null,
  };
  await setCurrentConfigKV(updatedConfig);
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
    if (!projects || projects.length === 0) {
      console.log(red("Проекты отсутствуют."));
      return;
    }
    console.log(projects)


    await setFullConfigKV(projects);

    const currentConfig = await getCurrentConfigKV();
    const currentProjectUUID = currentConfig?.currentProjectUUID;
    const currentEnvUUID = currentConfig?.currentEnvUUID;

    let projectUpdated = false;
    let envUpdated = false;
    for (const project of projects) {
      if (project!.uuid === currentProjectUUID) {
        if (project!.name !== currentConfig?.currentProjectName) {
          await setCurrentProject(project!.name!, project!.uuid!);
          console.log(green(`Обновлено имя текущего проекта: ${project!.name}`));
          projectUpdated = true;
        }


        if (!project!.environments || project!.environments.length === 0) {
          await setCurrentEnv(null, null);
          console.log(green("Окружения для текущего проекта отсутствуют, сброс текущего окружения."));
          envUpdated = true;
        } else {
          for (const env of project!.environments) {
            if (env!.uuid === currentEnvUUID && env!.name !== currentConfig?.currentEnvName) {
              await setCurrentEnv(env!.name!, env!.uuid!);
              console.log(green(`Обновлено имя текущего окружения: ${env!.name}`));
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
