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

export enum MODE_TYPE {
  LOCAL_DEV = "LOCAL_DEV", // запущено локально из исходников с dev конфигом
  LOCAL_PROD = "LOCAL_PROD", // запущено локально из исходников с prod конфигом
  REMOTE_DEV = "REMOTE_DEV", // установлено из любой ветки репозитория
  REMOTE_PROD = "REMOTE_PROD", // установлено из любого тега репозитория
}

export const IMU = import.meta.url;
export const IS_REMOTE = IMU.includes("raw.githubusercontent.com");
export const IS_REMOTE_BRANCH = IS_REMOTE && IMU.includes("heads");
export const IS_REMOTE_TAG = IS_REMOTE && IMU.includes("tags");

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
  ? MODE_TYPE.REMOTE_DEV
  : IS_REMOTE_TAG
  ? MODE_TYPE.REMOTE_PROD
  : Deno.exit(-1); // Если ни одно из условий не выполнено

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
export const GIT_TAG = IS_REMOTE_TAG
  ? IMU.match(/\/refs\/tags\/([a-zA-Z0-9\.\-\+_]+)/)?.[1]
  : null;

export const BASE_REPO_PATH = IS_REMOTE_BRANCH
  ? `https://raw.githubusercontent.com/devexp-pro/cli/refs/heads/${GIT_BRANCH}`
  : `https://raw.githubusercontent.com/devexp-pro/cli/refs/tags/${GIT_TAG}`;

export const ENTRYPOINT_SOURCE_URL = `${BASE_REPO_PATH}/source/main.ts`;

export const getAsset = async <T>(): Promise<T> => {
  throw new Error("not implemented");
};
