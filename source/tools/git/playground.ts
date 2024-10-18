// import { bash, sh, shelly, zsh } from "@vseplet/shelly";
// import { ensureFile } from "https://deno.land/std/fs/mod.ts";
// import { checShell, shellConfigFile } from "./commands/tool.ts";
// import { kv } from "$/kv";

// async function deleteSelectedKvObject(key: Deno.KvKeyPart[], value: string) {
//   const iterator = kv.list({ prefix: key });

//   // console.log(iterator);

//   const batch = kv.atomic();

//   for await (const entry of iterator) {
//     console.log(entry);
//     if (entry.key[3] === value) {
//       const testKey = entry.key;
//       console.log(`!!!Found!!! ${entry.key[3]}`);
//       console.log("-----------------");
//       console.log(testKey);
//       console.log("-----------------");
//       batch.delete(testKey);
//     }
//   }

//   await batch.commit();

// }

// deleteSelectedKvObject(["tool", "git", "userName:"], "test");
