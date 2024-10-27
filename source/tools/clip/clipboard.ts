import { shelly } from "@vseplet/shelly";
import { OS_NAME } from "$/constants";

export const read = async (): Promise<string | null> => {
  try {
    const cmd = {
      "darwin": ["pbpaste"],
      "linux": ["xsel", "-b", "-o"],
      "windows": ["powershell", "-noprofile", "-command", "Get-Clipboard"],
      "android": "",
      "freebsd": "",
      "netbsd": "",
      "aix": "",
      "solaris": "",
      "illumos": "",
    }[OS_NAME];

    if (cmd === "") return null;
    const res = await shelly(cmd);
    return res.stdout;
  } catch (e: unknown) {
    console.log(e);
    return null;
  }
};

export const write = async (text: string) => {
  try {
    const cmd = {
      "darwin": ["pbcopy"],
      "linux": "",
      "windows": "",
      "android": "",
      "freebsd": "",
      "netbsd": "",
      "aix": "",
      "solaris": "",
      "illumos": "",
    }[OS_NAME];

    if (cmd === "") return null;
    const res = await shelly(cmd, { input: text });
    return res.stdout;
  } catch (e: unknown) {
    console.log(e);
    return null;
  }
};

export default {
  read,
  write,
};
