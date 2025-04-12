import { shelly } from "@vseplet/shelly";
import { OS_NAME } from "$/constants";

export const read = async (): Promise<string | null> => {
  try {
    const cmd = {
      darwin: ["pbpaste"],
      linux: ["xsel", "-b", "-o"],
      windows: ["powershell", "-noprofile", "-command", "Get-Clipboard"],
      android: "",
      freebsd: "",
      netbsd: "",
      aix: "",
      solaris: "",
      illumos: "",
    }[OS_NAME];

    if (cmd === "") return null;
    const res = await shelly(cmd);
    return res.stdout;
  } catch (e: unknown) {
    console.log(e);
    return null;
  }
};

export const hello = () => {
  console.log("Hello!");
};

export const write = async (text: string) => {
  try {
    const cmd = {
      darwin: ["pbcopy"],
      linux: ["xsel", "-b", "-i"],
      windows: [
        "powershell",
        "-noprofile",
        "-command",
        `$input | Set-Clipboard`,
      ],
      android: "",
      freebsd: "",
      netbsd: "",
      aix: "",
      solaris: "",
      illumos: "",
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
  clipboard: {
    read,
    write,
  },
};
