export const kv = Deno.env.get("DEV")
  ? await Deno.openKv("ololo")
  : await Deno.openKv();

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
