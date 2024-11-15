import { createClient, getCurrentConfig, getFullConfigKV } from "../api.ts";
import { Command, green, Input, red } from "../deps.ts";
import { Select } from "@cliffy/prompt";
import { TUUID } from "../GuardenDefinition.ts";

async function getSecretsFromConfig(): Promise<Record<string, string>> {
  const { currentConfig } = await getCurrentConfig();
  const fullConfig = await getFullConfigKV();
  if (!fullConfig) {
    console.log(red("The current project or environment is not selected."));
    Deno.exit();
  }

  if (!currentConfig?.currentProjectUUID || !currentConfig.currentEnvUUID) {
    console.error(red("The current environment or project is not selected."));
    Deno.exit();
  }

  const project = fullConfig.find((proj) =>
    proj.uuid === currentConfig.currentProjectUUID
  );
  const environment = project?.environments.find((env) =>
    env.uuid === currentConfig.currentEnvUUID
  );

  if (!environment || !environment.secrets) {
    console.log(red("No secrets found for the current environment."));
    Deno.exit();
  }

  return environment.secrets.reduce((acc, secret) => {
    acc[secret.key] = secret.value;
    return acc;
  }, {} as Record<string, string>);
}

export function addSecretCommand() {
  return new Command()
    .description("Add a secret to the current environment.")
    .arguments("<key:string> <value:string>")
    .action(async (_options: any, key: string, value: string) => {
      const { currentConfig } = await getCurrentConfig();
      if (!currentConfig?.currentEnvUUID) {
        console.error(red("The current environment is not selected."));
        Deno.exit();
      }

      const client = await createClient();
      const response = await client.call("addSecret", [
        currentConfig.currentEnvUUID,
        key,
        value,
      ]);

      if (!response.success) {
        console.error(red(`Error adding secret: ${response.message}`));
        Deno.exit();
      }

      console.log(
        green(
          `Secret '${key}' has been successfully added to the current environment.`,
        ),
      );
      Deno.exit();
    });
}

export function updateSecretCommand() {
  return new Command()
    .description("Update a secret in the current environment.")
    .option("--key <key:string>", "The key of the secret to update.")
    .option("--value <value:string>", "The new value for the secret.")
    .action(async (options) => {
      const secrets = await getSecretsFromConfig();
      if (Object.keys(secrets).length === 0) {
        console.log(red("No secrets found in the current environment."));
        Deno.exit();
      }

      const selectedKey = options.key ?? await Select.prompt({
        message: "Select a secret to update:",
        options: Object.keys(secrets),
      });

      const newValue = options.value ??
        await Input.prompt("Enter the new value for the secret:");
      const { currentConfig } = await getCurrentConfig();
      if (!currentConfig?.currentEnvUUID) {
        console.log(red("The current project or environment is not selected."));
        Deno.exit();
      }

      const client = await createClient();
      const response = await client.call("updateSecret", [
        currentConfig.currentEnvUUID,
        selectedKey,
        newValue,
      ]);

      if (!response.success) {
        console.error(red(`Error updating secret: ${response.message}`));
        Deno.exit();
      }

      console.log(
        green(`Secret '${selectedKey}' has been successfully updated.`),
      );
      Deno.exit();
    });
}

export function deleteSecretCommand() {
  return new Command()
    .description("Delete a secret from the current environment.")
    .option("--key <key:string>", "The key of the secret to delete.")
    .action(async (options) => {
      const secrets = await getSecretsFromConfig();
      if (Object.keys(secrets).length === 0) {
        console.log(red("No secrets found in the current environment."));
        Deno.exit();
      }

      const selectedKey = options.key ?? await Select.prompt({
        message: "Select a secret to delete:",
        options: Object.keys(secrets),
      });

      const { currentConfig } = await getCurrentConfig();
      if (!currentConfig?.currentEnvUUID) {
        console.log(red("The current project or environment is not selected."));
        Deno.exit();
      }

      const client = await createClient();
      const response = await client.call("deleteSecret", [
        currentConfig.currentEnvUUID,
        selectedKey,
      ]);

      if (!response.success) {
        console.error(red(`Error deleting secret: ${response.message}`));
        Deno.exit();
      }

      console.log(
        green(
          `Secret '${selectedKey}' has been successfully deleted from the environment.`,
        ),
      );
      Deno.exit();
    });
}

export function fetchSecretsCommand() {
  return new Command()
    .description("Retrieve and display secrets for the current environment.")
    .action(async () => {
      const secrets = await getSecretsFromConfig();
      if (Object.keys(secrets).length === 0) {
        console.log(red("No secrets found in the current environment."));
        Deno.exit();
      }

      console.log(green("Secrets for the current environment:"));
      for (const [key, value] of Object.entries(secrets)) {
        console.log(green(`${key}: ${value}`));
      }
      Deno.exit();
    });
}
