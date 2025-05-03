import { toolCommand } from "./commands.ts";
import { loadAction, storeAction } from "./actions.ts";
import { SpotlightItem } from "$/types";

const spotlight: Array<SpotlightItem> = [];

spotlight.push({
  tag: "cmd",
  name: "clip help",
  stringForSearch: "clip help",
  description: "Show help for clip tool",
  handler: async () => {
    toolCommand.showHelp();
    Deno.exit();
  },
});

spotlight.push({
  tag: "cmd",
  name: "clip store",
  stringForSearch: "clip store",
  description: "Store text to the cloud clipboard",
  handler: async () => {
    await storeAction.handler({ show: true });
  },
});

spotlight.push({
  tag: "cmd",
  name: "clip load",
  stringForSearch: "clip load",
  description: "Load text from the cloud clipboard",
  handler: async () => {
    await loadAction.handler({ show: true });
  },
});

export { spotlight };
