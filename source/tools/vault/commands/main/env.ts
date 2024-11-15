// source/tools/vault/commands/main/env.ts

// deno-lint-ignore-file
import { Command } from "@cliffy/command";
import {
  createEnvCommand,
  deleteEnvCommand,
  renameEnvCommand,
  selectEnvCommand,
} from "../env_commands.ts";
import { Select } from "@cliffy/prompt/select";
import { Input } from "../../deps.ts";
import { displayCurrentProjectInfo } from "../project_commands.ts";
import { syncProjects } from "../../api.ts";

const envMenu = async () => {
  await syncProjects();
  await displayCurrentProjectInfo();

  const action = await Select.prompt({
    message: "What would you like to do with environments?",
    options: [
      { name: "Create environment", value: "create" },
      { name: "Select environment", value: "select" },
      { name: "Rename environment", value: "rename" },
      { name: "Delete environment", value: "delete" },
    ],
  });

  switch (action) {
    case "create":
      const envName = await Input.prompt("Enter the environment name:");
      await createEnvCommand().parse([envName]);
      break;
    case "select":
      await selectEnvCommand().parse([]);
      break;
    case "rename":
      await renameEnvCommand().parse([]);
      break;
    case "delete":
      await deleteEnvCommand().parse([]);
      break;
  }
};

const envCommand = new Command()
  .description(
    "Manage project environments: create, select, rename, and delete environments.",
  )
  .option(
    "--action <action:string>",
    "Action with environment: 'create', 'select', 'rename', or 'delete'.",
  )
  .option(
    "--env-name <envName:string>",
    "Environment name for creation, selection, or deletion.",
  )
  .option(
    "--new-name <newName:string>",
    "New name for renaming the environment.",
  )
  .example(
    "env --action=create --env-name=dev",
    "Create an environment named 'dev'",
  )
  .example("env --action=select --env-name=prod", "Select environment 'prod'")
  .example(
    "env --action=rename --env-name=dev --new-name=prod",
    "Rename environment 'dev' to 'prod'",
  )
  .example(
    "env --action=delete --env-name=prod",
    "Delete environment named 'prod'",
  )
  .example("env", "Open the menu for environment management")
  .action((options) => {
    if (options.action === "create" && options.envName) {
      createEnvCommand().parse([options.envName]);
    } else if (options.action === "select" && options.envName) {
      selectEnvCommand().parse(["--env-name", options.envName]);
    } else if (
      options.action === "rename" && options.envName && options.newName
    ) {
      renameEnvCommand().parse([
        "--old-name",
        options.envName,
        "--new-name",
        options.newName,
      ]);
    } else if (options.action === "delete" && options.envName) {
      deleteEnvCommand().parse(["--env-name", options.envName]);
    } else {
      envMenu();
    }
  });

export default envCommand;
