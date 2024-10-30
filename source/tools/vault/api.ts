import apifly, { ApiflyClient } from "@vseplet/apifly";
import type { GuardenDefinition, TUUID } from "./GuardenDefinition.ts";
import { getSession, getSessionID, kv } from "$/kv";
import { SERVICE_URL } from "$/constants";

export async function createClient(): Promise<ApiflyClient<GuardenDefinition>> {
  const session = await getSession();
  if (session === null)throw new Error("No SESSION! Authorize first");
  // key: string;
  // email: string;
  // id: string;
  // username: string;
  console.log(session)
  if (session.id === null) throw new Error("No SESSION ID! Authorize first");
  return new apifly.client<GuardenDefinition>({
    baseURL: `${SERVICE_URL}/vault`,
    headers: {
      Authorization: session.key,
      Identifier: session.id
    },
    limiter: { unlimited: true },
  });
}

// export async function getSessionID(): Promise<string | null> {
//   try {
//     const sessionData = await kv.get<{ sessionId: string }>([
//       "auth",
//       "session",
//     ]);

//     if (sessionData.value) {
//       const sessionId = sessionData.value.sessionId;
//       return sessionId;
//     }

//     console.log("Активная сессия не найдена.");
//     return null;
//   } catch (error) {
//     console.error("Ошибка при попытке получить sessionId:", error);
//     return null;
//   }
// }

interface VaultConfig {
  currentProject?: string;
  currentEnv?: string;
  currentProjectUUID?: TUUID;
  currentEnvUUID?: TUUID;
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
  uuid: TUUID,
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
