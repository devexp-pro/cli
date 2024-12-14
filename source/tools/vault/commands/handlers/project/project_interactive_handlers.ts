
import { Select } from "@cliffy/prompt/select";
import { Input } from "@cliffy/prompt/input";

import {
  renameProjectByUUID,
  createProject,
  deleteProjectByUUID,
  selectProjectByUUID,
} from "./project_low_level_handlers.ts";
import { getFullConfigKV } from "../../../api.ts";
import { TUUID } from "../../../GuardenDefinition.ts";



export async function interactiveRenameProject() {
  const projects = await getFullConfigKV();
  if (!projects || projects.length === 0) {
    throw new Error("No projects available.");
  }

  const selectedProjectUUID = await Select.prompt({
    message: "Select the project to rename:",
    options: projects.map((p) => ({
      name: p.name,
      value: p.uuid,
    })),
  });

  const newName = await Input.prompt("Enter the new project name:");
  await renameProjectByUUID(selectedProjectUUID as TUUID, newName);
}


export async function interactiveCreateProject() {
  const name = await Input.prompt("Enter the new project name:");
  await createProject(name);
}


export async function interactiveDeleteProject() {
  const projects = await getFullConfigKV();
  if (!projects || projects.length === 0) {
    throw new Error("No projects available.");
  }

  const selectedProjectUUID = await Select.prompt({
    message: "Select the project to delete:",
    options: projects.map((p) => ({
      name: p.name,
      value: p.uuid,
    })),
  });

  await deleteProjectByUUID(selectedProjectUUID as TUUID);
}


export async function interactiveSelectProject() {
  const projects = await getFullConfigKV();
  if (!projects || projects.length === 0) {
    throw new Error("No projects available.");
  }

  const selectedProject = await Select.prompt({
    message: "Select a project:",
    options: projects.map((p) => ({
      name: p.name,
      value: p.uuid,
    })),
  });

  const projectName = projects.find((p) => p.uuid === selectedProject)?.name;
  if (!projectName) {
    throw new Error("Selected project not found.");
  }

  await selectProjectByUUID(selectedProject as TUUID, projectName);
}

