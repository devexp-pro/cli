import { shelly } from "@vseplet/shelly";

export const getLatestCommitHashByBranch = async (branchName: string) => {
  const data: { commit: { sha: string } } = await (await fetch(
    `https://api.github.com/repos/devexp-pro/cli/branches/${branchName}`,
  )).json();

  return data.commit.sha;
};

export const getCommitHash = (latestCommitHash: string) => {
  const hash = localStorage.getItem("commitHash");
  if (hash) {
    return hash;
  } else {
    localStorage.setItem("commitHash", latestCommitHash);
    return latestCommitHash;
  }
};

export const getLatestTag = async () => {
  const data: Array<{ name: string }> =
    await (await fetch(`https://api.github.com/repos/devexp-pro/cli/tags`))
      .json();

  return data[0]?.name;
};

export enum MODE_TYPE {
  LOCAL_DEV = "LOCAL_DEV", // запущено локально из исходников с dev конфигом
  LOCAL_PROD = "LOCAL_PROD", // запущено локально из исходников с prod конфигом
  REMOTE_COMMIT = "REMOTE_COMMIT",
  REMOTE_BRANCH = "REMOTE_BRANCH",
  REMOTE_TAG = "REMOTE_TAG",
}

export const IMU = import.meta.url;
export const IS_REMOTE = IMU.includes("raw.githubusercontent.com");
export const IS_REMOTE_COMMIT = "";
export const IS_REMOTE_BRANCH = IS_REMOTE && IMU.includes("heads");
export const IS_REMOTE_TAG = IS_REMOTE && IMU.includes("tags");

// console.log(IMU);

export const IS_LOCAL = !IS_REMOTE;
export const IS_LOCAL_DEV = IS_LOCAL &&
  (Deno.env.get("LOCAL_DEV") !== undefined &&
    Deno.env.get("LOCAL_DEV") == "true");
export const IS_LOCAL_PROD = IS_LOCAL &&
  (Deno.env.get("LOCAL_DEV") !== undefined &&
    Deno.env.get("LOCAL_DEV") == "false");

export const MODE = IS_LOCAL_DEV
  ? MODE_TYPE.LOCAL_DEV
  : IS_LOCAL_PROD
  ? MODE_TYPE.LOCAL_PROD
  : IS_REMOTE_BRANCH
  ? MODE_TYPE.REMOTE_BRANCH
  : IS_REMOTE_TAG
  ? MODE_TYPE.REMOTE_TAG
  : "unknown"; // Если ни одно из условий не выполнено

export const GIT_BRANCH = IS_REMOTE_BRANCH
  ? IMU.match(/\/refs\/heads\/([a-zA-Z0-9\-_]+)/)?.[1]
  : null;

export const GIT_LATEST_COMMIT_HASH = GIT_BRANCH
  ? await getLatestCommitHashByBranch(
    GIT_BRANCH as string,
  )
  : null;

export const GIT_COMMIT_HASH = GIT_LATEST_COMMIT_HASH
  ? getCommitHash(GIT_LATEST_COMMIT_HASH)
  : null;

console.log(await getLatestTag());

export const GIT_TAG = IS_REMOTE_TAG
  ? IMU.match(/\/refs\/tags\/([a-zA-Z0-9\.\-\+_]+)/)?.[1]
  : null;

export const BASE_REPO_PATH = IS_REMOTE_BRANCH
  ? `https://raw.githubusercontent.com/devexp-pro/cli/refs/heads/${GIT_BRANCH}`
  : `https://raw.githubusercontent.com/devexp-pro/cli/refs/tags/${GIT_TAG}`;

export const ENTRYPOINT_SOURCE_URL = `${BASE_REPO_PATH}/source/main.ts`;
export const IMPORT_MAP_URL = `${BASE_REPO_PATH}/import-map.json`;

export const BASE_RESOURCE_PATH = IS_REMOTE_BRANCH
  ? `https://raw.githubusercontent.com/devexp-pro/cli/${GIT_COMMIT_HASH}`
  : IS_REMOTE_TAG
  ? `https://raw.githubusercontent.com/devexp-pro/cli/refs/tags/${GIT_TAG}`
  : IS_LOCAL
  ? Deno.cwd()
  : null;

export const getAsset = async <T>(): Promise<T> => {
  throw new Error("not implemented");
};

export const getTextFile = async () => {};

export const getTypeScriptModule = async () => {};

export const checkForUpdates = () => {};

export const upgradeVersion = async () => {
  if (MODE == MODE_TYPE.REMOTE_BRANCH) {
    if (!GIT_LATEST_COMMIT_HASH || !GIT_COMMIT_HASH) {
      console.log(`not found commit's hashes`);
      "unknown";
    }

    if (GIT_LATEST_COMMIT_HASH == GIT_COMMIT_HASH) {
      console.log(`latest version already installed!`);
      Deno.exit();
    }

    localStorage.setItem("commitHash", GIT_LATEST_COMMIT_HASH);
  }

  const res = await shelly([
    "deno",
    "install",
    "-r",
    "-f",
    "-g",
    "--allow-net",
    "--allow-run",
    "--allow-env",
    "--allow-read",
    "--allow-write",
    "--unstable-kv",
    "--unstable-broadcast-channel",
    "--allow-sys",
    "--import-map=" + IMPORT_MAP_URL,
    "-n",
    "dx",
    ENTRYPOINT_SOURCE_URL,
  ]);

  console.log(res.stderr || res.stderr);
  Deno.exit(res.code);
};
