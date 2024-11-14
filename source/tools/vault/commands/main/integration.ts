// source/tools/vault/commands/main/integration.ts

// deno-lint-ignore-file
import { Command } from "@cliffy/command";
import { getCurrentConfig, createClient, syncProjects } from "../../api.ts";
import { green, Input, red, yellow } from "../../deps.ts";
import { Select } from "@cliffy/prompt/select";
import { TUUID } from "../../GuardenDefinition.ts";
import { displayCurrentProjectInfo } from "../project_commands.ts";

async function fetchDenoProjects(accessToken: string): Promise<Array<{ name: string; value: string }>> {
  try {
    const response = await fetch("https://dash.deno.com/api/projects", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) throw new Error("Ошибка при получении проектов");

    const projects = await response.json();
    return projects.map((project: { id: string; name: string }) => ({
      name: project.name,
      value: project.id,
    }));
  } catch (error) {
    console.error(red(`Ошибка: ${(error as Error).message}`));
    return [];
  }
}

async function getIntegrationsList() {
  const client = await createClient();
  const response = await client.call("getIntegrations", []);
  
  if (!response.success || !response.integrations) {
    console.error(red(`Ошибка при получении интеграций: ${response.message}`));
    return [];
  }

  const { projectNames, envNames } = await getLocalProjectAndEnvNames();
  return response.integrations.map((integration) => ({
    id: integration.id,
    projectName: projectNames.get(integration.projectUUID) || "Unknown Project",
    envName: envNames.get(integration.projectUUID)?.get(integration.envUUID) || "Unknown Environment",
  }));
}

async function getLocalProjectAndEnvNames() {
  const { fullConfig } = await getCurrentConfig();
  const projectNames = new Map<string, string>();
  const envNames = new Map<string, Map<string, string>>();

  fullConfig?.forEach((project) => {
    projectNames.set(project.uuid, project.name);
    const envMap = new Map<string, string>();
    project.environments.forEach((env) => {
      envMap.set(env.uuid, env.name);
    });
    envNames.set(project.uuid, envMap);
  });

  return { projectNames, envNames };
}

export function viewIntegrationsCommand() {
  return new Command()
    .description("Просмотр существующих интеграций")
    .action(async () => {
      const integrations = await getIntegrationsList();
      if (integrations.length === 0) {
        console.log(red("Нет доступных интеграций."));
        return;
      }

      console.log(green("Существующие интеграции:"));
      integrations.forEach((integration, index) => {
        console.log(green(`${index + 1}. Проект: ${integration.projectName}, Окружение: ${integration.envName}`));
      });
    });
}

export function forceRedeployIntegrationCommand() {
  return new Command()
    .description("Принудительный передеплой выбранной интеграции")
    .action(async () => {
      const integrations = await getIntegrationsList();
      if (integrations.length === 0) {
        console.log(red("Нет доступных интеграций для передеплоя."));
        return;
      }

      const integrationOptions = integrations.map((integration) => ({
        name: `${integration.projectName} - ${integration.envName}`,
        value: integration.id,
      }));

      const selectedIntegrationId = (await Select.prompt({
        message: "Выберите интеграцию для передеплоя",
        options: integrationOptions,
      })) as TUUID;

      const client = await createClient();
      const redeployResponse = await client.call("forceRedeployIntegration", [selectedIntegrationId]);

      if (redeployResponse.success) {
        console.log(green("Передеплой интеграции успешно инициирован!"));
      } else {
        console.log(red(`Ошибка при передеплое интеграции: ${redeployResponse.message}`));
      }
    });
}

export function deleteIntegrationCommand() {
  return new Command()
    .description("Удалить интеграцию")
    .action(async () => {
      const integrations = await getIntegrationsList();
      if (integrations.length === 0) {
        console.log(red("Нет доступных интеграций для удаления."));
        return;
      }

      const integrationOptions = integrations.map((integration) => ({
        name: `${integration.projectName} - ${integration.envName}`,
        value: integration.id,
      }));

      const selectedIntegrationId = await Select.prompt({
        message: "Выберите интеграцию для удаления",
        options: integrationOptions,
      });

      const client = await createClient();
      const deleteResponse = await client.call("deleteIntegration", [selectedIntegrationId as TUUID]);

      if (deleteResponse.success) {
        console.log(green("Интеграция успешно удалена!"));
      } else {
        console.log(red(`Ошибка при удалении интеграции: ${deleteResponse.message}`));
      }
    });
}


