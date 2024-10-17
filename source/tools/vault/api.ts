import apifly, { ApiflyClient } from "jsr:@vseplet/apifly";
import type { GuardenDefinition } from "./GuardenDefinition.ts";

import { kv } from "$/kv";
import { SERVICE_URL } from "$/constants";

export async function createClient(): Promise<ApiflyClient<GuardenDefinition>> {
  const session_id = await getSessionID();
  if (session_id === null) throw new Error("No SESSION ID! Authorize first");

  return new apifly.client<GuardenDefinition>({
    baseURL: `${SERVICE_URL}/services/vault`,
    headers: {
      Authorization: session_id,
    },
    limiter: { unlimited: true },
  });
}

export async function getSessionID(): Promise<string | null> {
  try {
    // Получаем текущие данные сессии по ключу ["auth", "session"]
    const sessionData = await kv.get<{ sessionId: string }>([
      "auth",
      "session",
    ]);

    if (sessionData.value) {
      const sessionId = sessionData.value.sessionId;
      console.log(`Найден sessionId: ${sessionId}`);
      return sessionId;
    }

    console.log("Активная сессия не найдена.");
    return null;
  } catch (error) {
    console.error("Ошибка при попытке получить sessionId:", error);
    return null;
  }
}

interface VaultConfig {
  currentProject?: string;
  currentEnv?: string;
}

export async function getCurrentProject(): Promise<string | null> {
  try {
    const configData = await kv.get<VaultConfig>(["service", "vault"]);

    if (configData.value && configData.value.currentProject) {
      return configData.value.currentProject;
    }

    console.log("Текущий проект не найден.");
    return null;
  } catch (error) {
    console.error("Ошибка при получении текущего проекта:", error);
    return null;
  }
}

export async function getCurrentEnv(): Promise<string | null> {
  try {
    const configData = await kv.get<VaultConfig>(["service", "vault"]);

    if (configData.value && configData.value.currentEnv) {
      return configData.value.currentEnv;
    }

    console.log("Текущее окружение не найдено.");
    return null;
  } catch (error) {
    console.error("Ошибка при получении текущего окружения:", error);
    return null;
  }
}

export async function setCurrentProject(project: string): Promise<void> {
  try {
    const configData = await kv.get<VaultConfig>(["service", "vault"]);
    const config = configData.value || {};

    config.currentProject = project;

    await kv.set(["service", "vault"], config);
    console.log(`Текущий проект установлен: ${project}`);
  } catch (error) {
    console.error("Ошибка при установке текущего проекта:", error);
  }
}

export async function setCurrentEnv(env: string): Promise<void> {
  try {
    const configData = await kv.get<VaultConfig>(["service", "vault"]);
    const config = configData.value || {};

    config.currentEnv = env;

    await kv.set(["service", "vault"], config);
    console.log(`Текущее окружение установлено: ${env}`);
  } catch (error) {
    console.error("Ошибка при установке текущего окружения:", error);
  }
}
