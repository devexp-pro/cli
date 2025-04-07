// deno-lint-ignore-file
import { Command } from "@cliffy/command";

import { Select } from "@cliffy/prompt/select";
import { createClient, getCurrentConfig } from "../config_sync.ts";
import { green, Input, red, yellow } from "../deps.ts";

async function fetchDenoProjects(
  accessToken: string,
): Promise<Array<{ name: string; value: string }>> {
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

const integrationCommand = new Command()
  .description(
    "Интеграция с Deno Deploy: настройка токена, выбор проекта и окружения.",
  )
  .action(async () => {
    const accessToken = await Input.prompt(
      "Введите Access Token для Deno Deploy",
    );

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
    const selectedEnvUUID = await Select.prompt({
      message: "Выберите окружение для интеграции",
      options: envOptions,
    });

    const client = await createClient();
    const response = await client.call("createIntegration", [
      accessToken,
      selectedProjectId,
      selectedEnvUUID as `${string}-${string}-${string}-${string}-${string}`,
    ]);

    if (response.success) {
      console.log(green("Интеграция успешно добавлена!"));
      console.log(green(`ID интеграции: ${response.integrationId}`));
    } else {
      console.log(red(`Ошибка при добавлении интеграции: ${response.message}`));
    }
    Deno.exit();
  });

export default integrationCommand;
