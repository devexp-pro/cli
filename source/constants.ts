export enum MODE_TYPE {
  LOCAL_DEV = "LOCAL_DEV", // установлено и запущено из исходников с dev конфигом
  LOCAL_PROD = "LOCAL_PROD", // установлено и запущено из исходников с prod конфигом
  REMOTE_DEV = "REMOTE_DEV", // установлено и запущено из ветки репозитория
  REMOTE_PROD = "REMOTE_PROD", // установлено и запущено из тэга репозитория
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

const match = IMU.match(/refs\/heads\/(?<GIT_BRANCH>.+?)\/source/);
export const GIT_BRANCH = match?.groups ? match.groups.GIT_BRANCH : "";

export const MODE = IS_LOCAL_DEV
  ? MODE_TYPE.LOCAL_DEV
  : IS_LOCAL_PROD
  ? MODE_TYPE.LOCAL_PROD
  : GIT_BRANCH.includes("main")
  ? MODE_TYPE.REMOTE_PROD
  : MODE_TYPE.REMOTE_DEV;

export const IS_DEV =
  MODE == MODE_TYPE.LOCAL_DEV || MODE == MODE_TYPE.REMOTE_DEV ? true : false;
export const IS_PROD =
  MODE == MODE_TYPE.LOCAL_PROD || MODE == MODE_TYPE.REMOTE_PROD ? true : false;

export const BASE_REPO_PATH =
  `https://raw.githubusercontent.com/devexp-pro/cli/refs/heads/${GIT_BRANCH}/`;

export const BASE_RESOURCE_PATH = IS_REMOTE
  ? BASE_REPO_PATH
  : IS_LOCAL
  ? Deno.cwd()
  : null;

export const SERVICE_DOMAIN = IS_REMOTE
  ? "devexp.cloud"
  : IS_LOCAL_DEV
  ? "localhost:4000"
  : "devexp.cloud";

export const SERVICE_URL = IS_REMOTE
  ? "https://" + SERVICE_DOMAIN
  : (IS_LOCAL_DEV ? "http://" : "https://") +
    SERVICE_DOMAIN;

export const WEBSOCKET_URL = IS_REMOTE
  ? `wss://wss.${SERVICE_DOMAIN}`
  : `${IS_LOCAL_DEV ? "ws" : "wss"}://wss.${SERVICE_DOMAIN}`;

export const OS_NAME = Deno.build.os;
export const SYSTEM_SHELL = Deno.env.get("SHELL") || Deno.env.get("ComSpec");
export const HOME = Deno.env.get("HOME") || Deno.env.get("USERPROFILE");
export const CWD = Deno.cwd();
