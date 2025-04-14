import { Command } from "@cliffy/command";
import { config } from "$/providers/config.ts";

const spotify = {
  "play": async () => {
    const script = `
    tell application "Spotify"
        playpause
    end tell
    `;

    const p = new Deno.Command("osascript", {
      args: ["-e", script],
    });
    await p.output();
  },
  "pause": async () => {
    const script = `
      tell application "Spotify"
        playpause
      end tell
    `;

    const p = new Deno.Command("osascript", {
      args: ["-e", script],
    });
    await p.output();
  },
  "next": async () => {
    const script = `
        tell application "Spotify"
          next track
        end tell
      `;

    const p = new Deno.Command("osascript", {
      args: ["-e", script],
    });
    await p.output();
  },
  "previous": async () => {
    const script = `
        tell application "Spotify"
          previous track
        end tell
      `;

    const p = new Deno.Command("osascript", {
      args: ["-e", script],
    });
    await p.output();
  },
};

const vscode = {};

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

    const p = new Deno.Command("osascript", {
      args: ["-e", script],
    });
    await p.output();
  },
};

const arc = {};

const apps = {
  spotify,
  chatgpt,
};

const tool = new Command();
if (config.data.tools.shortcuts.hidden) tool.hidden();
tool
  .name("shortcuts")
  .alias("s")
  .arguments("<app_name:string> <command:string> [more: ...string]")
  .description("")
  .action(async (options: any, ...args: any) => {
    const [app_name, command, more] = args;

    if (args.length == 0) {
      tool.showHelp();
      Deno.exit();
    }
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
  });

export default {
  tool,
};
