export const kv = await Deno.openKv(Deno.env.get("DEV") ? "ololo" : "");
