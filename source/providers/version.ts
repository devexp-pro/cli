import { kv } from "$/repositories/kv.ts";

export enum MODE_TYPE {
  LOCAL_DEV = "LOCAL_DEV", // установлено и запущено из исходников с dev конфигом
  LOCAL_PROD = "LOCAL_PROD", // установлено и запущено из исходников с prod конфигом
  REMOTE_BRANCH = "REMOTE_BRANCH", // установлено и запущено из ветки репозитория
  REMOTE_TAG = "REMOTE_TAG", // установлено и запущено из тэга репозитория
}

export const IMU = import.meta.url;
console.log(IMU);
export const IS_REMOTE = IMU.includes("raw.githubusercontent.com");
export const IS_LOCAL = !IS_REMOTE;

export const IS_LOCAL_DEV = IS_LOCAL &&
  (Deno.env.get("LOCAL_DEV") !== undefined &&
    Deno.env.get("LOCAL_DEV") == "true");
export const IS_LOCAL_PROD = IS_LOCAL &&
  (Deno.env.get("LOCAL_DEV") !== undefined &&
    Deno.env.get("LOCAL_DEV") == "false");

const match = IMU.match(/refs\/heads\/(?<GIT_BRANCH>[^/]+)/);
export const GIT_BRANCH = match?.groups ? match.groups.GIT_BRANCH : "";

export const MODE = IS_LOCAL_DEV
  ? MODE_TYPE.LOCAL_DEV
  : IS_LOCAL_PROD
  ? MODE_TYPE.LOCAL_PROD
  : (await kv.get<{ mode: MODE_TYPE }>(["version"])).value?.mode;

export const BASE_REPO_PATH =
  `https://raw.githubusercontent.com/devexp-pro/cli/refs/heads${GIT_BRANCH}`;

export const BASE_RESOURCE_PATH = IS_REMOTE
  ? BASE_REPO_PATH
  : IS_LOCAL
  ? Deno.cwd()
  : null;
