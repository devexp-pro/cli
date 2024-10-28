import { type ApiflyDefinition } from "@vseplet/apifly/types";

export type TProjects = Record<string, ProjectData>;
export type ProjectData = {
  uuid: TUUID;
  environments: EnvironmentData[];
  name: string;
};
export type TUUID = `${string}-${string}-${string}-${string}-${string}`;
export type UserData = {
  token: string;
  uuid: TUUID;
  email: string;
};

export type EnvironmentData = {
  uuid: TUUID;
  name: string;
  secrets: SecretData[];
};

export type SecretData = {
  uuid: TUUID;
  key: string;
  value: any;
};

type TCallResponse = {
  success: boolean;
  projects: ProjectData[];
};

export type GuardenDefinition = ApiflyDefinition<
  {
    user: UserData;
    projects: ProjectData[];
  },
  {
    createProject: {
      args: [projectName: string];
      returns: TCallResponse;
    };
    renameProject: {
      args: [oldProjectUUID: string, newProjectName: string];
      returns: TCallResponse;
    };
    deleteProject: {
      args: [projectUUID: TUUID];
      returns: TCallResponse;
    };
    createEnvironment: {
      args: [projectUUID: TUUID, envName: string];
      returns: TCallResponse;
    };
    renameEnvironment: {
      args: [projectUUID: TUUID, oldEnvUUID: TUUID, newEnvName: string];
      returns: TCallResponse;
    };
    deleteEnvironment: {
      args: [projectUUID: TUUID, envUUID: TUUID];
      returns: TCallResponse;
    };

    createSecret: {
      args: [
        projectUUID: TUUID,
        envUUID: TUUID,
        keyName: string,
        value: string,
      ];
      returns: TCallResponse;
    };
    updateSecret: {
      args: [
        projectUUID: TUUID,
        envUUID: TUUID,
        keyUUID: TUUID,
        value: string,
      ];
      returns: TCallResponse;
    };
    renameSecret: {
      args: [
        projectUUID: TUUID,
        envUUID: TUUID,
        keyUUID: TUUID,
        newKeyName: string,
      ];
      returns: TCallResponse;
    };
    deleteSecret: {
      args: [projectUUID: TUUID, envUUID: TUUID, keyUUID: TUUID];
      returns: TCallResponse;
    };
    fetchSecrets: {
      args: [projectUUID: TUUID, envUUID: TUUID];
      returns: TCallResponse;
    };

    runCommand: {
      args: [command: string];
      returns: TCallResponse;
    };
    inviteUserToProject: {
      args: [inviteeEMAIL: string, projectUUID: TUUID];
      returns: TCallResponse;
    };
    checkUserExists: {
      args: [email: string];
      returns: { success: boolean };
    };
  }
>;
