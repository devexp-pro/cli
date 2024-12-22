import { IS_LOCAL_DEV, IS_REMOTE } from "$/providers/version.ts";
import { join } from "@std/path/join";

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

export const APP_DIR = join(
  Deno.build.os === "windows"
    ? Deno.env.get("APPDATA") as string || Deno.env.get("USERPROFILE") as string
    : Deno.env.get("HOME") as string,
  ".dx",
);

if (!APP_DIR) {
  console.error("Failed to determine the home directory.");
}
