import { Command } from "@cliffy/command";
import { config } from "$/providers/config.ts";
import zod from "npm:zod@3.24.1"; // вот это костыль
import { LMStudioClient } from "npm/@lmstudio/sdk";

const client = new LMStudioClient();

const model = await client.llm.model();

const encoder = new TextEncoder();

const tool = new Command();
if (config.data.tools.lm.hidden) tool.hidden();
tool
  .name("llm")
  .alias("l")
  .arguments("[...question:string]")
  .description(
    "An interface for interacting with LLMs such as ChatGPT, Claude, LMStudio, and so on.",
  )
  .action(async (options: any, ...args: any) => {
    if (!args.length) {
      tool.showHelp();
      Deno.exit();
    }

    for await (
      const fragment of model.respond(args.join(" "))
    ) {
      Deno.stdout.writeSync(encoder.encode(fragment.content));
    }

    Deno.exit();
  });

export default {
  tool,
};
