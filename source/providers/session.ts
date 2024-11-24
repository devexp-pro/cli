import { kv } from "$/repositories/kv.ts";
import { config } from "$/providers/config.ts";

export type SessionData = {
  key: string;
  email: string;
  id: string;
  username: string;
};

export async function getSessionID(): Promise<string | null> {
  try {
    const sessionData = await kv.get<{ sessionId: string }>([
      "auth",
      "session",
    ]);

    if (sessionData.value) {
      return sessionData.value.sessionId;
    }

    console.log("Активная сессия не найдена.");
    return null;
  } catch (error) {
    console.error("Ошибка при попытке получить sessionId:", error);
    return null;
  }
}

export async function getSession(): Promise<SessionData | null> {
  try {
    const sessionData = await kv.get<SessionData>(["auth", "session"]);

    if (sessionData.value) {
      return sessionData.value;
    }

    console.log("Активная сессия не найдена.");
    return null;
  } catch (error) {
    console.error("Ошибка при попытке получить sessionId:", error);
    return null;
  }
}

export async function setSessionWithExpiration(
  data: SessionData,
): Promise<void> {
  try {
    const sessionTTL = config.data.features.auth.times.sessionTTL;

    await kv.set(["auth", "session"], data, { expireIn: sessionTTL });
  } catch (error) {
    console.error("Ошибка при сохранении сессии:", error);
  }
}
