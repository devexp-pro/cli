import { addSecretCommand as _addSecretCommand } from "./add_secret.ts";
import { updateSecretCommand as _updateSecretCommand } from "./update_secret.ts";
import { deleteSecretCommand as _deleteSecretCommand } from "./delete_secret.ts";
import { fetchSecretsCommand as _fetchSecretsCommand } from "./fetch_secrets.ts";

export const addSecretCommand = _addSecretCommand;
export const updateSecretCommand = _updateSecretCommand;
export const deleteSecretCommand = _deleteSecretCommand;
export const fetchSecretsCommand = _fetchSecretsCommand;