export function updateIntegrationCommand() {
    return new Command()
      .description("Обновить интеграцию")
      .action(async () => {
        const integrations = await getIntegrationsList();
        if (integrations.length === 0) {
          console.log(red("Нет доступных интеграций для обновления."));
          return;
        }
  
        const integrationOptions = integrations.map((integration) => ({
          name: `${integration.projectName} - ${integration.envName}`,
          value: integration.id,
        }));
  
        const selectedIntegrationId = await Select.prompt({
          message: "Выберите интеграцию для обновления",
          options: integrationOptions,
        });
  
        const accessToken = await Input.prompt("Введите Access Token для Deno Deploy:");
        const projects = await fetchDenoProjects(accessToken);
  
        if (projects.length === 0) {
          console.log(red("Проекты не найдены или ошибка доступа."));
          return;
        }
  
        const selectedProjectId = await Select.prompt({
          message: "Выберите новый проект на Deno Deploy",
          options: projects,
        });
  
        const { currentConfig, fullConfig } = await getCurrentConfig();
        const currentProjectUUID = currentConfig?.currentProjectUUID;
        const project = fullConfig?.find((p) => p.uuid === currentProjectUUID);
  
        if (!project) {
          console.log(yellow("Окружения для выбранного проекта не найдены."));
          return;
        }
  
        const envOptions = project.environments.map((env) => ({
          name: env.name,
          value: env.uuid,
        }));
  
        const selectedEnvUUID = await Select.prompt({
          message: "Выберите новое окружение для интеграции",
          options: envOptions,
        });
  
        const newAutoRedeploy = await Select.prompt({
          message: "Включить автоматический передеплой?",
          options: [
            { name: "Да", value: "true" },
            { name: "Нет", value: "false" },
          ],
        });
  
        const client = await createClient();
        const updateResponse = await client.call("updateIntegration", [
          selectedIntegrationId as TUUID,
          selectedProjectId,
          selectedEnvUUID as TUUID,
          newAutoRedeploy === "true",
        ]);
  
        if (updateResponse.success) {
          console.log(green("Интеграция успешно обновлена!"));
        } else {
          console.log(red(`Ошибка при обновлении интеграции: ${updateResponse.message}`));
        }
      });
  }
  

export function createIntegrationCommand() {
  return new Command()
    .description("Создать новую интеграцию")
    .action(async () => {
      const accessToken = await Input.prompt("Введите Access Token для интеграции:");
      const projects = await fetchDenoProjects(accessToken);

      if (projects.length === 0) {
        console.log(red("Проекты не найдены или ошибка доступа."));
        return;
      }

      const selectedProjectId = await Select.prompt({
        message: "Выберите проект на Deno Deploy",
        options: projects,
      });

      const { currentConfig, fullConfig } = await getCurrentConfig();
      const currentProjectUUID = currentConfig?.currentProjectUUID;
      const project = fullConfig?.find((p) => p.uuid === currentProjectUUID);

      if (!project) {
        console.log(yellow("Окружения для выбранного проекта не найдены."));
        return;
      }

      const envOptions = project.environments.map((env) => ({
        name: env.name,
        value: env.uuid,
      }));
      const selectedEnvUUID =( await Select.prompt({
        message: "Выберите окружение для интеграции",
        options: envOptions,
      })) as TUUID;

      const autoRedeploy = await Select.prompt({
        message: "Включить автоматический передеплой?",
        options: [
          { name: "Да", value: "true" },
          { name: "Нет", value: "false" },
        ],
      });

      const client = await createClient();
      const createResponse = await client.call("createIntegration", [
        accessToken,
        selectedProjectId,
        selectedEnvUUID,
         autoRedeploy === "true" ,
      ]);

      if (createResponse.success) {
        console.log(green("Интеграция успешно создана!"));
      } else {
        console.log(red(`Ошибка при создании интеграции: ${createResponse.message}`));
      }
    });
}

const integrationCommand = new Command()
  .description("Управление интеграциями: создание, обновление, удаление, просмотр и принудительный передеплой.")
  .option("--action <action:string>", "Действие с интеграцией: 'create', 'update', 'delete', 'view', или 'redeploy'.")
  .example("integration --action=create", "Создать новую интеграцию")
  .example("integration --action=update", "Обновить существующую интеграцию")
  .example("integration --action=delete", "Удалить существующую интеграцию")
  .example("integration --action=view", "Просмотр всех интеграций")
  .example("integration --action=redeploy", "Принудительный передеплой выбранной интеграции")
  .action(async (options) => {
    await syncProjects();
    await displayCurrentProjectInfo();
    switch (options.action) {
      case "create":
        await createIntegrationCommand().parse([]);
        break;
      case "update":
        await updateIntegrationCommand().parse([]);
        break;
      case "delete":
        await deleteIntegrationCommand().parse([]);
        break;
      case "view":
        await viewIntegrationsCommand().parse([]);
        break;
      case "redeploy":
        await forceRedeployIntegrationCommand().parse([]);
        break;
      default:
        const action = await Select.prompt({
          message: "Что вы хотите сделать с интеграциями?",
          options: [
            { name: "Создать новую интеграцию", value: "create" },
            { name: "Обновить существующую интеграцию", value: "update" },
            { name: "Удалить интеграцию", value: "delete" },
            { name: "Просмотр существующих интеграций", value: "view" },
            { name: "Принудительный передеплой интеграции", value: "redeploy" },
          ],
        });

        switch (action) {
          case "create":
            await createIntegrationCommand().parse([]);
            break;
          case "update":
            await updateIntegrationCommand().parse([]);
            break;
          case "delete":
            await deleteIntegrationCommand().parse([]);
            break;
          case "view":
            await viewIntegrationsCommand().parse([]);
            break;
          case "redeploy":
            await forceRedeployIntegrationCommand().parse([]);
            break;
        }
    }
    Deno.exit();
  });

export default integrationCommand;
