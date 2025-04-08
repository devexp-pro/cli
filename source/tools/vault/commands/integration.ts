// deno-lint-ignore-file no-fallthrough
// source/tools/vault/commands/integration_commands.ts
import { Command } from "@cliffy/command";
import { Confirm, green, Input, red } from "../deps.ts";
import { createClient, getCurrentConfig } from "../config_sync.ts";
import { TUUID } from "../GuardenDefinition.ts";
import { Select } from "@cliffy/prompt/select";

async function fetchDenoProjects(accessToken: string) {
  const response = await fetch("https://dash.deno.com/api/projects", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error("Failed to fetch Deno Deploy projects");
  const projects = await response.json();
  return projects.map((p: any) => ({ name: p.name, value: p.id }));
}

const integrationMenu = async () => {
  const action = await Select.prompt({
    message: "What do you want to do with integrations?",
    options: [
      { name: "Create / Update Integration", value: "create" },
      { name: "Delete Integration", value: "delete" },
      { name: "Force Redeploy", value: "redeploy" },
      { name: "View Integrations", value: "view" },
    ],
  });

  switch (action) {
    case "create":
      await createOrUpdateIntegration();
      Deno.exit();
    case "delete":
      await deleteIntegration();
      Deno.exit();
    case "redeploy":
      await forceRedeploy();
      Deno.exit();
    case "view":
      await viewIntegrations();
      Deno.exit();
  }
};

async function createOrUpdateIntegration() {
  const accessToken = await Input.prompt("Enter Deno Deploy Access Token:");
  const denoProjects = await fetchDenoProjects(accessToken);
  const denoProjectId = await Select.prompt({
    message: "Choose Deno Deploy project:",
    options: denoProjects,
  }) as string;

  const { currentConfig, fullConfig } = await getCurrentConfig();
  const currentProject = fullConfig?.find((p) =>
    p.uuid === currentConfig?.currentProjectUUID
  );

  if (!currentProject) {
    console.error(red("Current project is not selected."));
    return;
  }

  const envUUID = await Select.prompt({
    message: "Choose Vault environment:",
    options: currentProject.environments.map((e) => ({
      name: e.name,
      value: e.uuid,
    })),
  });

  const autoRedeploy = await Confirm.prompt(
    "Enable auto-redeploy on secret change?",
  );

  const client = await createClient();
  const response = await client.call("createIntegration", [
    accessToken,
    denoProjectId,
    envUUID as TUUID,
    autoRedeploy,
  ]);

  response.success
    ? console.log(green("Integration saved."))
    : console.error(red(response.message ?? "Unknown error"));
}

async function deleteIntegration() {
  const client = await createClient();
  const integrationsRes = await client.call("getIntegrations", []);
  if (!integrationsRes.success || !integrationsRes.integrations?.length) {
    console.error(red("No integrations found."));
    return;
  }

  const selectedId = await Select.prompt({
    message: "Choose integration to delete:",
    options: integrationsRes.integrations.map((i) => ({
      name: `${i.name} (${i.denoDeployProjectId})`,
      value: i.id,
    })),
  });

  const response = await client.call("deleteIntegration", [
    selectedId as TUUID,
  ]);
  response.success
    ? console.log(green("Integration deleted."))
    : console.error(red(response.message ?? "Unknown error"));
}

async function forceRedeploy() {
  const client = await createClient();
  const integrationsRes = await client.call("getIntegrations", []);
  if (!integrationsRes.success || !integrationsRes.integrations?.length) {
    console.error(red("No integrations found."));
    return;
  }

  const selectedId = await Select.prompt({
    message: "Choose integration to redeploy:",
    options: integrationsRes.integrations.map((i) => ({
      name: `${i.name} (${i.denoDeployProjectId})`,
      value: i.id,
    })),
  });

  const response = await client.call("forceRedeployIntegration", [
    selectedId as TUUID,
  ]);
  response.success
    ? console.log(green("Redeploy initiated."))
    : console.error(red(response.message ?? "Unknown error"));
}

async function viewIntegrations() {
  const client = await createClient();
  const integrationsRes = await client.call("getIntegrations", []);
  if (!integrationsRes.success || !integrationsRes.integrations?.length) {
    console.log(red("No integrations found."));
    return;
  }
  integrationsRes.integrations.forEach((i) => {
    console.log(`- ${i.name}: ${i.denoDeployProjectId}`);
  });
}

const integrationCommand = new Command()
  .description("Manage Deno Deploy integrations")
  .action(integrationMenu);

export default integrationCommand;
