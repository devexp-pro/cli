// deno-lint-ignore-file no-case-declarations
// source/tools/vault/commands/main/secret.ts

import { Command } from "@cliffy/command";
import {
  addSecretCommand,
  deleteSecretCommand,
  fetchSecretsCommand,
  updateSecretCommand,
} from "../secret_commands.ts";
import { Select } from "@cliffy/prompt/select";
import { Input } from "../../deps.ts";
import { syncProjects } from "../../api.ts";
import { displayCurrentProjectInfo } from "../project_commands.ts";
// import { loadEnvFileCommand } from "../env_commands.ts";

const secretMenu = async () => {
  await syncProjects();
  await displayCurrentProjectInfo();

  const action = await Select.prompt({
    message: "What would you like to do with secrets?",
    options: [
      { name: "Add a secret", value: "add" },
      { name: "Update a secret", value: "update" },
      { name: "Delete a secret", value: "delete" },
      { name: "View secrets", value: "fetch" },
      { name: "Load secrets from a file", value: "loadEnvFile" }, // New menu item
    ],
  });

  switch (action) {
    case "add":
      const key = await Input.prompt("Enter the secret key:");
      const value = await Input.prompt("Enter the secret value:");
      await addSecretCommand().parse([key, value]);
      break;
    case "update":
      await updateSecretCommand().parse([]);
      break;
    case "delete":
      await deleteSecretCommand().parse([]);
      break;
    case "fetch":
      await fetchSecretsCommand().parse([]);
      break;
    // case "loadEnvFile":
    //   await loadEnvFileCommand().parse([]);
    //   break;
  }
};

const secretCommand = new Command()
  .description(
    "Manage secrets: add, update, delete, view, and load secrets from a file.",
  )
  .option(
    "--action <action:string>",
    "Action for secrets: 'add', 'update', 'delete', 'fetch', or 'loadEnvFile'.",
  )
  .option(
    "--key <key:string>",
    "The key of the secret to add, update, or delete.",
  )
  .option(
    "--value <value:string>",
    "The value for adding or updating a secret.",
  )
  .option(
    "--file <filePath:string>",
    "The path to the file for loading secrets.",
  )
  .option(
    "--env-name <envName:string>",
    "The environment name for loading secrets from a file.",
  ) // Additional parameter
  .example(
    "secret --action=add --key=API_KEY --value=12345",
    "Add a secret with the key 'API_KEY' and value '12345'.",
  )
  .example(
    "secret --action=update --key=API_KEY --value=67890",
    "Update the secret 'API_KEY' with the value '67890'.",
  )
  .example(
    "secret --action=delete --key=API_KEY",
    "Delete the secret with the key 'API_KEY'.",
  )
  .example(
    "secret --action=fetch",
    "Retrieve and display all secrets for the current environment.",
  )
  .example(
    "secret --action=loadEnvFile --file=config.env --env-name=prod",
    "Load secrets from the file 'config.env' into the 'prod' environment.",
  )
  .example("secret", "Open the menu for managing secrets.")
  .action(async (options) => {
    await syncProjects();
    await displayCurrentProjectInfo();
    switch (options.action) {
      case "add":
        if (options.key && options.value) {
          addSecretCommand().parse([options.key, options.value]);
        } else {
          console.error("Specify both --key and --value to add a secret.");
        }
        break;
      case "update":
        if (options.key && options.value) {
          updateSecretCommand().parse([
            "--key",
            options.key,
            "--value",
            options.value,
          ]);
        } else {
          updateSecretCommand().parse([]);
        }
        break;
      case "delete":
        if (options.key) {
          deleteSecretCommand().parse(["--key", options.key]);
        } else {
          deleteSecretCommand().parse([]);
        }
        break;
      case "fetch":
        fetchSecretsCommand().parse([]);
        break;
      // case "loadEnvFile":
      //   const args = options.file ? ["--file", options.file] : [];
      //   if (options.envName) args.push("--env-name", options.envName);
      //   loadEnvFileCommand().parse(args);
      //   break;
      default:
        secretMenu();
    }
  });

export default secretCommand;
