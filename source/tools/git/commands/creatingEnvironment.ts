import { ensureFile } from "@std/fs";
import { shelly } from "@vseplet/shelly";
import { shellConfigFile } from "./helpers.ts";
import { PATH_TO_DOT, PATH_TO_GIT_CONFIG } from "../constants.ts";
import { kv } from "$/kv";

const initialConfigFilling = `Host default
HostName github.com
User git
AddKeysToAgent yes
UseKeychain yes
IdentityFile empty
IdentitiesOnly yes
UserKnownHostsFile ${PATH_TO_DOT}known_hosts`;

export async function startupSetup() {
  const status = await checkIfDotFolderExist();
  if (status === true) {
    return;
  } else {
    await createBackupUserData();
    await createEnvironment();
    await shellSetup();
    await shelly([
      "export",
      `GIT_SSH_COMMAND="ssh -F ' + ${PATH_TO_GIT_CONFIG}"`,
    ]);
    console.log("Initial setup completed successfully");
  }
}

export async function checkIfDotFolderExist(): Promise<boolean> {
  let isExist = false;
  try {
    const dirInfo = await Deno.stat(PATH_TO_DOT);
    if (dirInfo.isDirectory) {
      isExist = true;
    }
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      isExist = false;
    }
  }
  return isExist;
}

async function createEnvironment() {
  await Deno.mkdir(PATH_TO_DOT, { recursive: true });

  await ensureFile(PATH_TO_GIT_CONFIG);

  await ensureFile(`${PATH_TO_DOT}known_hosts`);
  await Deno.writeTextFile(PATH_TO_GIT_CONFIG, initialConfigFilling);
}

async function createBackupUserData() {
  const currentUsername = await shelly([
    "git",
    "config",
    "--global",
    "user.name",
  ]);
  const currentEmail = await shelly([
    "git",
    "config",
    "--global",
    "user.email",
  ]);

  await kv.set(["tool", "git", "OldUsername"], { backupName: currentUsername.stdout, backupEmail: currentEmail.stdout});
}

async function shellSetup() {
  const shellConfig = await shellConfigFile();

  const pathToShellConfig = `${Deno.env.get("HOME")}/${shellConfig}`;

  const shellUpdateLine = 'export GIT_SSH_COMMAND="ssh -F ' +
    PATH_TO_GIT_CONFIG +
    '"';
  await ensureFile(pathToShellConfig);
  const file = await Deno.open(pathToShellConfig, {
    write: true,
    append: true,
  });
  const encoder = new TextEncoder();
  await file.write(encoder.encode("\n" + shellUpdateLine));
  file.close();
}
