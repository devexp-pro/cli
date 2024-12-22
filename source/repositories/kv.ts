import { join } from "@std/path";

export const openKv = async () => {
  const dbDir = Deno.build.os === "windows"
    ? Deno.env.get("APPDATA") || Deno.env.get("USERPROFILE")
    : Deno.env.get("HOME");

  if (!dbDir) {
    throw new Error("Failed to determine the home directory.");
  }

  const dbPath = join(dbDir, ".dx", "kv");

  try {
    await Deno.mkdir(join(dbDir, ".dx"), { recursive: true });
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
