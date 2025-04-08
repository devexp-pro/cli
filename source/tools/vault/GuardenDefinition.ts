// source/tools/vault/GuardenDefinition.ts

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

export interface IntegrationData {
  id: TUUID;
  name: string;
  envUUID: TUUID;
  projectUUID: TUUID;
  denoDeployProjectId: string;
  auto_redeploy?: boolean;
}

export type GuardenDefinition = ApiflyDefinition<
  {
    user: { uuid: TUUID; email: string };
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
    getProjectsByUser: {
      args: [userUUID: TUUID];
      returns: { success: boolean; projects: ProjectData[] };
    };

    inviteUser: {
      args: [projectUUID: TUUID, userEmail: string];
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
    createIntegration: {
      args: [
        accessToken: string,
        denoDeployProjectId: string,
        vaultEnvUUID: TUUID,
        autoRedeploy: boolean,
      ];
      returns: { success: boolean; integrationId?: TUUID; message?: string };
    };
    updateIntegration: {
      args: [
        integrationId: TUUID,
        accessToken: string,
        denoDeployProjectId: string,
        vaultEnvUUID: TUUID,
        autoRedeploy: boolean,
      ];
      returns: { success: boolean; integrationId?: TUUID; message?: string };
    };
    deleteIntegration: {
      args: [integrationId: TUUID];
      returns: { success: boolean; message?: string };
    };
    getIntegrations: {
      args: [];
      returns: {
        success: boolean;
        integrations?: IntegrationData[];
        message?: string;
      };
    };
    forceRedeployIntegration: {
      args: [integrationId: TUUID];
      returns: { success: boolean; message?: string };
    };
  },
  { userId: TUUID }
>;
