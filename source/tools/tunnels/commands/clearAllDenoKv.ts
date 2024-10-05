import { getUserInput } from "./profileManager.ts";

async function clearEntireDatabase(kv: Deno.Kv): Promise<void> {
  const iterator = kv.list({ prefix: [] });
  const batchSize = 100;
  let batch: Deno.KvKey[] = [];

  for await (const entry of iterator) {
    batch.push(entry.key);

    if (batch.length >= batchSize) {
      const atomicOp = kv.atomic();
      for (const key of batch) {
        atomicOp.delete(key);
      }
      await atomicOp.commit();
      batch = [];
    }
  }

  if (batch.length > 0) {
    const atomicOp = kv.atomic();
    for (const key of batch) {
      atomicOp.delete(key);
    }
    await atomicOp.commit();
  }

  console.log("Database terminated successfully.");
}

export async function terminateDB() {
  const kv = await Deno.openKv();
  await clearEntireDatabase(kv);
  kv.close();
}

export async function confirmTermination() {
  const confirmation = await getUserInput(
    "Are you sure you want to terminate the entire database? (yes/no): ",
  );
  if (confirmation.toLowerCase() === "yes") {
    await terminateDB();
  } else {
    console.log("Database termination cancelled.");
  }
}
