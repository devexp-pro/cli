

import { type ApiflyDefinition } from "@vseplet/apifly/types";

export type TUUID = `${string}-${string}-${string}-${string}-${string}`;

export interface ProjectData {
  uuid: TUUID;
  name: string;
  owner_id: TUUID;
  environments: EnvironmentData[];
}

export interface EnvironmentData {
  uuid: TUUID;
  name: string;
  project_id: TUUID;
  secrets: SecretData[];
}

export interface SecretData {
  uuid: TUUID;
  key: string;
  value: string;
  environment_id: TUUID;
}

export type GuardenDefinition = ApiflyDefinition<
  {
    user: { uuid: TUUID };
    projects: ProjectData[];
  },
  {

    createProject: {
      args: [projectName: string];
      returns: { success: boolean; project?: ProjectData; message?: string };
    };
    getProject: {
      args: [projectUUID: TUUID];
      returns: { success: boolean; project?: ProjectData; message?: string };
    };
    updateProject: {
      args: [projectUUID: TUUID, projectName: string];
      returns: { success: boolean; project?: ProjectData; message?: string };
    };
    deleteProject: {
      args: [projectUUID: TUUID];
      returns: { success: boolean; message?: string };
    };

    createEnvironment: {
      args: [projectUUID: TUUID, envName: string];
      returns: {
        success: boolean;
        environment?: EnvironmentData;
        message?: string;
      };
    };
    getEnvironment: {
      args: [envUUID: TUUID];
      returns: {
        success: boolean;
        environment?: EnvironmentData;
        message?: string;
      };
    };
    updateEnvironment: {
      args: [envUUID: TUUID, envName: string];
      returns: {
        success: boolean;
        environment?: EnvironmentData;
        message?: string;
      };
    };
    deleteEnvironment: {
      args: [envUUID: TUUID];
      returns: { success: boolean; message?: string };
    };
    addSecret: {
      args: [envUUID: TUUID, key: string, value: string];
      returns: { success: boolean; secret?: SecretData; message?: string };
    };
    getSecrets: {
      args: [envUUID: TUUID];
      returns: {
        success: boolean;
        secrets: Record<string, string>;
        message?: string;
      };
    };
    updateSecret: {
      args: [envUUID: TUUID, key: string, value: string];
      returns: { success: boolean; secret?: SecretData; message?: string };
    };
    deleteSecret: {
      args: [envUUID: TUUID, key: string];
      returns: { success: boolean; message?: string };
    };

    linkProjectToUser: {
      args: [userUUID: TUUID, projectUUID: TUUID];
      returns: { success: boolean; message?: string };
    };
    isProjectLinkedToUser: {
      args: [userUUID: TUUID, projectUUID: TUUID];
      returns: { success: boolean; isLinked: boolean };
    };
    createIntegration: {
      args: [accessToken: string, denoDeployProjectId: string, vaultEnvUUID: string];
      returns: { success: boolean; integrationId?: TUUID; message?: string };
    };
    updateIntegration: {
      args: [integrationId: TUUID, accessToken: string, denoDeployProjectId: string, vaultEnvUUID: string];
      returns: { success: boolean; integrationId?: TUUID; message?: string };
    };
  },
  { userId: TUUID }
>;
