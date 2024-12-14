import { getFullConfigKV } from "../../../api.ts";
import { renameProjectByUUID, deleteProjectByUUID, selectProjectByUUID } from "./project_low_level_handlers.ts";




export async function renameProjectByName(oldName: string, newName: string) {
  const projects = await getFullConfigKV();
  if (!projects) {
    throw new Error("No projects available.");
  }

  const project = projects.find((p) => p.name === oldName);
  if (!project) {
    throw new Error(`Project with name '${oldName}' not found.`);
  }

  await renameProjectByUUID(project.uuid, newName);
}


export async function deleteProjectByName(name: string) {
  const projects = await getFullConfigKV();
  if (!projects) {
    throw new Error("No projects available.");
  }

  const project = projects.find((p) => p.name === name);
  if (!project) {
    throw new Error(`Project with name '${name}' not found.`);
  }

  await deleteProjectByUUID(project.uuid);
}


export async function selectProjectByName(name: string) {
  const projects = await getFullConfigKV();
  if (!projects) {
    throw new Error("No projects available.");
  }

  const project = projects.find((p) => p.name === name);
  if (!project) {
    throw new Error(`Project with name '${name}' not found.`);
  }

  await selectProjectByUUID(project.uuid);
}
