import { Command } from "../deps.ts";
import { Select } from "https://deno.land/x/cliffy@v1.0.0-rc.3/prompt/mod.ts";
// import { readLines } from "https://deno.land/std/io/mod.ts"
// Почему то через аналогичный с Command испорт делать не хочет
import { readGitConfigFile } from "../source/commands/readGitConfigFile.ts";
import {
  chooseProfile,
  createNewProfile,
  getUserInput,
} from "../source/commands/profileManager.ts";
import { selectSshKey } from "../source/commands/sshKeyGen.ts";
import { confirmTermination } from "../source/commands/clearAllDenoKv.ts";

const USERNAME = Deno.env.get("USER");
const PATHTOGITCONFIG = `/Users/${USERNAME}/.ssh/config`;

async function displayMenu() {
  const result = await Select.prompt({
    message: "Choose an option:",
    options: [
      { name: "Hello", value: "1" },
      { name: "Status", value: "2" },
      { name: "List all Users", value: "3" },
      { name: "List all SSH keys", value: "4" },
      { name: "Terminate all DataBase", value: "9" },
      { name: "Exit", value: "10" },
    ],
  });

  switch (result) {
    case "1":
      console.log("and hello to you");
      break;
    case "2":
      readGitConfigFile(`${PATHTOGITCONFIG}`);
      break;
    case "3":
      await chooseProfile();
      break;
    case "4":
      selectSshKey();
      break;
    case "9":
      await confirmTermination();
      break;
    case "10":
      Deno.exit(0);
      break;
    default:
      console.log("Invalid option");
  }
}

async function main() {
  while (true) {
    await displayMenu();
    console.log("\n");
  }
}

main();
