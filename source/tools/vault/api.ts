import apifly, { ApiflyClient } from "@vseplet/apifly";
import type {
  GuardenDefinition,
  ProjectData,
  TUUID,
} from "./GuardenDefinition.ts";
import { getSession, kv } from "$/kv";
import { IS_DEVELOP, SERVICE_URL } from "$/constants";
import { green, red, yellow } from "./deps.ts";

export async function createClient(): Promise<ApiflyClient<GuardenDefinition>> {
  const session = await getSession();

  if (!session) {
    throw new Error("No SESSION! Please authorize first.");
  }
  if (!session.id) throw new Error("No SESSION ID! Please authorize first.");

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
    const configData = await kv.get<VaultConfig>([
      "service",
      "vault",
      "curConfig",
    ]);
    return configData.value || null;
  } catch (error) {
    console.error("Error while fetching the current configuration:", error);
    return null;
  }
}

export async function getFullConfigKV(): Promise<ProjectData[] | null> {
  try {
    const fullConfigData = await kv.get<ProjectData[]>([
      "service",
      "vault",
      "fullConfig",
    ]);
    return fullConfigData.value;
  } catch (error) {
    console.error("Error while fetching the full configuration:", error);
    return null;
  }
}

export async function setCurrentConfigKV(config: VaultConfig): Promise<void> {
  try {
    await kv.set(["service", "vault", "curConfig"], config);
    console.log(green("Current configuration successfully updated."));
  } catch (error) {
    console.error("Error while updating the current configuration:", error);
  }
}

export async function setFullConfigKV(
  fullConfig: ProjectData[],
): Promise<void> {
  try {
    await kv.set(["service", "vault", "fullConfig"], fullConfig);
    // console.log(green("Full configuration successfully saved."));
  } catch (error) {
    console.error("Error while saving the full configuration:", error);
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
      console.error(red("Error synchronizing projects."));
      return;
    }

    const newProjects = response!.state.projects as ProjectData[];
    if (!newProjects || newProjects.length === 0) {
      console.log(red("No projects available."));
      await setCurrentConfigKV({
        currentProjectName: null,
        currentEnvName: null,
        currentProjectUUID: null,
        currentEnvUUID: null,
      });
      console.log(yellow("Current configuration reset."));
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
      console.log(yellow("Current configuration reset."));

      await setFullConfigKV(newProjects);
      console.log(
        green("Configuration initialized as it was previously missing."),
      );
      return;
    }

    let changesDetected = false;

    newProjects.forEach((newProject) => {
      const currentProject = currentFullConfig!.find((p) =>
        p.uuid === newProject.uuid
      );

      if (!currentProject) {
        console.log(
          yellow(
            `New project added: ${newProject.name}${
              IS_DEVELOP ? ` (UUID: ${newProject.uuid})` : ""
            }`,
          ),
        );
        changesDetected = true;
      } else {
        if (currentProject.name !== newProject.name) {
          console.log(
            yellow(
              `Project renamed: ${currentProject.name} -> ${newProject.name}${
                IS_DEVELOP ? ` (UUID: ${newProject.uuid})` : ""
              }`,
            ),
          );
          changesDetected = true;
        }

        newProject.environments.forEach((newEnv) => {
          const currentEnv = currentProject.environments.find((e) =>
            e.uuid === newEnv.uuid
          );

          if (!currentEnv) {
            console.log(
              yellow(
                `New environment added: ${newEnv.name}${
                  IS_DEVELOP ? ` (UUID: ${newEnv.uuid})` : ""
                } to project ${newProject.name}`,
              ),
            );
            changesDetected = true;
          } else {
            if (currentEnv.name !== newEnv.name) {
              console.log(
                yellow(
                  `Environment renamed: ${currentEnv.name} -> ${newEnv.name}${
                    IS_DEVELOP ? ` (UUID: ${newEnv.uuid})` : ""
                  } in project ${newProject.name}`,
                ),
              );
              changesDetected = true;
            }

            newEnv.secrets.forEach((newSecret) => {
              const currentSecret = currentEnv.secrets.find((s) =>
                s.key === newSecret.key
              );

              if (!currentSecret) {
                console.log(
                  yellow(
                    `New secret added: ${newSecret.key}${
                      IS_DEVELOP ? ` (UUID: ${newSecret.uuid})` : ""
                    } in environment ${newEnv.name} of project ${newProject.name}`,
                  ),
                );
                changesDetected = true;
              } else if (currentSecret.value !== newSecret.value) {
                console.log(
                  yellow(
                    `Secret updated: ${currentSecret.key} (old: ${currentSecret.value}, new: ${newSecret.value}) in environment ${newEnv.name} of project ${newProject.name}`,
                  ),
                );
                changesDetected = true;
              }
            });

            currentEnv.secrets.forEach((currentSecret) => {
              const newSecret = newEnv.secrets.find((s) =>
                s.key === currentSecret.key
              );
              if (!newSecret) {
                console.log(
                  yellow(
                    `Secret removed: ${currentSecret.key}${
                      IS_DEVELOP ? ` (UUID: ${currentSecret.uuid})` : ""
                    } from environment ${currentEnv.name} of project ${currentProject.name}`,
                  ),
                );
                changesDetected = true;
              }
            });
          }
        });

        currentProject.environments.forEach((currentEnv) => {
          const newEnv = newProject.environments.find((e) =>
            e.uuid === currentEnv.uuid
          );
          if (!newEnv) {
            console.log(
              yellow(
                `Environment removed: ${currentEnv.name}${
                  IS_DEVELOP ? ` (UUID: ${currentEnv.uuid})` : ""
                } from project ${currentProject.name}`,
              ),
            );
            changesDetected = true;
          }
        });
      }
    });

    currentFullConfig!.forEach((currentProject) => {
      const newProject = newProjects.find((p) =>
        p.uuid === currentProject.uuid
      );
      if (!newProject) {
        console.log(
          yellow(
            `Project removed: ${currentProject.name}${
              IS_DEVELOP ? ` (UUID: ${currentProject.uuid})` : ""
            }`,
          ),
        );
        changesDetected = true;
      }
    });

    if (changesDetected) {
      await setFullConfigKV(newProjects);
      console.log(green("Configuration updated."));
    }
  } catch (error) {
    //@ts-ignore
    console.error(red("Error synchronizing projects:"), error.message);
    Deno.exit();
  }
}
