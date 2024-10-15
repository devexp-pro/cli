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
          sshKey: (key.value as unknown as { connectedSSH: string }).connectedSSH,
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
        name: key.key[1] as string,
        value: { keyName: key.key[1], conectionUser: key.value[1] },
      })),
    });

    const { keyName, conectionUser } = selectedObject as unknown as {
      keyName: string;
      conectionUser: string;
    };

    return [keyName, conectionUser];
  } else {
    return undefined;
  }
}
