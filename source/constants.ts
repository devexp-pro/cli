import localDenoJson from "$deno-json" with { type: "json" };
import { fetchJSON } from "$/helpers";

import { loadConfig } from "$/helpers";

export const IMU = import.meta.url;
export const IS_REMOTE = IMU.includes("raw.githubusercontent.com");
export const IS_DEVELOP = IS_REMOTE
  ? false
  : (Deno.env.get("DEV") !== undefined &&
    Deno.env.get("DEV") !== "false");
export const IS_REMOTE_BRANCH = IS_REMOTE && IMU.includes("heads");
export const GIT_REMOTE_BRANCH = IS_REMOTE_BRANCH
  ? IMU.match(/\/refs\/heads\/([a-zA-Z0-9\-_]+)/)?.[1]
  : undefined;

export const GIT_REMOTE_TAG = !IS_REMOTE_BRANCH
  ? IMU.match(/\/refs\/tags\/([a-zA-Z0-9\.\-\+_]+)/)?.[1]
  : undefined;
export const BASE_REPO_PATH = IS_REMOTE_BRANCH
  ? `https://raw.githubusercontent.com/devexp-pro/cli/refs/heads/${GIT_REMOTE_BRANCH}`
  : `https://raw.githubusercontent.com/devexp-pro/cli/refs/tags/${GIT_REMOTE_TAG}`;
export const ENTRYPOINT_SOURCE_URL = `${BASE_REPO_PATH}/source/main.ts`;
const REMOTE_DENO_JSON = (IS_REMOTE_BRANCH
  ? await fetchJSON(
    `${BASE_REPO_PATH}/deno.json`,
  )
  : { "VERSION": null }) as unknown as typeof localDenoJson;
export const LOCAL_VERSION = localDenoJson["version"];
export const REMOTE_VERSION = REMOTE_DENO_JSON["version"] || LOCAL_VERSION;
export const IMPORT_MAP_URL = `${BASE_REPO_PATH}/import-map.json`;

export const config = await loadConfig();
export const SERVICE_DOMAIN = IS_REMOTE
  ? "devexp.cloud"
  : IS_DEVELOP
  ? "127.0.0.1:4000"
  : "devexp.cloud";

export const SERVICE_URL = IS_REMOTE
  ? "https://"
  : (IS_DEVELOP ? "http://" : "https://") +
    SERVICE_DOMAIN;

export const WEBSOCKET_URL = IS_REMOTE
  ? `wss://wss.${SERVICE_DOMAIN}/wss`
  : `${IS_DEVELOP ? "ws" : "wss"}://wss.${SERVICE_DOMAIN}/wss`;

export const OS_NAME = Deno.build.os;
export const SYSTEM_SHELL = Deno.env.get("SHELL") || Deno.env.get("ComSpec");
export const HOME = Deno.env.get("HOME") || Deno.env.get("USERPROFILE");
export const CWD = Deno.cwd();
