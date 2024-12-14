// deno-lint-ignore-file no-fallthrough
// source/tools/vault/commands/env_commands.ts

import { Command } from "@cliffy/command";
import envHandlers from "../handlers/env/env_handlers.ts";
import { Select } from "@cliffy/prompt/select";
import { syncProjects } from "../config_sync.ts";
import { displayCurrentProjectInfo } from "./project_commands.ts";

const envMenu = async () => {
  const action = await Select.prompt({
    message: "What would you like to do with environments?",
    options: [
      { name: "View the current environment", value: "view" },
      { name: "Create a new environment", value: "create" },
      { name: "Rename an environment", value: "rename" },
      { name: "Delete an environment", value: "delete" },
      { name: "Select an environment", value: "select" },
      { name: "Load environment variables from a file", value: "loadEnvFile" },
    ],
  });

  switch (action) {
    case "view":
      await envHandlers.view.current();
      Deno.exit();
    case "create":
      await envHandlers.create.interactive();
      Deno.exit();
    case "rename":
      await envHandlers.rename.interactive();
      Deno.exit();
    case "delete":
      await envHandlers.delete.interactive();
      Deno.exit();
    case "select":
      await envHandlers.select.interactive();
      Deno.exit();
    case "loadEnvFile":
      await envHandlers.loadEnv.interactive();
      Deno.exit();
    default:
      console.error("Invalid action. Please try again.");
  }
};

const envCommand = new Command()
  .description("Manage project environments: create, select, rename, and delete environments.")
  .option("--action <action:string>", "Action: 'view', 'create', 'rename', 'delete', or 'select'.")
  .option("--env-name <envName:string>", "Environment name for the action.")
  .option("--new-name <newName:string>", "New name for renaming an environment.")
  .option("--file <filePath:string>", "Path to the environment variables file (default is .env).")
  .example("env --action=loadEnvFile --file=config.env", "Load variables from 'config.env'.")
  .example("env --action=view", "View the current environment.")
  .example("env --action=create --env-name=dev", "Create an environment named 'dev'.")
  .example("env --action=rename --env-name=dev --new-name=prod", "Rename environment 'dev' to 'prod'.")
  .example("env --action=delete --env-name=prod", "Delete environment named 'prod'.")
  .example("env --action=select --env-name=prod", "Select environment 'prod'.")
  .example("env", "Open the interactive menu for managing environments.")
  .action(async (options) => {
    try{
      await syncProjects(); 
      await displayCurrentProjectInfo();
    if (!options.action) {

      await envMenu();
    } else {

    
        switch (options.action) {
          case "view":
            await envHandlers.view.current();
            Deno.exit()
          case "create":
            if (options.envName) {
              await envHandlers.create.byName(options.envName);
            } else {
              await envHandlers.create.interactive();
            }
            Deno.exit()
          case "rename":
            if (options.envName && options.newName) {
              await envHandlers.rename.byName(options.envName, options.newName);
            } else {
              await envHandlers.rename.interactive();
            }
            Deno.exit()
          case "delete":
            if (options.envName) {
              await envHandlers.delete.byName(options.envName);
            } else {
              await envHandlers.delete.interactive();
            }
            Deno.exit()
          case "select":
            if (options.envName) {
              await envHandlers.select.byName(options.envName);
            } else {
              await envHandlers.select.interactive();
            }
            Deno.exit()
            case "loadEnvFile":
  if (options.file && options.envName) {
    await envHandlers.loadEnv.byName(options.envName, options.file);
  } else {
    await envHandlers.loadEnv.interactive();
  }
  Deno.exit()

          default:
            console.error("Invalid action. Use --help to see available options.");
            Deno.exit()
        }
      }
      } catch (error) {
        console.error(`Error: ${(error as Error).message}`);
        Deno.exit()
      }
  });

export default envCommand;



// export function loadEnvFileCommand() {
//   return new Command()
//     .description("Load environment variables from a file.")
//     .option(
//       "--file <filePath:string>",
//       "Path to the environment variables file (default is .env).",
//     )
//     .option(
//       "--env-name <envName:string>",
//       "Name of the environment to load variables into.",
//     )
//     .action(async (options) => {
//       const { currentConfig } = await getCurrentConfig();

//       if (!currentConfig?.currentProjectUUID) {
//         console.error(red("The current project is not selected."));
//         return;
//       }

//       const projects = await getFullConfigKV();
//       const currentProject = projects?.find((p) =>
//         p.uuid === currentConfig.currentProjectUUID
//       );

//       if (!currentProject || !currentProject.environments?.length) {
//         console.error(
//           red("No environments available for the current project."),
//         );
//         return;
//       }

//       let selectedEnvUUID: TUUID | undefined;

//       if (options.envName) {
//         const environment = currentProject.environments.find((env) =>
//           env.name === options.envName
//         );
//         if (!environment) {
//           console.log(
//             red(`Environment with the name ${options.envName} not found.`),
//           );
//           Deno.exit();
//         }
//         selectedEnvUUID = environment.uuid;
//       } else {
//         selectedEnvUUID = (await Select.prompt({
//           message: "Select the environment to load variables into:",
//           options: currentProject.environments.map((env) => ({
//             name: env.name,
//             value: env.uuid,
//           })),
//         })) as TUUID;
//       }

//       const envFilePath = options.file ||
//         await Input.prompt(
//           "Enter the path to the environment variables file (default is .env):",
//         ) || ".env";
//       await loadEnvFileAndAddSecrets(envFilePath, selectedEnvUUID);
//       Deno.exit();
//     });
// }

// export async function loadEnvFileAndAddSecrets(
//   filePath: string,
//   envUUID: TUUID,
// ) {
//   try {
//     const envVars = await loadEnv({ envPath: filePath, export: false });
//     console.log(
//       green(`Variables from the file ${filePath} loaded successfully.`),
//     );

//     const client = await createClient();
//     const addSecretPromises = Object.entries(envVars).map(([key, value]) =>
//       client.call("addSecret", [envUUID, key, value])
//     );

//     const results = await Promise.allSettled(addSecretPromises);
//     results.forEach((result, idx) => {
//       const key = Object.keys(envVars)[idx];
//       if (result.status === "fulfilled" && result.value.success) {
//         console.log(green(`Secret '${key}' added successfully.`));
//       } else {
//         console.error(
//           red(
//             `Error adding secret '${key}': ${
//               //@ts-ignore
//               result.message || "unknown error"}`,
//           ),
//         );
//       }
//     });
//   } catch (error) {
//     console.error(
//       red(`Error loading file ${filePath}: ${(error as Error).message}`),
//     );
//   }
// }
