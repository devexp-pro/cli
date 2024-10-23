import { addSecretCommand as _addSecretCommand } from "./secondary/add_secret.ts";
import { updateSecretCommand as _updateSecretCommand } from "./secondary/update_secret.ts";
import { deleteSecretCommand as _deleteSecretCommand } from "./secondary/delete_secret.ts";
import { fetchSecretsCommand as _fetchSecretsCommand } from "./secondary/fetch_secrets.ts";

export const addSecretCommand = _addSecretCommand;
export const updateSecretCommand = _updateSecretCommand;
export const deleteSecretCommand = _deleteSecretCommand;
export const fetchSecretsCommand = _fetchSecretsCommand;
