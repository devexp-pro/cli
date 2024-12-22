import { join } from "@std/path";

export const openKv = async () => {
  const dbDir = Deno.build.os === "windows"
    ? Deno.env.get("APPDATA") || Deno.env.get("USERPROFILE")
    : Deno.env.get("HOME");

  if (!dbDir) {
    throw new Error("Не удалось определить домашнюю директорию.");
  }

  const dbPath = join(dbDir, ".dx", "kv");

  try {
    await Deno.mkdir(join(dbDir, ".dx"), { recursive: true });
    console.log(`Директория .dx успешно создана по пути: ${dbPath}`);
  } catch (err) {
    if (err instanceof Deno.errors.AlreadyExists) {
      console.log(`Директория .dx уже существует по пути: ${dbPath}`);
    } else {
      console.error("Ошибка при создании директории:", err);
    }
  }

  return Deno.env.get("LOCAL_DEV")
    ? await Deno.openKv("local-kv")
    : await Deno.openKv(dbPath);
};

export const kv = await openKv();
