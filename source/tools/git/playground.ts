// import { bash, sh, shelly, zsh } from "@vseplet/shelly";
// import { ensureFile } from "https://deno.land/std/fs/mod.ts";
// import { checShell, shellConfigFile } from "./commands/service.ts";

// // test()
// const selectedUserName = "Mikhail_Svetlov"
// const PATHTOGITCONFIG = `${Deno.env.get("HOME")}/.ssh/DOT/config`;

// async function testDel(kv: Deno.Kv, key: string): Promise<void> {
//   const iterator = kv.list({ prefix: [key] });
//   console.log(iterator)
//   const batch = kv.atomic();

//   for await (const entry of iterator) {
//     batch.delete(entry.key);
//   }

//   await batch.commit();
//   console.log(`All entries for key "${key}" have been deleted.`);
// }

// async function test() {
//   const kv = await Deno.openKv();
//   await testDel(kv, "userName:");
//   kv.close();
// }

// test();
