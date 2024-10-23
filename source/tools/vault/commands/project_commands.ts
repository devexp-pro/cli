import { createProjectCommand as _createProjectCommand } from "./secondary/create_project.ts";
import { selectProjectCommand as _selectProjectCommand } from "./secondary/select_project.ts";
import { renameProjectCommand as _renameProjectCommand } from "./secondary/rename_project.ts";
import { deleteProjectCommand as _deleteProjectCommand } from "./secondary/delete_project.ts";

export const createProjectCommand = _createProjectCommand;
export const selectProjectCommand = _selectProjectCommand;
export const renameProjectCommand = _renameProjectCommand;
export const deleteProjectCommand = _deleteProjectCommand;
