import localDenoJson from "$deno-json" with { type: "json" };
import { fetchJSON } from "$/helpers";
import { colors } from "@std/colors";
import Tuner from "@artpani/tuner";
import { BaseCfgType } from "$config/base.tuner.ts";

const permissionEnv = Deno.permissions.querySync({ name: "env" }).state;

export const OS_NAME = Deno.build.os;

export const IS_DEVELOP = permissionEnv == "granted"
  ? Deno.env.get("DEV") !== undefined && Deno.env.get("DEV") !== "false"
  : false;

export const baseRepoPath =
  `https://raw.githubusercontent.com/devexp-pro/cli/refs/heads/develop`;

const remoteDenoJson = await fetchJSON(
  `${baseRepoPath}/deno.json`,
) as unknown as typeof localDenoJson;

export const VERSION = localDenoJson["version"];
export const REMOTE_VERSION = remoteDenoJson["version"] || VERSION;

export const config = await Tuner.use.loadConfig<BaseCfgType>({
  absolutePathPrefix: IS_DEVELOP || Deno.env.get("DEV_PROD")
    ? undefined
    : baseRepoPath,
  configDirPath: "./config",
  configName: IS_DEVELOP ? "dev" : "prod",
});

export const ENTRYPOINT_SOURCE_URL = `${baseRepoPath}/source/main.ts`;
export const IMPORT_MAP_URL = `${baseRepoPath}/import-map.json`;

export const SERVICE_DOMAIN = IS_DEVELOP ? "127.0.0.1:4000" : "devexp.cloud";

export const SERVICE_URL = (IS_DEVELOP ? "http://" : "https://") +
  SERVICE_DOMAIN;

export const WEBSOCKET_URL = `${
  IS_DEVELOP ? "ws" : "wss"
}://wss.${SERVICE_DOMAIN}/wss`;

export const SYSTEM_SHELL = Deno.env.get("SHELL") || Deno.env.get("ComSpec");
export const HOME = Deno.env.get("HOME") || Deno.env.get("USERPROFILE");

export const logo = `
  ${colors.rgb24("██████╗ ███████╗██╗   ██╗", 0xFFA500)}${
  colors.magenta("███████╗██╗  ██╗██████╗")
}
  ${colors.rgb24("██╔══██╗██╔════╝██║   ██║", 0xFFA500)}${
  colors.magenta("██╔════╝╚██╗██╔╝██╔══██╗")
}
  ${colors.rgb24("██║  ██║█████╗  ██║   ██║", 0xFFA500)}${
  colors.magenta("█████╗   ╚███╔╝ ██████╔╝")
}
  ${colors.rgb24("██║  ██║██╔══╝  ╚██╗ ██╔╝", 0xFFA500)}${
  colors.magenta("██╔══╝   ██╔██╗ ██╔═══╝")
}
  ${colors.rgb24("██████╔╝███████╗ ╚████╔╝ ", 0xFFA500)}${
  colors.magenta("███████╗██╔╝ ██╗██║")
}
  ${colors.rgb24("╚═════╝ ╚══════╝  ╚═══╝  ", 0xFFA500)}${
  colors.magenta("╚══════╝╚═╝  ╚═╝╚═╝")
}

  https://devexp.pro`;

export const introText = `
  Version ${colors.green(VERSION)}
  Crafted with ${colors.red("<3")} by DevExp
  Use "dx -h" to get help on commands.
  ${IS_DEVELOP ? colors.bgRed("\n  This is develop version!!!") : ""}`;
