import { entry } from "./commands/entry.ts";

await entry.parse(Deno.args);

// connect(WS_URL, tunnelName);
