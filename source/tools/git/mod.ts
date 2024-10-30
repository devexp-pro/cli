import { Select } from "https://deno.land/x/cliffy@v1.0.0-rc.3/prompt/mod.ts";
import { manualDisconnectSshKeyAndUser } from "./commands/helpers.ts";
import {
  chooseUser,
  createNewUser,
  deleteUser,
} from "./commands/userManager.ts";
import {
  choseSshKey,
  createNewSshKey,
  deleteSshKey,
} from "./commands/sshKeyManager.ts";
import { connectUserToSsh } from "./commands/connectUserAndSshKey.ts";
import {
  activateProfile,
  showActiveProfileStatus,
} from "./commands/activateProfile.ts";
import { gitClone, gitCloneCommand } from "./commands/gitManager.ts";
import { about } from "./commands/about.ts";
import { fullReset } from "./commands/reset.ts";
import { Command } from "@cliffy/command";
import {
  createNewSshKeyCommand,
  deleteSshKeyCommand,
  showAllSshKeysCommand,
} from "./commands/sshKeyManager.ts";
import { config } from "$/constants";

const logo = `
#####     #####   ########
 ## ##   ### ###  ## ## ##
 ##  ##  ##   ##     ##
 ##  ##  ##   ##     ##
 ##  ##  ##   ##     ##
 ## ##   ### ###     ##
#####     #####     #### `;

async function displaySystemMenu() {
  const result = await Select.prompt({
    message: "Choose an option:",
    options: [
      { name: "Reset", value: "1" },
      { name: "About", value: "2" },
      { name: "Return", value: "4" },
    ],
  });
  switch (result) {
    case "1":
      await fullReset();
      break;
    case "2":
      await about();
      break;
    case "4":
      break;
    default:
      console.log("Invalid option");
  }
}

async function displayManagerMenu() {
  const result = await Select.prompt({
    message: "Choose an option:",
    options: [
      { name: "Create new User", value: "1" },
      { name: "Create new SSH key", value: "2" },
      { name: "Connect User to SSH key", value: "3" },
      { name: "Disconnect User to SSH key", value: "4" },
      { name: "Delete SSH key", value: "5" },
      { name: "Delete User", value: "6" },
      { name: "Return", value: "7" },
    ],
  });
  switch (result) {
    case "1":
      await createNewUser();
      break;
    case "2":
      await createNewSshKey();
      break;
    case "3":
      await connectUserToSsh();
      break;
    case "4":
      await manualDisconnectSshKeyAndUser();
      break;
    case "5":
      await deleteSshKey();
      break;
    case "6":
      await deleteUser();
      break;
    case "7":
      break;
    default:
      console.log("Invalid option");
  }
}

export async function displayMenu() {
  const result = await Select.prompt({
    message: "Choose an option:",
    options: [
      { name: "Git clone", value: "1" },
      { name: "Activate Profile", value: "2" },
      { name: "User and SSH Manager", value: "3" },
      { name: "Status", value: "4" },
      { name: "List all Users", value: "5" },
      { name: "List all SSH keys", value: "6" },
      { name: "System", value: "7" },
      { name: "Exit", value: "10" },
    ],
  });

  switch (result) {
    case "1":
      await gitClone();
      break;
    case "2":
      await activateProfile();
      break;
    case "3":
      await displayManagerMenu();
      break;
    case "4":
      await showActiveProfileStatus(false);
      break;
    case "5":
      await chooseUser(true);
      break;
    case "6":
      await choseSshKey(true);
      break;
    case "7":
      await displaySystemMenu();
      break;
    case "10":
      Deno.exit(0);
      break;
    default:
      console.log("Invalid option");
  }
}

async function main() {
  // console.log(logo);
  console.log("");
  while (true) {
    await displayMenu();
    console.log("----------------------------------------");
  }
}

const start = new Command()
  .name("start git manager")
  .action(() => {
    main();
  })
  .description("start git manager");

const tool = new Command();
if (config.data.tools.git.hidden) tool.hidden();
tool
  .name("gitManager")
  .version("1.0.0")
  .description("git profile manager")
  .action(() => {
    tool.showHelp();
    Deno.exit();
  })
  .command("start", start)
  .command("createssh", createNewSshKeyCommand)
  .command("showssh", showAllSshKeysCommand)
  .command("gitclone", gitCloneCommand)
  .command("deletessh", deleteSshKeyCommand);

export default tool;
