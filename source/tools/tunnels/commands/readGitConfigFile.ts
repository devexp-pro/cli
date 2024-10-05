import { Command } from "@cliffy/command";

export async function readGitConfigFile(filePath: string) {
  try {
    const content = await Deno.readTextFile(filePath);
    const lines = content.split("\n");

    for (const line of lines) {
      const trimmedLine = line.trim();
      const [key, value] = trimmedLine.split(/\s+/);
      console.log(`${key} - ${value}`);
    }
  } catch (error) {
    console.error(`An error occurred: ${error.message}`);
  }
}

/*
await new Command()
  .name("config-reader")
  .version("1.0.0")
  .description("A CLI tool to read Git config files.")
  .option("-f, --file <file:string>", "The path to the Git config file to read.", {
    required: true
  })
  .action(async (options) => {
    await readGitConfigFile(options.file);
  })
  .parse(Deno.args);
*/
