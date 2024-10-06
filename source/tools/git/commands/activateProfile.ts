import { readGitConfigFile } from "./helpers.ts";
import { chooseUser } from "./userManager.ts";
import { shelly } from "@vseplet/shelly";
import { startupSetup } from "./creatingEnvironment.ts";
import { PATH_TO_DOT, PATH_TO_GIT_CONFIG } from "../constants.ts";

async function setActiveProfile(username: string, sshKey: string) {
  const kv = await Deno.openKv();
  await kv.set(["activeProfile"], [username]);
  await kv.set(["activeSSHKey"], [sshKey]);
  kv.close();
}

function stringifySSHConfig(
  config: { key: string; value: string }[] | undefined,
): string {
  if (config === undefined) {
    return "";
  }
  return config.map((entry) => `${entry.key} ${entry.value}`).join("\n");
}

async function changeSSHConfig(key: string, newValue: string) {
  const rawData = await readGitConfigFile(PATH_TO_GIT_CONFIG);

  if (rawData !== undefined) {
    const entry = rawData.find((entry) => entry.key === key);
    if (entry) {
      entry.value = newValue;
      const convertResult = stringifySSHConfig(rawData);
      await Deno.writeTextFile(PATH_TO_GIT_CONFIG, convertResult);
      return { success: true };
    } else {
      console.error(`Key "${key}" not found in the config.`);
      return { success: false };
    }
  } else {
    console.log("Error getting config");
  }
}

export async function activateProfile() {
  const selectedUser = await chooseUser(false);
  const selectedUserName = selectedUser?.name ?? "Empty";

  console.log(selectedUserName);

  const selectedUserSSHKey = selectedUser?.connectedSSH ?? "Empty";
  const selectedUserEmail = selectedUser?.email ?? "Empty";

  await startupSetup();

  if (selectedUser !== undefined) {
    if (selectedUserSSHKey === "Empty") {
      console.log("This user does not have an SSH key attached.");
    } else {
      const newKey = await changeSSHConfig(
        "IdentityFile",
        `${PATH_TO_DOT}${selectedUserSSHKey}`,
      ) || { success: false };
      if (newKey.success === true) {
        await shelly([
          "git",
          "config",
          "--global",
          "--replace-all",
          "user.name",
          `${selectedUserName}`,
        ]);
        await shelly([
          "git",
          "config",
          "--global",
          "--replace-all",
          "user.email",
          `${selectedUserEmail}`,
        ]);
        await setActiveProfile(selectedUserName, selectedUserSSHKey);
        console.log(`Profile ${selectedUserName} activated successfully`);
      } else {
        console.log("Error changing SSH config");
      }
    }
  } else {
    console.log("Error selecting user");
    console.log(
      "You may need to first create a user and connected it with a key.",
    );
  }
}

export async function showActiveProfileStatus(returnData: boolean) {
  const kv = await Deno.openKv();
  const activeProfile = await kv.get(["activeProfile"]);
  const activeSSHKey = await kv.get(["activeSSHKey"]);
  kv.close();

  if (activeProfile.value === null || activeSSHKey.value === null) {
    console.log("There is no current active profile");
    return false;
  }

  if (returnData === false) {
    console.log(
      `Current active profile: ${activeProfile?.value} | Current active SSH key: ${activeSSHKey?.value}`,
    );
  } else {
    const username = activeProfile.value;
    const ssh = activeSSHKey.value;

    return { username, ssh };
  }
}

export async function deactivateProfile() {
  const kv = await Deno.openKv();
  const activeProfile = await kv.get(["activeProfile"]);
  const activeSSHKey = await kv.get(["activeSSHKey"]);
  if (activeProfile.value === null || activeSSHKey.value === null) {
    console.log("No active profile");
  }

  await kv.delete(["activeProfile"]);
  await kv.delete(["activeSSHKey"]);

  kv.close();

  console.log("Profile deactivated successfully");
}
