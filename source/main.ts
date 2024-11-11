import { entry } from "./commands/mod.ts";

await entry.parse(Deno.args);

// console.log(import.meta);
