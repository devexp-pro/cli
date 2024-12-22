import { createClient } from "../../config_sync.ts";
import { green, red } from "../../deps.ts";
import { TUUID } from "../../GuardenDefinition.ts";

export async function inviteUserToProject(
  projectUUID: TUUID,
  userEmail: string,
) {
  try {
    const client = await createClient();
    const response = await client.call("inviteUser", [projectUUID, userEmail]);

    if (!response.success) {
      throw new Error(`Failed to invite user: ${response.message}`);
    }

    console.log(
      green(
        `User with email '${userEmail}' successfully invited to the project.`,
      ),
    );
  } catch (error) {
    console.error(red(`Error: ${(error as Error).message}`));
  }
}
