import * as path from "jsr:@std/path";
import { AliasEntry, Aliases } from "./types.ts";

const HOME = Deno.env.get("HOME") || Deno.env.get("USERPROFILE");
if (!HOME) {
  throw new Error("Cannot determine home directory.");
}
const FILE_PATH = path.join(HOME, ".my-cli-aliases.json");

export async function loadFromFile(): Promise<Aliases> {
  try {
    const content = await Deno.readTextFile(FILE_PATH);
    const parsed = JSON.parse(content);
    if (typeof Object.values(parsed)[0] === "string") {
      const migrated: Aliases = {};
      for (const [k, v] of Object.entries(parsed)) {
        migrated[k] = { command: v as string };
      }
      await saveToFile(migrated);
      return migrated;
    }
    return parsed;
  } catch {
    return {};
  }
}

export async function saveToFile(aliases: Aliases): Promise<void> {
  await Deno.writeTextFile(FILE_PATH, JSON.stringify(aliases, null, 2));
}

export function recordUsageLocal(entry: AliasEntry) {
  if (!entry.usage) entry.usage = [];
  entry.usage.push(new Date().toISOString());
}
