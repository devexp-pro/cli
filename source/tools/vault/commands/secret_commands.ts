// deno-lint-ignore-file no-fallthrough
import { Command } from "@cliffy/command";
import secretHandlers from "../handlers/secret/secret_handlers.ts";
import { Select, Input } from "@cliffy/prompt";
import { syncProjects } from "../api.ts";
import { displayCurrentProjectInfo } from "./project_commands.ts";

const secretMenu = async () => {

  const action = await Select.prompt({
    message: "What would you like to do with secrets?",
    options: [
      { name: "Add a secret", value: "add" },
      { name: "Update a secret", value: "update" },
      { name: "Delete a secret", value: "delete" },
      { name: "View secrets", value: "fetch" },
    ],
  });

  switch (action) {
    case "add":
      await secretHandlers.add.interactive();
     Deno.exit()
    case "update":
      await secretHandlers.update.interactive();
     Deno.exit()
    case "delete":
      await secretHandlers.delete.interactive();
     Deno.exit()
    case "fetch":
      await secretHandlers.fetch.interactive();
     Deno.exit()
    default:
      console.error("Invalid action. Please try again.");
  }
};

const secretCommand = new Command()
  .description("Manage secrets: add, update, delete, and view secrets.")
  .option("--action <action:string>", "Action: 'add', 'update', 'delete', or 'fetch'.")
  .option("--env-name <envName:string>", "Environment name to use.")
  .option("--key <key:string>", "Key of the secret for the action.")
  .option("--value <value:string>", "Value for adding or updating a secret.")
  .example("secret --action=add --env-name=dev --key=API_KEY --value=12345", "Add a secret to 'dev' environment.")
  .example("secret --action=update --env-name=dev --key=API_KEY --value=67890", "Update a secret in 'dev' environment.")
  .example("secret --action=delete --env-name=dev --key=API_KEY", "Delete a secret from 'dev' environment.")
  .example("secret --action=fetch --env-name=dev", "Fetch secrets from 'dev' environment.")
  .example("secret", "Open the interactive menu for managing secrets.")
  .action(async (options) => {
    await syncProjects();
    await displayCurrentProjectInfo();

    if (!options.action) {
      await secretMenu();
    } else {
      const envName = options.envName;
      const key = options.key;
      const value = options.value;

      switch (options.action) {
        case "add":
          if (envName && key && value) {
            await secretHandlers.add.byName(envName, key, value);
          } else {
            await secretHandlers.add.interactive();
          }
         Deno.exit()
        case "update":
          if (envName && key && value) {
            await secretHandlers.update.byName(envName, key, value);
          } else {
            await secretHandlers.update.interactive();
          }
         Deno.exit()
        case "delete":
          if (envName && key) {
            await secretHandlers.delete.byName(envName, key);
          } else {
            await secretHandlers.delete.interactive();
          }
         Deno.exit()
        case "fetch":
          if (envName) {
            await secretHandlers.fetch.byName(envName);
          } else {
            await secretHandlers.fetch.interactive();
          }
         Deno.exit()
        default:
          console.error("Invalid action. Use --help to see available options.");
      }
    }
  });

export default secretCommand;
