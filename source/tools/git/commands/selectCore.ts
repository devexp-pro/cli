import { Select } from "https://deno.land/x/cliffy@v1.0.0-rc.3/prompt/mod.ts";

export async function selectUserCore(dataArray: Array<Deno.KvEntry<string>>) {
  const data = await dataArray;

  if (data.length > 0) {
    const selectedObject = await Select.prompt({
      message: "Select User",
      options: data.map((key) => ({
        name: key.key[1] as string,
        value: {
          userName: key.key[1],
          sshKey: key.value[1],
          email: key.value[3],
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
