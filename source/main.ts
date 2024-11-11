import { entry } from "./commands/mod.ts";

await entry.parse(Deno.args);
Deno.exit()
// console.log(import.meta);
