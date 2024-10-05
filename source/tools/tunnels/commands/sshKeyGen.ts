import { readLines } from "https://deno.land/std/io/mod.ts";
import { shelly, zsh } from "@vseplet/shelly";
import { Select } from "https://deno.land/x/cliffy@v1.0.0-rc.3/prompt/mod.ts";

export function hasCyrillicCharacters(str: string): boolean {
  return /[\u0400-\u04FF]/.test(str);
}

export async function getUserInput(prompt: string): Promise<string> {
  console.log(prompt);
  for await (const line of readLines(Deno.stdin)) {
    const trimmedLine = line.trim();
    if (hasCyrillicCharacters(trimmedLine)) {
      console.log(
        "Error: Cyrillic characters are not allowed. Please try again.",
      );
      continue;
    }
    return trimmedLine;
  }
  throw new Error("No input received");
}

export async function createNewSshKey() {
  const kv = await Deno.openKv();

  const name = await getUserInput("Enter a name for the SSH key:");
  const email = await getUserInput("Enter your email:");
  const ssh = await zsh(`ssh-keygen -t ed25519 -C ${email} -f ~/.ssh/${name}`);

  if (ssh.success === true) {
    console.log("SSH key generated successfully");
    const sshKeyAdress = { "Adress": `~/.ssh/${name}` };
    await kv.set(["SSH:", name], ["keyAdress", sshKeyAdress]);
  } else {
    console.log("Error: SSH key generation failed");
  }
  kv.close();
}

export async function getAllSshKeysList(): Promise<
  Array<Deno.KvEntry<string>>
> {
  const kv = await Deno.openKv();
  const iter = await kv.list<string>({ prefix: ["SSH:"] });
  const keys = [];

  for await (const res of iter) keys.push(res);

  kv.close();
  return keys;
}

export async function selectSshKey() {
  const sshKeys = await getAllSshKeysList();
  if (sshKeys.length > 0) {
    const selectedKey = await Select.prompt({
      message: "Choose an SSH key:",
      options: sshKeys.map((key) => ({
        name: key.key[1] as string,
        value: key.key[1] as string,
      })),
    });
    console.log(`You selected: ${selectedKey}`);
  } else {
    console.log("No SSH keys found.");
  }
}

// createNewSshKey();
// getAllSshKeysList();
// selectSshKey()
