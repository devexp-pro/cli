import { shelly } from "@vseplet/shelly";
import { showActiveProfileStatus } from "./activateProfile.ts";
import { ensureFile } from "https://deno.land/std@0.224.0/fs/mod.ts";
import { getUserInput, shellConfigFile } from "./helpers.ts";
import { Confirm } from "https://deno.land/x/cliffy@v1.0.0-rc.3/prompt/mod.ts";
import {
  CURRENT_DIRECTORY,
  PATH_HOME,
  PATH_TO_DOT,
  PATH_TO_GIT_CONFIG,
} from "../constants.ts";

async function searchWordInGitConfig(searchWord: string) {
  const fileContents = await Deno.readTextFile(PATH_TO_GIT_CONFIG);

  const lowercaseContents = fileContents.toLowerCase();
  const lowercaseSearchWord = searchWord.toLowerCase();

  if (lowercaseContents.includes(lowercaseSearchWord)) {
    return true;
  } else {
    return false;
  }
}

export async function gitClone() {
  const activeUserStatus = await showActiveProfileStatus(true);
  const shell = await shellConfigFile();

  if (activeUserStatus === false) {
    console.log("Select and activate a profile first");
    return;
  }
  console.log(
    `When cloning a repository, the SSH key of the currently active profile will be linked to its local version.`,
  );
  console.log(`Current key: ${activeUserStatus?.ssh}`);
  const confirmed: boolean = await Confirm.prompt("Do you understand?");
  if (!confirmed) {
    console.log("Cancel cloning");
    return;
  }

  const ssh = activeUserStatus?.ssh as string ?? "Empty";
  const gitCloneURL = await getUserInput(
    "Paste the link to clone the repository via SSH",
  );
  const repositoryName = await getUserInput(
    "Enter a unique name for this clone.",
  );
  const checkRepositoryName = searchWordInGitConfig(repositoryName);

  if (await checkRepositoryName === true) {
    console.log("This name is already taken. Please choose another one.");
    return;
  }

  const parseGitUrlData = await parseGitUrl(gitCloneURL);

  await updateConfigToNewLocalRepository(
    repositoryName,
    ssh,
    parseGitUrlData.source,
  );
  console.log("Update config..... Done.");

  await shelly(["git", "clone", `${gitCloneURL}`]);
  console.log("Repository clone..... Done");

  await shelly([
    "git",
    "-C",
    `${CURRENT_DIRECTORY}/${parseGitUrlData.projectName}`,
    "remote",
    "set-url",
    "origin",
    `git@${repositoryName}:${parseGitUrlData.username}/${parseGitUrlData.repository}`,
  ]);

  await shelly(["source", `${PATH_HOME}${shell}`]);

  console.log("Git set new URL..... Done");

  console.log("The process has been completed successfully.");
}

// Как заменить выброс ошибки простым сообщением?
function parseGitUrl(
  url: string,
): {
  source: string;
  username: string;
  repository: string;
  projectName: string;
} {
  const regex = /^git@([^:]+):([^/]+)\/(.+)$/;

  const match = url.match(regex);

  if (!match) {
    console.log(
      "Incorrect link format, check that it looks something like this:",
    );
    console.log("git@github.com-repo1:username/repository.git");
    throw new Error("Invalid Git URL format");
  }

  const [, source, username, repository] = match;
  const projectName = repository.replace(/\.git$/, "");

  return { source, username, repository, projectName };
}

async function updateConfigToNewLocalRepository(
  repositoryName: string,
  sshKey: string,
  source: string,
) {
  const updateBlock = `Host ${repositoryName}
HostName ${source}
User git
AddKeysToAgent yes
UseKeychain yes
IdentityFile ${Deno.env.get("HOME")}/.ssh/DOT/${sshKey}
IdentitiesOnly yes
UserKnownHostsFile ${PATH_TO_DOT}known_hosts`;

  await ensureFile(PATH_TO_GIT_CONFIG);
  const file = await Deno.open(PATH_TO_GIT_CONFIG, {
    write: true,
    append: true,
  });
  const encoder = new TextEncoder();
  await file.write(encoder.encode("\n" + "\n" + updateBlock));
  file.close();
}
