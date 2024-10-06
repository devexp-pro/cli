import { shelly } from "@vseplet/shelly";
import { Confirm } from "https://deno.land/x/cliffy@v1.0.0-rc.3/prompt/mod.ts";
import { deactivateProfile } from "./activateProfile.ts";
import { shellConfigFile } from "./helpers.ts";
import { PATH_TO_DOT, PATH_TO_GIT_CONFIG } from "../constants.ts";

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
  const kv = await Deno.openKv();
  const user = await kv.get<string>(["OldUsername"]);
  const username = user.value ? user.value[0].trim() : "Empty";
  const email = user.value ? user.value[1].trim() : "Empty";

  kv.close();

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
  const kv = await Deno.openKv();
  await deletionDenoKvTemplate(kv, "activeProfile");
  await deletionDenoKvTemplate(kv, "activeSSHKey");
  await deletionDenoKvTemplate(kv, "userName:");
  await deletionDenoKvTemplate(kv, "sshKeyName:");
  await deletionDenoKvTemplate(kv, "OldUsername");
  kv.close();
}

async function deletionDenoKvTemplate(kv: Deno.Kv, key: string): Promise<void> {
  const iterator = kv.list({ prefix: [key] });
  const batch = kv.atomic();

  for await (const entry of iterator) {
    batch.delete(entry.key);
  }

  await batch.commit();
}