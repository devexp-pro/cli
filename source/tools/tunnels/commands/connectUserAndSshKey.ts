import { Select } from "https://deno.land/x/cliffy@v1.0.0-rc.3/prompt/mod.ts";
import { getProfileList } from "./profileManager.ts";
import { getAllSshKeysList } from "./sshKeyGen.ts";

async function keyRecording(user: string, sshKey: string) {
  const kv = await Deno.openKv();
  // const existingUser = await kv.get(["Name:", user]);

  await kv.set(["Name:", user], ["SSH", sshKey]);

  console.log(`User ${user} connected to SSH key ${sshKey}`);

  kv.close();
}

export async function connectUserToSsh() {
  const userList = await getProfileList();
  const sshList = await getAllSshKeysList();

  if (userList.length > 0) {
    const selectedUser = await Select.prompt({
      message: "Choose user:",
      options: userList.map((key) => ({
        name: key.key[1] as string,
        value: { name: key.key[1], ssh: key.value[1] },
      })),
    });
    const { name, ssh } = selectedUser;

    const selectedSsh = await Select.prompt({
      message: "Choose SSH:",
      options: sshList.map((key) => ({
        name: key.key[1] as string,
        value: { nameKey: key.key[1], sshKey: key.value[1] },
      })),
    });

    const { nameKey, sshKey } = selectedSsh;

    console.log(`SSH key: ${nameKey}`);
    console.log(`You selected: ${name}`);
    console.log(`SSH value: ${ssh}`);
    console.log(`You selected ssh key: ${nameKey}`);

    await keyRecording(name, nameKey);
  } else {
    console.log("No users found.");
  }
}

//   connectUserToSsh();
