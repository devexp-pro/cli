import { shelly } from "@vseplet/shelly";
import { selectSshKeyCore } from "./selectCore.ts";
import {
  deleteSelectedKvObject,
  disconnectSshKeyAndUser,
  getUserInput,
  readPublicKey,
} from "./helpers.ts";
import { Confirm } from "@cliffy/prompt";
import { checkIsThisActive } from "./helpers.ts";
import { startupSetup } from "./creatingEnvironment.ts";
import { PATH_TO_DOT } from "../constants.ts";
import { kv } from "$/kv";
import { Command } from "@cliffy/command";

export async function createNewSshKey() {
  await startupSetup();

  const name = await getUserInput("Enter a name for the SSH key:");
  const email = await getUserInput("Enter your email:");
  
  return generateSshKey(name, email)
}

async function createNewSshKeyWithArgs(name: string, email: string) {
  await startupSetup();

  return generateSshKey(name, email);
}

async function generateSshKey(name: string, email: string) {
  const ssh = await shelly([
    "ssh-keygen",
    "-t",
    "ed25519",
    "-C",
    `${email}`,
    "-f",
    `${PATH_TO_DOT}${name}`,
  ]);
  const connectedUser = "Empty";

  if (ssh.success === true) {
    console.log("SSH key generated successfully");
    await kv.set(["sshKeyName:", name], ["connectedUser", connectedUser]);
    await shelly(["ssh-add", "-K", `${PATH_TO_DOT}${name}`]);
    return true;
  } else {
    console.log("Error: SSH key generation failed");
  }
}

export async function getAllSshKeysList(): Promise<
  Array<Deno.KvEntry<string>>
> {
  const iter = await kv.list<string>({ prefix: ["sshKeyName:"] });
  const keys = [];

  for await (const res of iter) keys.push(res);

  return keys;
}

export async function choseSshKey(showDataInConsole: boolean) {
  const sshKeys = await getAllSshKeysList();
  const result = await selectSshKeyCore(sshKeys);

  if (result !== undefined) {
    const name = result?.[0] ?? "Unknown";
    const conection = result?.[1] ?? "Unknown";
    if (showDataInConsole === true) {
      const publicKey = await readPublicKey(name);
      console.log("Name:", name, "|", "Conection user:", conection);
      console.log("Public Key:", publicKey);
    } else {
      return { name, conection };
    }
  } else {
    console.log("No data found.");
  }
}

export async function deleteSshKey() {
  const sshKey = await getAllSshKeysList();
  if (sshKey.length === 0) {
    console.log("No data found.");
  } else {
    const result = await selectSshKeyCore(sshKey);

    const keyName = result?.[0] ?? "Unknown";
    const connectedUser = result?.[1] ?? "Unknown";
    const pathToDelete = `${Deno.env.get("HOME")}/.ssh/DOT/${keyName}`;
    const pathToDeletePubKey = `${
      Deno.env.get("HOME")
    }/.ssh/DOT/${keyName}.pub`;

    if (await checkIsThisActive(keyName)) {
      console.log("You can't delete active key. Deactivate profile first.");
      return;
    }

    if (connectedUser !== "Empty") {
      console.log(
        `This key is connected to a user ${connectedUser}, are you sure you want to delete it?`,
      );
      const confirmed: boolean = await Confirm.prompt("Can you confirm?");
      if (!confirmed) {
        console.log("Key deletion canceled");
        return;
      }
      await disconnectSshKeyAndUser(connectedUser, keyName);
    }

    await deleteSelectedKvObject("sshKeyName:", keyName);
    await shelly(["ssh-add", "-d", `${PATH_TO_DOT}${keyName}`]);
    await shelly([
      "security",
      "delete-generic-password",
      "-l",
      "SSH:",
      `${PATH_TO_DOT}${keyName}`,
    ]);
    await Deno.remove(pathToDelete);
    await Deno.remove(pathToDeletePubKey);
    console.log(`Key ${keyName} deleted successfully`);
  }
}

export const createNewSshKeyCommand = new Command()
  .name("createSSH")
  .description("Create new SSH key")
  .arguments("<ssh_key_name:string> <email:string>")
  .action(async (_, name, email) => {
    await createNewSshKeyWithArgs(name, email);
  });
