

import { createClient, getCurrentConfig, setCurrentConfigKV } from "../../../api.ts";
import { green, red } from "../../../deps.ts";
import { TUUID } from "../../../GuardenDefinition.ts";


export async function viewCurrentProject() {
  const { currentConfig } = await getCurrentConfig();

  if (!currentConfig || !currentConfig.currentProjectName) {
    console.log(red("No project is currently selected."));
    return;
  }

  console.log(green(`Current project: ${currentConfig.currentProjectName}`));
  if (currentConfig.currentEnvName) {
    console.log(green(`Current environment: ${currentConfig.currentEnvName}`));
  } else {
    console.log(red("No environment is selected."));
  }
}


export async function renameProjectByUUID(uuid: TUUID, newName: string) {
  const client = await createClient();
  const response = await client.call("updateProject", [uuid, newName]);

  if (!response.success) {
    throw new Error(`Failed to rename project: ${response.message}`);
  }

  const { currentConfig } = await getCurrentConfig();

  if (currentConfig?.currentProjectUUID === uuid) {
    await setCurrentConfigKV({
      ...currentConfig,
      currentProjectName: newName,
    });
  }

  console.log(green(`Project renamed to '${newName}'.`));
}


export async function createProject(name: string) {
  const client = await createClient();
  const response = await client.call("createProject", [name]);

  if (!response.success) {
    throw new Error(`Failed to create project: ${response.message}`);
  }

  await setCurrentConfigKV({
    currentProjectName: response.project!.name,
    currentProjectUUID: response.project!.uuid,
    currentEnvName: response.project?.environments[0]?.name || null,
    currentEnvUUID: response.project?.environments[0]?.uuid || null,
  });

  console.log(green(`Project '${name}' successfully created.`));
}


export async function deleteProjectByUUID(uuid: TUUID) {
  const client = await createClient();
  const response = await client.call("deleteProject", [uuid]);

  if (!response.success) {
    throw new Error(`Failed to delete project: ${response.message}`);
  }

  const { currentConfig } = await getCurrentConfig();
  if (currentConfig?.currentProjectUUID === uuid) {
    await setCurrentConfigKV({
      currentProjectName: null,
      currentProjectUUID: null,
      currentEnvName: null,
      currentEnvUUID: null,
    });
  }

  console.log(green("Project successfully deleted."));
}


export async function selectProjectByUUID(uuid: TUUID, projectName: string) {
  const { currentConfig } = await getCurrentConfig();
  await setCurrentConfigKV({
    ...currentConfig,
    currentProjectUUID: uuid,
    currentProjectName: projectName
  });

  console.log(green(`Project with UUID '${uuid}' selected.`));
}
