import { shelly } from "@vseplet/shelly";
import { Confirm } from "@cliffy/prompt";
import { deactivateProfile } from "./activateProfile.ts";
import { shellConfigFile } from "./helpers.ts";
import { PATH_TO_DOT, PATH_TO_GIT_CONFIG } from "../constants.ts";
import { kv } from "$/kv";

export async function fullReset() {
  console.log("WARNING");
  console.log(
    "Please note that this function will completely remove any changes made by this program.",
  );
  console.log("Including remove profiles and SSH keys created in it.");
  const confirmed: boolean = await Confirm.prompt(
    "Are you sure you want to continue?",
  );
  if (!confirmed) {
    console.log("Cancel reset");
    return;
  }

  deactivateProfile();
  restoreOldUserData();
  resetShellConfig();
  deleteDotFolder(PATH_TO_DOT);
  terminateDB();
  console.log("Database cleared.");

  console.log("Full reset is done.");
}

async function restoreOldUserData() {
  const user = await kv.get<{ backupName: string; backupEmail: string }>(["tool", "git", "OldUsername"]);
  const username = user.value ? user.value.backupName.trim() : "Empty";
  const email = user.value ? user.value.backupEmail.trim() : "Empty";

  await shelly(["git", "config", "--global", "user.name", `${username}`]);
  await shelly(["git", "config", "--global", "user.email", `${email}`]);

  console.log("Old GIT username and email restore successfully");
}

async function resetShellConfig() {
  const shellConfig = await shellConfigFile();

  const pathToShellConfig = `${Deno.env.get("HOME")}/${shellConfig}`;

  const lineToRemove = 'export GIT_SSH_COMMAND="ssh -F ' + PATH_TO_GIT_CONFIG +
    '"';
  const fileContent = await Deno.readTextFile(pathToShellConfig);
  const lines = fileContent.split("\n");
  const newLines = lines.filter((line) => line.trim() !== lineToRemove.trim());

  if (lines.length === newLines.length) {
    console.log("The specified line was not found in the file.");
    return;
  }

  const newContent = newLines.join("\n");
  await Deno.writeTextFile(pathToShellConfig, newContent);
  console.log("Shell config restore successfully");
}

async function deleteDotFolder(folderPath: string): Promise<void> {
  await Deno.remove(folderPath, { recursive: true });
  console.log("DOT folder deleted successfully");
}

async function terminateDB() {
  await deletionDenoKvTemplate(kv, ["tool", "git"]);
  await deletionDenoKvTemplate(kv, ["tool", "git", "activeProfile"]);
  await deletionDenoKvTemplate(kv, ["activeProfile"]);
  await deletionDenoKvTemplate(kv, ["activeSSHKey"]);
  await deletionDenoKvTemplate(kv, ["userName:"]);
  await deletionDenoKvTemplate(kv, ["sshKeyName:"]);
  await deletionDenoKvTemplate(kv, ["OldUsername"]);
}

async function deletionDenoKvTemplate(kv: Deno.Kv, key: Deno.KvKeyPart[]): Promise<void> {
  const iterator = kv.list({ prefix: key });
  const batch = kv.atomic();

  for await (const entry of iterator) {
    batch.delete(entry.key);
  }

  await batch.commit();
}




// Пригождается в разработке.
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

// clearEntireDatabase(kv);
