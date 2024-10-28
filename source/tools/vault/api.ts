import apifly, { ApiflyClient } from "@vseplet/apifly";
import type { GuardenDefinition } from "./GuardenDefinition.ts";
import { kv } from "$/kv";
import { SERVICE_URL } from "$/constants";

export async function createClient(): Promise<ApiflyClient<GuardenDefinition>> {
  const session_id = await getSessionID();
  if (session_id === null) throw new Error("No SESSION ID! Authorize first");

  return new apifly.client<GuardenDefinition>({
    baseURL: `${SERVICE_URL}/tool/vault`,
    headers: {
      Authorization: session_id,
    },
    limiter: { unlimited: true },
  });
}

export async function getSessionID(): Promise<string | null> {
  try {
    const sessionData = await kv.get<{ sessionId: string }>([
      "auth",
      "session",
    ]);

    if (sessionData.value) {
      const sessionId = sessionData.value.sessionId;
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
  currentProjectUUID?: string;
  currentEnvUUID?: string;
}

export async function getCurrentProject(): Promise<
  Partial<VaultConfig> | null
> {
  try {
    const configData = await kv.get<VaultConfig>([
      "service",
      "vault",
      "curConfig",
    ]);

    if (configData.value && configData.value.currentProject) {
      return configData.value;
    }

    console.log("Текущий проект не найден.");
    return null;
  } catch (error) {
    console.error("Ошибка при получении текущего проекта:", error);
    return null;
  }
}

export async function setCurrentProject(
  name: string,
  uuid: string,
): Promise<void> {
  try {
    const configData = await kv.get<VaultConfig>([
      "service",
      "vault",
      "curConfig",
    ]);
    const config = configData.value || {};

    config.currentProject = name;
    config.currentProjectUUID = uuid;

    await kv.set(["service", "vault", "curConfig"], config);
    console.log(`Текущий проект установлен: ${name}`);
  } catch (error) {
    console.error("Ошибка при установке текущего проекта:", error);
  }
}
