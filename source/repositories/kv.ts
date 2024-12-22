import { join } from "@std/path";

export const openKv = async () => {
  const APP_DIR = join(
    Deno.build.os === "windows"
      ? Deno.env.get("APPDATA") as string ||
        Deno.env.get("USERPROFILE") as string
      : Deno.env.get("HOME") as string,
    ".dx",
  );

  if (!APP_DIR) {
    console.error("Failed to determine the home directory.");
  }

  const dbPath = join(APP_DIR, ".dx", "kv");

  try {
    await Deno.mkdir(join(APP_DIR, ".dx"), { recursive: true });
  } catch (err) {
    if (err instanceof Deno.errors.AlreadyExists) {
      console.log(`The .dx directory already exists at: ${dbPath}`);
    } else {
      console.error("Error creating directory:", err);
    }
  }

  return Deno.env.get("LOCAL_DEV")
    ? await Deno.openKv("local-kv")
    : await Deno.openKv(dbPath);
};

export const kv = await openKv();
