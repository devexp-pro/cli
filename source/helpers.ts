import { kv } from "$/kv";

export async function fetchJSON(url: URL | string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Response not OK (${response.status})`);
  return await response.json();
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

      return sessionId;
    }

    console.log("Активная сессия не найдена.");
    return null;
  } catch (error) {
    console.error("Ошибка при попытке получить sessionId:", error);
    return null;
  }
}
