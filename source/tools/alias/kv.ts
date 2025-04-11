import { AliasEntry, Aliases } from "./types.ts";

export async function loadFromKV(): Promise<Aliases> {
  const kv = await Deno.openKv();
  const entries: Aliases = {};
  for await (const res of kv.list<AliasEntry>({ prefix: ["alias"] })) {
    const key = res.key[1] as string;
    entries[key] = res.value;
  }
  return entries;
}

export async function saveToKV(name: string, entry: AliasEntry): Promise<void> {
  const kv = await Deno.openKv();
  await kv.set(["alias", name], entry);
}

export async function updateUsageKV(name: string): Promise<void> {
  const kv = await Deno.openKv();
  const res = await kv.get<AliasEntry>(["alias", name]);
  if (!res.value) return;
  const updated = {
    ...res.value,
    usage: [...(res.value.usage ?? []), new Date().toISOString()],
  };
  await kv.set(["alias", name], updated);
}
