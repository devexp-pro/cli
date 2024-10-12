import { type ApiflyDefinition } from "@vseplet/apifly/types";

export type TProjects = Record<string, ProjectData>;
export interface ProjectData {
  uuid: string;
  environments: Record<string, Record<string, string>>;
  name: string;
}

export type GuardenDefinition = ApiflyDefinition<
  {
    token: string | null;
    projects: ProjectData[];
  },
  {
    generateToken: {
      args: [userId: string];
      returns: { success: boolean; message: string; token: string };
    };
    createProject: {
      args: [projectName: string];
      returns: { success: boolean };
    };
    addSecret: {
      args: [projectName: string, envName: string, key: string, value: string];
      returns: { success: boolean; message: string };
    };
    updateSecret: {
      args: [projectName: string, envName: string, key: string, value: string];
      returns: { success: boolean; message: string };
    };
    deleteSecret: {
      args: [projectName: string, envName: string, key: string];
      returns: { success: boolean; message: string };
    };
    fetchSecrets: {
      args: [projectName: string, envName: string];
      returns: { success: boolean; secrets: Record<string, string> };
    };
    createEnvironment: {
      args: [projectName: string, envName: string];
      returns: { success: boolean; message: string };
    };
    deleteEnvironment: {
      args: [projectName: string, envName: string];
      returns: { success: boolean; message: string };
    };
    renameEnvironment: {
      args: [projectName: string, oldEnvName: string, newEnvName: string];
      returns: { success: boolean; message: string };
    };
    deleteProject: {
      args: [projectName: string];
      returns: { success: boolean; message: string };
    };
    renameProject: {
      args: [oldProjectName: string, newProjectName: string];
      returns: { success: boolean; message: string };
    };
    runCommand: {
      args: [command: string];
      returns: { success: boolean };
    };
    inviteUserToProject: {
      args: [inviteeUsername: string, projectName: string];
      returns: { success: boolean; message: string };
    };
    checkUserExists: {
      args: [username: string];
      returns: { success: boolean; message: string };
    };
  },
  {
    token: string;
  }
>;
