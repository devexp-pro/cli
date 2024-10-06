import { Input } from "https://deno.land/x/cliffy@v1.0.0-rc.4/prompt/input.ts";
import { chooseUser } from "./userManager.ts";

export function hasCyrillicCharacters(str: string): boolean {
  return /[\u0400-\u04FF]/.test(str);
}

export async function getUserInput(prompt: string): Promise<string> {
  const line = await Input.prompt(prompt);
  const trimmedLine = line.trim();
  if (hasCyrillicCharacters(trimmedLine)) {
    console.log(
      "Error: Cyrillic characters are not allowed. Please try again.",
    );
    return getUserInput(prompt);
  } else {
    if (trimmedLine === "") {
      console.log("Error: Input cannot be empty. Please try again.");
      return getUserInput(prompt);
    } else {
      return trimmedLine;
    }
  }
}

export async function readPublicKey(name: string) {
  const filePath = `${Deno.env.get("HOME")}/.ssh/DOT/${name}.pub`;
  const publicKey = await Deno.readTextFile(filePath);
  return publicKey;
}

export async function readGitConfigFile(filePath: string) {
  try {
    const content = await Deno.readTextFile(filePath);
    const lines = content.split("\n");
    const rezult = [];
    for (const line of lines) {
      const trimmedLine = line.trim();

      if (trimmedLine) {
        const [key, value] = trimmedLine.split(/\s+/);
        rezult.push({ key, value });
      }
    }
    return rezult;
  } catch (error) {
    console.error(`An error occurred: ${error.message}`);
  }
}

export async function disconnectSshKeyAndUser(
  username: string,
  keyName: string,
) {
  const kv = await Deno.openKv();
  const user = await kv.get<string>(["userName:", username]);

  const email = user.value ? user.value[3] : "Empty";

  await kv.set(["userName:", username], [
    "connectedSSH",
    "Empty",
    "Email:",
    email,
  ]);
  await kv.set(["sshKeyName:", keyName], ["connectedUser", "Empty"]);

  console.log(`User ${username} disconnected to SSH key ${keyName}`);

  kv.close();
}

export async function manualDisconnectSshKeyAndUser() {
  const user = await chooseUser(false);

  const userName = user?.name ?? "Unknown";
  const sshName = user?.connectedSSH ?? "Unknown";

  if (await checkIsThisActive(userName)) {
    console.log("You can't disconnect active user. Deactivate profile first.");
    return;
  }

  await disconnectSshKeyAndUser(userName, sshName);
}

export async function deleteSelectedKvObject(key: string, value: string) {
  const kv = await Deno.openKv();
  await kv.delete([key, value]);
  kv.close();
}

export async function checkIsThisActive(usernameOrSSHKey: string) {
  const kv = await Deno.openKv();
  const activeProfile = await kv.get(["activeProfile"]);
  const activeSSHKey = await kv.get(["activeSSHKey"]);
  const activeProfileName = activeProfile?.value ?? "Empty";
  const activeSSHKeyName = activeSSHKey?.value ?? "Empty";
  kv.close();

  if (
    `${activeProfileName}` === usernameOrSSHKey ||
    `${activeSSHKeyName}` === usernameOrSSHKey
  ) {
    return true;
  } else {
    return false;
  }
}

export async function checShell() {
  const cmd = new Deno.Command("sh", {
    args: ["-c", "echo $SHELL"],
  });

  const { stdout } = await cmd.output();
  const fullPath = new TextDecoder().decode(stdout).trim();

  const shellName = fullPath.split("/").pop();

  if (shellName) {
    return shellName;
  } else {
    console.log("Unable to determine shell name");
  }
}

export async function shellConfigFile() {
  const shell = await checShell();
  if (shell === "zsh") {
    return (".zshrc");
  } else if (shell === "bash") {
    return (".bashrc");
  } else if (shell === "sh") {
    return (".profile");
  }
}

export async function fetchJSON(url: URL | string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Response not OK (${response.status})`);
  return await response.json();
}
