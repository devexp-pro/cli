import { renderMarkdown } from "@littletof/charmd";
import { Command } from "@cliffy/command";
import { getTextFile } from "$/providers/version.ts";

export async function fetchJSON(url: URL | string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Response not OK (${response.status})`);
  return await response.json();
}

export const addMAN = (command: Command, type: "tools" = "tools") => {
  const nameOfParentCommand = command.getName();

  const manCommand = new Command()
    .name("man")
    .description(`user manual for '${nameOfParentCommand}'`)
    .action(async () => {
      if (!nameOfParentCommand) Deno.exit(-1);
      try {
        console.log(renderMarkdown(
          await getTextFile(`./source/${type}/${nameOfParentCommand}/MAN.md`),
        ));
        Deno.exit(0);
      } catch (e) {
        console.log(` user manual for '${nameOfParentCommand}' not found =(`);
        Deno.exit(-1);
      }
    });

  command.command(
    "man",
    manCommand,
  );

  return command;
};
