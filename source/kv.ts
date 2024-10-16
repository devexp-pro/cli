export const kv = Deno.env.get("DEV")
  ? await Deno.openKv("ololo")
  : await Deno.openKv();
