import { renderMarkdown } from "@littletof/charmd";
import { Command } from "@cliffy/command";
import { BASE_REPO_PATH, IS_REMOTE } from "$/providers/version.ts";
// import { BASE_REPO_PATH, IS_DEVELOP, IS_REMOTE } from "$/constants";

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
        if (!IS_REMOTE) {
          const pathToMan = `./source/${type}/${nameOfParentCommand}/MAN.md`;
          Deno.lstatSync(pathToMan);
          console.clear();
          console.log(renderMarkdown(
            Deno.readTextFileSync(pathToMan),
          ));
        } else {
          const pathToMan = BASE_REPO_PATH +
            `/source/${type}/${nameOfParentCommand}/MAN.md`;

          console.clear();
          console.log(renderMarkdown(
            await (await fetch(pathToMan)).text(),
          ));
        }

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
