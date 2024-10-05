import { Command } from "@cliffy/command";
import { readLines } from "https://deno.land/std/io/mod.ts";
import { Select } from "https://deno.land/x/cliffy@v1.0.0-rc.3/prompt/mod.ts";

export async function getUserInput(prompt: string): Promise<string> {
  console.log(prompt);
  for await (const line of readLines(Deno.stdin)) {
    return line.trim();
  }
  throw new Error("No input received");
}

export async function createNewProfile() {
  const name = await getUserInput("Please enter a name:");
  const ssh = "Empty";
  const kv = await Deno.openKv();
  const newSsh = ssh;

  await kv.set(["Name:", name], ["SSH", ssh]);

  console.log(`User ${name} saved successfully`);

  kv.close();
}

export async function getProfileList(): Promise<Array<Deno.KvEntry<string>>> {
  const kv = await Deno.openKv();

  const iter = kv.list<string>({ prefix: ["Name:"] });
  const users = [];

  for await (const res of iter) users.push(res);

  kv.close();

  return users;
}

export async function chooseProfile() {
  const data = await getProfileList();
  if (data.length > 0) {
    const selectedUser = await Select.prompt({
      message: "Choose user:",
      options: data.map((key) => ({
        name: key.key[1] as string,
        value: { name: key.key[1], ssh: key.value[1] },
      })),
    });
    const { name, ssh } = selectedUser;
    console.log(`You selected: ${name}`);
    console.log(`SSH value: ${ssh}`);
  } else {
    console.log("No users found.");
  }
}

async function chooseProfileBeta(
  dataArray: Array<Deno.KvEntry<string>>,
  action: (first: string, second: string) => void,
) {
  const data = await dataArray;
  if (data.length > 0) {
    // надо разобраться
    const selectedObject = await Select.prompt({
      message: "Choose user:",
      options: data.map((key) => ({
        name: key.key[1] as string,
        value: { first: key.key[1], second: key.value[1] },
      })),
    });

    console.log(selectedObject);

    // console.log(selectedObject.value as { first: string; second: string });

    // TODO временный костыль
    const { first, second } = selectedObject as unknown as {
      first: string;
      second: string;
    };

    console.log(first);
    console.log(second);

    // action(first as string, second as string);
  } else {
    console.log("No data found.");
  }
}

async function testChooseProfileBeta() {
  const data = await getProfileList();
  chooseProfileBeta(data, (name, ssh) => {
    console.log(name, ssh);
  });
}

export async function deleteProfile() {
  const data = await getProfileList();
}

// createNewProfile();

// getProfileList()
// chooseProfile()

testChooseProfileBeta();
