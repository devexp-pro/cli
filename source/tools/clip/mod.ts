import { Command } from "@cliffy/command";
import { SERVICE_URL } from "$/constants";
import fetchify from "@vseplet/fetchify";

const clipApi = fetchify.create({
  limiter: {
    rps: 1,
    rt: (response) => 1000,
  },
  baseURL: `${SERVICE_URL}/services/clip`,
  headers: {
    "hello": "world",
  },
});

const store = new Command()
  .name("store")
  .usage("<text...>")
  .description("stores the provided text to the cloud clipboard")
  .arguments("<text...>")
  .action(async (_options: any, ...args: any) => {
    const text = args.join(" ");
    console.log(`Storing text: "${text}"`);

    const res = await clipApi.post("/store", {
      body: text,
    });

    if (res.status == 200) {
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
  .action(async () => {
    console.log("Loading stored text...");

    const res = await clipApi.post("/load");

    if (res.status == 200) {
      const text = await res.text();
      console.log(`Loaded text: "${text}"`);
    } else {
      console.error(`Failed to load text. Reason: ${res.statusText}`);
    }

    Deno.exit();
  });

const tool = new Command()
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