import { shelly } from "@vseplet/shelly";
import { kv } from "$/repositories/kv.ts";

export enum MODE_TYPE {
  LOCAL_DEV = "LOCAL_DEV", // установлено и запущено из исходников с dev конфигом
  LOCAL_PROD = "LOCAL_PROD", // установлено и запущено из исходников с prod конфигом
  REMOTE_BRANCH = "REMOTE_BRANCH", // установлено и запущено из ветки репозитория
  REMOTE_TAG = "REMOTE_TAG", // установлено и запущено из тэга репозитория
}

export const IMU = import.meta.url;
export const IS_REMOTE = IMU.includes("raw.githubusercontent.com");
export const IS_LOCAL = !IS_REMOTE;
export const IS_LOCAL_DEV = IS_LOCAL &&
  (Deno.env.get("LOCAL_DEV") !== undefined &&
    Deno.env.get("LOCAL_DEV") == "true");
export const IS_LOCAL_PROD = IS_LOCAL &&
  (Deno.env.get("LOCAL_DEV") !== undefined &&
    Deno.env.get("LOCAL_DEV") == "false");

export const GIT_COMMIT_HASH = IMU.match(/(?<=\/)[a-f0-9]{40}(?=\/)/)?.[0] ||
  null;
export const GIT_BRANCH = (await kv.get<{ branch: string }>(["version"])).value
  ?.branch || null;
export const GIT_TAG = (await kv.get<{ tag: string }>(["version"])).value
  ?.tag || null;

export const MODE = IS_LOCAL_DEV
  ? MODE_TYPE.LOCAL_DEV
  : IS_LOCAL_PROD
  ? MODE_TYPE.LOCAL_PROD
  : (await kv.get<{ mode: MODE_TYPE }>(["version"])).value?.mode;

export const BASE_REPO_PATH =
  `https://raw.githubusercontent.com/devexp-pro/cli/${GIT_COMMIT_HASH}`;

export const BASE_RESOURCE_PATH = IS_REMOTE
  ? BASE_REPO_PATH
  : IS_LOCAL
  ? Deno.cwd()
  : null;

export const getAsset = async <T>(): Promise<T> => {
  throw new Error("not implemented");
};

export const getTextFile = async () => {};

export const getTypeScriptModule = async () => {};

export const checkForUpdates = () => {};

export const getLatestCommitHashByBranch = async (branchName: string) => {
  const data: { commit: { sha: string } } = await (await fetch(
    `https://api.github.com/repos/devexp-pro/cli/branches/${branchName}`,
  )).json();

  return data.commit.sha;
};

export const getLatestTag = async () => {
  const data: Array<{ name: string; commit: { sha: string } }> =
    await (await fetch(`https://api.github.com/repos/devexp-pro/cli/tags`))
      .json();

  return data[0];
};

export const getLatestCommitHash = async () => {
  return MODE == MODE_TYPE.REMOTE_BRANCH
    ? await getLatestCommitHashByBranch(
      GIT_BRANCH as string,
    )
    : MODE_TYPE.REMOTE_TAG
    ? (await getLatestTag()).commit.sha
    : null;
};

export const upgradeVersion = async () => {
  if (MODE !== MODE_TYPE.REMOTE_BRANCH && MODE !== MODE_TYPE.REMOTE_TAG) {
    return;
  }

  const GIT_LATEST_COMMIT_HASH = await getLatestCommitHash();
  if (!GIT_LATEST_COMMIT_HASH || !GIT_COMMIT_HASH) {
    console.log(`not found commit's hashes`);
    return;
  }

  if (GIT_LATEST_COMMIT_HASH == GIT_COMMIT_HASH) {
    console.log(`latest version already installed!`);
    return;
  }

  const NEW_ENTRYPOINT_SOURCE_URL =
    `https://raw.githubusercontent.com/devexp-pro/cli/${GIT_LATEST_COMMIT_HASH}/source/main.ts`;
  const NEW_IMPORT_MAP_URL =
    `https://raw.githubusercontent.com/devexp-pro/cli/${GIT_LATEST_COMMIT_HASH}/import-map.json`;

  console.log(GIT_COMMIT_HASH);
  console.log(NEW_ENTRYPOINT_SOURCE_URL);

  const res = await shelly([
    "deno",
    "install",
    "-r",
    "-f",
    "-g",
    "-f",
    "--allow-net",
    "--allow-run",
    "--allow-env",
    "--allow-read",
    "--allow-write",
    "--unstable-kv",
    "--unstable-broadcast-channel",
    "--allow-sys",
    "--import-map=" + NEW_IMPORT_MAP_URL,
    "-n",
    "dx",
    NEW_ENTRYPOINT_SOURCE_URL,
  ]);

  console.log(res.stderr || res.stderr);
  return res.code;
};
