import { Command } from "@cliffy/command";
import { config, SERVICE_URL } from "$/constants";
import fetchify from "@vseplet/fetchify";
import { getSession } from "$/kv";
import clipboard from "./clipboard.ts";

const createClient = async () => {
  const session = await getSession();
  if (session === null) throw new Error("Has no session, please login");

  return fetchify.create({
    limiter: {
      rps: 1,
      rt: (response) => 1000,
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
  .description("stores the provided text to the cloud clipboard")
  .arguments("[text...]")
  .option("-s, --show", "show stored data")
  .action(async (options: any, ...args: any) => {
    const clipApi = await createClient();

    const text = args.join(" ") || await clipboard.read();

    const res = await clipApi.post("/store", {
      body: text,
    });

    if (res.status == 200) {
      if (options?.show) {
        console.log();
        console.log(text);
        console.log();
      }

      console.log("Text successfully stored.");
    } else {
      console.error(`Failed to store text. Reason: ${res.statusText}`);
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
      await clipboard.write(text);

      if (options?.show) {
        console.log();
        console.log(text);
        console.log();
      }

      console.log("Text successfully loaded.");
    } else {
      console.error(`Failed to load text. Reason: ${res.statusText}`);
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

export default tool;
