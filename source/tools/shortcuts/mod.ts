import { Command } from "@cliffy/command";
import { config } from "$/providers/config.ts";
import { autocompleteInput } from "$/tools/shortcuts/input-select.ts";
import { shelly } from "@vseplet/shelly";

const spotify = {
  "play/pause": async () => {
    const script = `
      tell application "Spotify"
        playpause
      end tell
    `;

    return await shelly(["osascript", "-e", script]);
  },
  "next": async () => {
    const script = `
        tell application "Spotify"
          next track
        end tell
      `;

    return await shelly(["osascript", "-e", script]);
  },
  "previous": async () => {
    const script = `
        tell application "Spotify"
          previous track
        end tell
      `;

    return await shelly(["osascript", "-e", script]);
  },
};

const vscode = {
  "open": async () => {
    const script = `
      tell application "Visual Studio Code"
        activate
      end tell
    `;

    return await shelly(["osascript", "-e", script]);
  },
  "close": async () => {
    const script = `
      tell application "Visual Studio Code"
        quit
      end tell
    `;

    return await shelly(["osascript", "-e", script]);
  },
};

const chatgpt = {
  "ask": async (text: string) => {
    const script = `
      set the clipboard to "${text}"
      tell application "ChatGPT" to activate
      delay 0.9
      tell application "System Events"
        keystroke "v" using {command down}
        delay 0.5
        key code 36
      end tell
    `;

    return await shelly(["osascript", "-e", script]);
  },
};

const arc = {
  "open": async () => {
    const script = `
      tell application "Arc"
        activate
      end tell
    `;

    return await shelly(["osascript", "-e", script]);
  },
  "close": async () => {
    const script = `
      tell application "Arc"
        quit
      end tell
    `;

    return await shelly(["osascript", "-e", script]);
  },
  "new tab": async () => {
    const script = `
      tell application "Arc"
        activate
        delay 0.1
        tell application "System Events"
          keystroke "t" using {command down}
        end tell
      end tell
    `;

    return await shelly(["osascript", "-e", script]);
  },
};

const apps = {
  spotify,
  chatgpt,
  vscode,
  arc,
};

const tool = new Command();
if (config.data.tools.shortcuts.hidden) tool.hidden();
tool
  .name("shortcuts")
  .alias("s")
  .arguments("[app_name:string] [command:string] [more: ...string]")
  .description("")
  .action(async (options: any, ...args: any) => {
    const [app_name, command, more] = args;

    if (args.length == 0) {
      // tool.showHelp();
      // Deno.exit();

      const app = await autocompleteInput(Object.keys(apps), {
        searchPrompt: "input",
      });

      // @ts-ignore
      const command = await autocompleteInput(Object.keys(apps[app]), {
        searchPrompt: `input ${app}`,
      });

      // @ts-ignore
      await apps[app][command]();
      Deno.exit();
    } else {
      // @ts-ignore
      // await apps[app_name][command]();
      const app = apps[app_name];
      if (!app) {
        console.log(`App ${app_name} not found`);
        Deno.exit(1);
      }
      const appCommand = app[command];
      if (!appCommand) {
        console.log(`Command ${command} not found for app ${app_name}`);
        Deno.exit(1);
      }

      await appCommand(more);
      Deno.exit();
    }
  });

export default {
  tool,
};
