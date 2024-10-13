import { createProjectCommand } from "./commands/create_project.ts";
import { selectProjectCommand } from "./commands/select_project.ts";
import { selectEnvCommand } from "./commands/select_env.ts";
import { generateTokenCommand } from "./commands/generate_token.ts";
import { addSecretCommand } from "./commands/add_secret.ts";

import { deleteEnvCommand } from "./commands/delete_env.ts";
import { renameEnvCommand } from "./commands/rename_env.ts";
import { showCurrentConfigCommand } from "./commands/show_current_config.ts";
import { fetchSecretsCommand } from "./commands/fetch_secrets.ts";
import { Command } from "@cliffy/command";
import { createEnvCommand } from "./commands/create_env.ts";
import { updateSecretCommand } from "./commands/update_secret.ts";
import { deleteSecretCommand } from "./commands/delete_secret.ts";
import { deleteProjectCommand } from "./commands/delete_project.ts";
import { renameProjectCommand } from "./commands/rename_project.ts";
import { runCommand } from "./commands/run.ts";
import { inviteUserCommand } from "./commands/invite_user.ts";
import { logoutCommand } from "./commands/logout.ts";
import { loginCommand } from "./commands/login.ts";
import { fetchAndSetSecretsCommand } from "./commands/fetch_and_set.ts";

const vault = new Command()
  .description(
    "vault description",
  )
  .command("create-project", createProjectCommand())
  .command("delete-project", deleteProjectCommand())
  .command("rename-project", renameProjectCommand())
  .command("select-project", selectProjectCommand())
  .command("select-env", selectEnvCommand())
  .command("create-env", createEnvCommand())
  .command("rename-env", renameEnvCommand())
  .command("delete-env", deleteEnvCommand())
  .command("generate-token", generateTokenCommand())
  .command("add-secret", addSecretCommand())
  .command("update-secret", updateSecretCommand())
  .command("delete-secret", deleteSecretCommand())
  .command("fetch-secrets", fetchSecretsCommand())
  .command("fetch-set", fetchAndSetSecretsCommand())
  .command("show-current", showCurrentConfigCommand())
  .command("run", runCommand())
  .command("logout", logoutCommand())
  .command("login", loginCommand())
  .command("invite", inviteUserCommand());

export default vault;
