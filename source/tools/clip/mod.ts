import tui from "$/providers/tui/mod.ts";
import { Command } from "@cliffy/command";
import { SERVICE_URL } from "$/constants";
import fetchify from "@vseplet/fetchify";
import { getSession } from "$/providers/session.ts";
import { config } from "$/providers/config.ts";
import api from "./api.ts";
import { addMAN } from "$/helpers";

const spotlight = [];

const createClient = async () => {
  const session = await getSession();
  if (session === null) {
    tui.err("Has no session, please login");
    Deno.exit(-1);
  }

  return fetchify.create({
    limiter: {
      rps: 1,
      rt: () => 1000,
    },
    baseURL: `${SERVICE_URL}/tool/clip`,
    headers: {
      Identifier: session.id,
      Authorization: session.key,
    },
  });
};

const store = new Command()
  .name("store")
  .usage("<text...>")
  .description("Stores the provided text to the cloud clipboard")
  .arguments("[text...]")
  .option("-s, --show", "show stored data")
  .action(async (options: any, ...args: any) => {
    const clipApi = await createClient();

    const text = args.join(" ") || await api.clipboard.read();

    const res = await clipApi.post("/store", {
      body: text,
    });

    if (res.status == 200) {
      if (options?.show) {
        console.log();
        tui.log(text);
        console.log();
      }

      tui.log("Text successfully stored.");
    } else {
      tui.errAndExit(`Failed to store text. Reason: ${res.statusText}`);
    }

    Deno.exit();
  });

const load = new Command()
  .name("load")
  .usage("")
  .description("loads the stored text from the cloud clipboard.")
  .option("-s, --show", "show loaded data")
  .action(async (options: any) => {
    const clipApi = await createClient();
    const res = await clipApi.post("/load");

    if (res.status == 200) {
      const text = await res.text();
      await api.clipboard.write(text);

      if (options?.show) {
        console.log();
        tui.log(text);
        console.log();
      }

      tui.def("Text successfully loaded.");
    } else {
      tui.errAndExit(`Failed to load text. Reason: ${res.statusText}`);
    }

    Deno.exit();
  });

const tool = new Command();
if (config.data.tools.clip.hidden) tool.hidden();
tool
  .name("clip")
  .usage("")
  .description("share text between devices using the cloud clipboard")
  .action(() => {
    tool.showHelp();
    Deno.exit();
  })
  .command("store", store)
  .command("load", load);

addMAN(tool);

spotlight.push({
  tag: "cmd",
  name: "clip help",
  stringForSearch: "clip help",
  description: "Show help for clip tool",
  handler: async () => {
    tool.showHelp();
    Deno.exit();
  },
});

export default {
  spotlight,
  tool,
};
