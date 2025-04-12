import { Command } from "@cliffy/command";
import { config } from "$/providers/config.ts";
import zod from "npm:zod@3.24.1"; // вот это костыль
import { LMStudioClient } from "npm/@lmstudio/sdk";
import { colors } from "@std/colors";
import tui from "$/providers/tui.ts";

const setup = new Command()
  .name("setup")
  .usage("")
  .description("")
  .action(async (options: any) => {
    Deno.exit();
  });

const tool = new Command();
if (config.data.tools.lm.hidden) tool.hidden();
tool
  .name("llm")
  .alias("l")
  .arguments("[question:string] [max_tokens:number]")
  .description(
    "An interface for interacting with LLMs such as ChatGPT, Claude, LMStudio, and so on.",
  )
  .action(async (options: any, ...args: any) => {
    if (!args.length) {
      tool.showHelp();
      Deno.exit();
    }

    const client = new LMStudioClient();
    const model = await client.llm.model();
    const modelInfo = await model.getModelInfo();
    const encoder = new TextEncoder();
    const [question, max_tokens] = args;
    const name = `  ${modelInfo.displayName}: `;
    let lineWidth = name.length;

    console.log();
    tui.print(name);

    for await (
      const fragment of model.respond(
        question,
        max_tokens
          ? {
            maxTokens: max_tokens,
          }
          : {},
      )
    ) {
      const content = fragment.content;

      try {
        lineWidth += content.length;
        if (lineWidth > 80) {
          tui.print("\n");
          lineWidth = 0;
          tui.print(colors.yellow(content.trimStart()));
        } else {
          tui.print(colors.yellow(content));
        }
      } catch (e) {
        // TODO: вот тут должен работать логгер
        // console.log(typeof content);
        // console.log(e);
      }
    }

    console.log("\n");

    Deno.exit();
  })
  .command("setup", setup);

export default {
  tool,
};
