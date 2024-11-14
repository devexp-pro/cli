import apifly, { ApiflyClient } from "@vseplet/apifly";
import type { GuardenDefinition, ProjectData, TUUID } from "./GuardenDefinition.ts";
import { getSession, kv } from "$/kv";
import { IS_DEVELOP, SERVICE_URL } from "$/constants";
import { red, green, yellow } from "./deps.ts";

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


export async function getCurrentConfigKV(): Promise<VaultConfig | null> {
  try {
    const configData = await kv.get<VaultConfig>(["service", "vault", "curConfig"]);
    return configData.value || null;
  } catch (error) {
    console.error("Ошибка при получении текущей конфигурации:", error);
    return null;
  }
}


export async function getFullConfigKV(): Promise<ProjectData[] | null> {
  try {
    const fullConfigData = await kv.get<ProjectData[]>(["service", "vault", "fullConfig"]);
    return fullConfigData.value
  } catch (error) {
    console.error("Ошибка при получении полного конфига:", error);
    return null;
  }
}


export async function setCurrentConfigKV(config: VaultConfig): Promise<void> {
  try {
    await kv.set(["service", "vault", "curConfig"], config);
    console.log(green("Текущая конфигурация успешно обновлена."));
  } catch (error) {
    console.error("Ошибка при обновлении текущей конфигурации:", error);
  }
}


export async function setFullConfigKV(fullConfig: ProjectData[]): Promise<void> {
  try {
    await kv.set(["service", "vault", "fullConfig"], fullConfig);
    console.log(green("Полный конфиг успешно сохранен."));
  } catch (error) {
    console.error("Ошибка при сохранении полного конфига:", error);
  }
}


export async function getCurrentConfig(): Promise<{ 
  currentConfig: VaultConfig | null;
  fullConfig: ProjectData[] | null;
}> {
  const [currentConfig, fullConfig] = await Promise.all([
    getCurrentConfigKV(),
    getFullConfigKV(),
  ]);

  return { currentConfig, fullConfig };
}


export async function syncProjects() {
  try {
    const client = await createClient();
    const [response, error] = await client.get();

    if (error) {
      console.error(red("Ошибка при синхронизации проектов."));
      return;
    }

    const newProjects = response!.state.projects as ProjectData[];
    if (!newProjects || newProjects.length === 0) {
      console.log(red("Проекты отсутствуют."));
      await setCurrentConfigKV({
        currentProjectName: null,
        currentEnvName: null,
        currentProjectUUID: null,
        currentEnvUUID: null,
      });
      console.log(yellow("Текущая конфигурация сброшена."));
      return;
    }

    let currentFullConfig = await getFullConfigKV() as ProjectData[] | null;


    if (currentFullConfig === null) {
      await setCurrentConfigKV({
        currentProjectName: null,
        currentEnvName: null,
        currentProjectUUID: null,
        currentEnvUUID: null,
      });
      console.log(yellow("Текущая конфигурация сброшена."));

      await setFullConfigKV(newProjects);
      console.log(green("Конфигурация инициализирована, так как она отсутствовала."));
      return;
    }

    let changesDetected = false;

    newProjects.forEach((newProject) => {
      const currentProject = currentFullConfig!.find((p) => p.uuid === newProject.uuid);

      if (!currentProject) {
        console.log(yellow(`Добавлен новый проект: ${newProject.name}${IS_DEVELOP ? ` (UUID: ${newProject.uuid})` : ""}`));
        changesDetected = true;
      } else {
        if (currentProject.name !== newProject.name) {
          console.log(
            yellow(`Изменение в проекте ${currentProject.name} -> ${newProject.name}${IS_DEVELOP ? ` (UUID: ${newProject.uuid})` : ""}`)
          );
          changesDetected = true;
        }

        newProject.environments.forEach((newEnv) => {
          const currentEnv = currentProject.environments.find((e) => e.uuid === newEnv.uuid);

          if (!currentEnv) {
            console.log(yellow(`Добавлено новое окружение: ${newEnv.name}${IS_DEVELOP ? ` (UUID: ${newEnv.uuid})` : ""} для проекта ${newProject.name}`));
            changesDetected = true;
          } else {
            if (currentEnv.name !== newEnv.name) {
              console.log(
                yellow(
                  `Изменение в окружении ${currentEnv.name} -> ${newEnv.name}${IS_DEVELOP ? ` (UUID: ${newEnv.uuid})` : ""} для проекта ${newProject.name}`
                )
              );
              changesDetected = true;
            }


            newEnv.secrets.forEach((newSecret) => {
              const currentSecret = currentEnv.secrets.find((s) => s.key === newSecret.key);

              if (!currentSecret) {
                console.log(
                  yellow(`Добавлен новый секрет: ${newSecret.key}${IS_DEVELOP ? ` (UUID: ${newSecret.uuid})` : ""} в окружение ${newEnv.name} проекта ${newProject.name}`)
                );
                changesDetected = true;
              } else if (currentSecret.value !== newSecret.value) {
                console.log(
                  yellow(
                    `Изменение в секрете ${currentSecret.key} (старое значение: ${currentSecret.value}, новое значение: ${newSecret.value}) в окружении ${newEnv.name} проекта ${newProject.name}`
                  )
                );
                changesDetected = true;
              }
            });

            currentEnv.secrets.forEach((currentSecret) => {
              const newSecret = newEnv.secrets.find((s) => s.key === currentSecret.key);
              if (!newSecret) {
                console.log(
                  yellow(`Удален секрет: ${currentSecret.key}${IS_DEVELOP ? ` (UUID: ${currentSecret.uuid})` : ""} из окружения ${currentEnv.name} проекта ${currentProject.name}`)
                );
                changesDetected = true;
              }
            });
          }
        });

        currentProject.environments.forEach((currentEnv) => {
          const newEnv = newProject.environments.find((e) => e.uuid === currentEnv.uuid);
          if (!newEnv) {
            console.log(yellow(`Удалено окружение: ${currentEnv.name}${IS_DEVELOP ? ` (UUID: ${currentEnv.uuid})` : ""} из проекта ${currentProject.name}`));
            changesDetected = true;
          }
        });
      }
    });

    currentFullConfig!.forEach((currentProject) => {
      const newProject = newProjects.find((p) => p.uuid === currentProject.uuid);
      if (!newProject) {
        console.log(yellow(`Удален проект: ${currentProject.name}${IS_DEVELOP ? ` (UUID: ${currentProject.uuid})` : ""}`));
        changesDetected = true;
      }
    });

    if (changesDetected) {
      await setFullConfigKV(newProjects);
      console.log(green("Конфигурация обновлена."));
    } 
  } catch (error) {
    console.error(red("Ошибка синхронизации проектов:"), error.message);
    Deno.exit();
  }
}
