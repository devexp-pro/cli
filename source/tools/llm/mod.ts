import { Command } from "@cliffy/command";
import { config } from "$/providers/config.ts";
import zod from "npm:zod@3.24.1"; // вот это костыль
import { LMStudioClient } from "npm/@lmstudio/sdk";
import { colors } from "@std/colors";
import tui from "$/providers/tui/mod.ts";
import { kv } from "$/repositories/kv.ts";
import { Input } from "@cliffy/prompt/input";

const spotlight = [];

const setup = new Command()
  .name("setup")
  .example("setup base url:", "-u ws://192.168.100.34:1234")
  // .description("")
  .option("-u, --url <url:string>", "LMStudio URL. ", { required: true })
  .action(async (options: any) => {
    await kv.set(["tool", "llm", "lmstudio"], {
      baseUrl: options.url,
    });

    Deno.exit();
  });

const llmPrompt = async (
  question: string,
  max_tokens: number | undefined = undefined,
) => {
  const lmstudioOptions =
    (await kv.get<{ baseUrl: string }>(["tool", "llm", "lmstudio"])).value ||
    {
      baseUrl: "ws://127.0.0.1:1234",
    };

  const client = new LMStudioClient(lmstudioOptions);
  const model = await client.llm.model();
  const modelInfo = await model.getModelInfo();
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
};

const tool = new Command();
if (config.data.tools.llm.hidden) tool.hidden();
tool
  .name("llm")
  .alias("l")
  .arguments("[question:string] [max_tokens:number]")
  .description(
    "An interface for interacting with LLMs",
  )
  .action(async (options: any, ...args: any) => {
    if (!args.length) {
      tool.showHelp();
      Deno.exit();
    }

    const [question, max_tokens] = args;

    await llmPrompt(question, max_tokens);

    console.log("\n");

    Deno.exit();
  })
  .command("setup", setup);

spotlight.push({
  tag: "cmd",
  name: "llm help",
  stringForSearch: "llm help",
  description: "Show help for llm tool",
  handler: async () => {
    tool.showHelp();
    Deno.exit();
  },
});

spotlight.push({
  tag: "cmd",
  name: "llm ask",
  stringForSearch: "llm ask",
  description: tool.getDescription(),
  handler: async () => {
    const prompt = await Input.prompt(`Type your prompt:`);
    await llmPrompt(prompt);
  },
});

export default {
  tool,
  spotlight,
};
