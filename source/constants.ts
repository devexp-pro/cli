import localDenoJson from "$deno-json" with { type: "json" };
import { fetchJSON } from "$/helpers";
import { colors } from "@std/colors";

const remoteDenoJson = await fetchJSON(
  `https://raw.githubusercontent.com/devexp-pro/cli/refs/heads/develop/deno.json`,
) as unknown as typeof localDenoJson;

const permissionEnv = Deno.permissions.querySync({ name: "env" }).state;

export const IS_DEVELOP = permissionEnv == "granted"
  ? Deno.env.get("DEV") || false
  : false;

export const VERSION = localDenoJson["version"];
export const REMOTE_VERSION = remoteDenoJson["version"] || VERSION;

export const ENTRYPOINT_SOURCE_URL =
  `https://raw.githubusercontent.com/devexp-pro/cli/refs/heads/develop/source/main.ts`;
export const IMPORT_MAP_URL =
  `https://raw.githubusercontent.com/devexp-pro/cli/refs/heads/develop/import-map.json`;

export const SERVICE_DOMAIN = IS_DEVELOP ? "localhost:4000" : "devexp.cloud";

export const WEBSOCKET_URL = `${
  IS_DEVELOP ? "ws" : "wss"
}://wss.${SERVICE_DOMAIN}/wss`;

export const logo = `
  ▓█████▄ ▓█████ ██▒   █▓▓█████ ▒██   ██▒ ██▓███
  ▒██▀ ██▌▓█   ▀▓██░   █▒▓█   ▀ ▒▒ █ █ ▒░▓██░  ██▒
  ░██   █▌▒███   ▓██  █▒░▒███   ░░  █   ░▓██░ ██▓▒
  ░▓█▄   ▌▒▓█  ▄  ▒██ █░░▒▓█  ▄  ░ █ █ ▒ ▒██▄█▓▒ ▒
  ░▒████▓ ░▒████▒  ▒▀█░  ░▒████▒▒██▒ ▒██▒▒██▒ ░  ░
   ▒▒▓  ▒ ░░ ▒░ ░  ░ ▐░  ░░ ▒░ ░▒▒ ░ ░▓ ░▒▓▒░ ░  ░
   ░ ▒  ▒  ░ ░  ░  ░ ░░   ░ ░  ░░░   ░▒ ░░▒ ░
   ░ ░  ░    ░       ░░     ░    ░    ░  ░░
     ░       ░  ░     ░     ░  ░ ░    ░
   ░                 ░

  https://devexp.pro
`;

export const introText = `
  Version ${colors.green(VERSION)}
  Crafted with ${colors.red("<3")} by DevExp
  Use "dx -h" to get help on commands.
  ${IS_DEVELOP}
`;
