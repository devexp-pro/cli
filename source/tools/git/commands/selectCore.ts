import { Select } from "@cliffy/prompt";

export async function selectUserCore(dataArray: Array<Deno.KvEntry<string>>) {
  const data = await dataArray;

  if (data.length > 0) {
    const selectedObject = await Select.prompt({
      message: "Select User",
      options: data.map((key) => ({
        name: key.key[3] as string,
        value: {
          userName: key.key[3],
          sshKey:
            (key.value as unknown as { connectedSSH: string }).connectedSSH,
          email: (key.value as unknown as { Email: string }).Email,
        },
      })),
    });

    const { userName, sshKey, email } = selectedObject as unknown as {
      userName: string;
      sshKey: string;
      email: string;
    };

    return [userName, sshKey, email];
  } else {
    return undefined;
  }
}

export async function selectSshKeyCore(dataArray: Array<Deno.KvEntry<string>>) {
  const data = await dataArray;

  if (data.length > 0) {
    const selectedObject = await Select.prompt({
      message: "Select SSH Key",
      options: data.map((key) => ({
        name: key.key[3] as string,
        value: {
          name: key.key[3],
          conectionUser:
            (key?.value as unknown as { connectedUser: string }).connectedUser,
        },
      })),
    });

    const { name, conectionUser } = selectedObject as unknown as {
      name: string;
      conectionUser: string;
    };

    return [name, conectionUser];
  } else {
    return undefined;
  }
}
