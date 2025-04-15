import { Command } from "@cliffy/command";
import { config } from "$/providers/config.ts";
import { autocompleteInput } from "$/tools/shortcuts/input-select.ts";
import { shelly } from "@vseplet/shelly";
import { DxTool } from "$/types";
import { Input } from "@cliffy/prompt/input";

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
  "ask": async (text: string | undefined) => {
    let prompt = text;
    if (!text) {
      prompt = await Input.prompt(`Type your prompt:`);
    }

    const script = `
      set userPrompt to "${prompt}"
      tell application "ChatGPT" to activate
      delay 1.5

      tell application "System Events"
        set frontmost of process "ChatGPT" to true
        delay 0.5
        keystroke userPrompt
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

const spotlight: any = [
  // { tag: "srt", name: "", description: "Shortcuts" },
];

for (const app in apps) {
  // @ts-ignore
  for (const command in apps[app]) {
    spotlight.push({
      tag: "sht",
      name: `${app} ${command}`,
      stringForSearch: `${app} ${command}`,
      description: `Run ${command} for ${app}`,
      // @ts-ignore
      handler: apps[app][command],
    });
  }
}

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

spotlight.push({
  tag: "cmd",
  name: "shortcuts help",
  stringForSearch: "shortcuts help",
  description: "Show help for shortcuts tool",
  handler: async () => {
    tool.showHelp();
    Deno.exit();
  },
});

export default {
  tool,
  spotlight,
} as DxTool;
