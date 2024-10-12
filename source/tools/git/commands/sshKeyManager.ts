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
import { PATH_HOME, PATH_TO_DOT } from "../constants.ts";
import { kv } from "$/kv";
import { Command } from "@cliffy/command";
import { deactivateProfile } from "./activateProfile.ts";

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

    await deleteSshKeyCore(keyName);
  }
}

export async function deleteSshKeyCore(nameSshKey: string) {
  const sshKey = await getAllSshKeysList();
  if (sshKey.length === 0) {
    console.log("No data found.");
  } else {

    const result = sshKey.find(key => key.key[1] === nameSshKey); 

    const keyName = String(result?.key[1]) ?? "Unknown"; 
    const connectedUser = String(result?.value[1]) ?? "Unknown"; 

    
    const pathToDelete = `${PATH_TO_DOT}${keyName}`;
    const pathToDeletePubKey = `${PATH_TO_DOT}${keyName}.pub`;
     
    if (await checkIsThisActive(keyName)) {
      await deactivateProfile();
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

export const deleteSshKeyCommand = new Command()
  .name("deleteSSH")
  .description("Delete SSH key")
  .arguments("<ssh_key_name:string>")
  .action(async (_options, ...args) => {
    const [name] = args
    await deleteSshKeyCore(name);
  })

export const createNewSshKeyCommand = new Command()
  .name("createSSH")
  .description("Create new SSH key")
  .arguments("<ssh_key_name:string> <email:string>")
  .action(async (_options, ...args) => {
    const [name, email] = args
    await createNewSshKeyWithArgs(name, email);
  })
  
export const showAllSshKeysCommand = new Command()
  .name("showAllSSH")
  .description("Show all SSH keys")
  .action(async () => {
    const sshKeys = await getAllSshKeysList();
    sshKeys.forEach(async (sshKey) => {
      const publicKey = await readPublicKey(String(sshKey.key[1])); 
      console.log(`Name: ${String(sshKey.key[1])} | Public Key: ${publicKey}`); 
    });
  })



