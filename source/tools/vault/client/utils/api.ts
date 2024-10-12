import apifly, { ApiflyClient } from "jsr:@vseplet/apifly";

import { getToken, removeToken, saveToken } from "./config.ts";
import { yellow } from "../deps.ts";
import type { GuardenDefinition } from "../../GuardenDefinition.ts";
import { baseGuardenURL } from "../../deps.ts";

export async function createClient(): Promise<ApiflyClient<GuardenDefinition>> {
  const token = await getToken();

  return new apifly.client<GuardenDefinition>({
    baseURL: baseGuardenURL,
    headers: token
      ? {
        Authorization: token,
      }
      : undefined,
    limiter: { unlimited: true },
  });
}

export async function generateToken(userId: string): Promise<string> {
  try {
    const client = new apifly.client<GuardenDefinition>({
      baseURL: baseGuardenURL,
      headers: {
        new: "true",
      },
      limiter: { unlimited: true },
    });

    const response = await client.call("generateToken", [userId]);

    if (!response.success) {
      throw new Error(response.message);
    }

    const token = response.token;
    await saveToken(token);
    return token;
  } catch (error) {
    if ((error as Error).message.includes("Неверный или просроченный токен")) {
      console.log(
        yellow("Локальный токен не найден в базе данных. Сбрасываем токен..."),
      );
      await removeToken();
    }
    throw new Error(`Ошибка при генерации токена: ${(error as Error).message}`);
  }
}

export async function createProject(
  projectName: string,
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const client = await createClient();
    const response = await client.call("createProject", [projectName]);

    if (!response.success) {
      return {
        success: false,
        error: response.error || "Ошибка при создании проекта",
      };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
