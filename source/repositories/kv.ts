// source/kv.ts

export const kv = Deno.env.get("DEV")
  ? await Deno.openKv("local-kv")
  : await Deno.openKv();
