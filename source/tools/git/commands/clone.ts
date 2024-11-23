import { Command } from "@cliffy/command";
import { kv } from "$/kv";
import { GitProfile } from "$/tools/git/types.ts";
import { shelly } from "@vseplet/shelly";
import { Select } from "@cliffy/prompt";

const action = async (repoUrl: string) => {
  const profiles = await Array.fromAsync(
    kv.list<GitProfile>({ prefix: ["tool", "git", "profile"] }),
  );

  if (profiles.length === 0) {
    console.log(" No profiles found");
    Deno.exit(-1);
  }

  const profileForClone: { slug: string; keyPath: string } = await Select
    .prompt({
      message: "Please select profile for clone:\n",
      options: profiles.map((entry) => ({
        // @ts-ignore
        name: `${entry.value.slug} (${entry.value.email})`,
        // @ts-ignore
        value: {
          slug: entry.value.slug,
          keyPath: entry.value.keyPath,
        },
      })),
    });

  await inlineAction(profileForClone.slug, repoUrl);
};

const inlineAction = async (slug: string, repoUrl: string) => {
  const profile = await kv.get<GitProfile>(["tool", "git", "profile", slug]);
  const repoPath = `${Deno.cwd()}/${
    // @ts-ignore
    repoUrl.split("/").pop().split(".").shift()}`;
  const repoConfigPath = `${repoPath}/.git/config`;

  if (!profile.value) {
    console.log(`Profile '${slug}' not found`);
    Deno.exit(-1);
  }

  let res = await shelly([
    "git",
    "clone",
    repoUrl,
    repoPath,
  ], {
    env: {
      GIT_SSH_COMMAND: `ssh -i ${profile?.value?.keyPath}`,
    },
  });

  if (res.code !== 0) {
    console.log(`\n${res.stderr}\n`);
    Deno.exit(-1);
  }

  res = await shelly([
    "git",
    "config",
    "--file",
    repoConfigPath,
    "core.sshCommand",
    `ssh -i ${profile?.value?.keyPath}`,
  ]);

  if (res.code !== 0) {
    console.log(`\n${res.stderr}\n`);
    Deno.exit(-1);
  }

  res = await shelly([
    "git",
    "config",
    "--file",
    repoConfigPath,
    "user.name",
    `${profile.value.name}`,
  ]);

  if (res.code !== 0) {
    console.log(`\n${res.stderr}\n`);
    Deno.exit(-1);
  }

  res = await shelly([
    "git",
    "config",
    "--file",
    repoConfigPath,
    "user.email",
    `${profile.value.email}`,
  ]);

  if (res.code !== 0) {
    console.log(`\n${res.stderr}\n`);
    Deno.exit(-1);
  }

  console.log(`  Repository cloned successfully <3`);

  Deno.exit(0);
};

const command = new Command()
  .name("clone")
  .description("clone repository")
  .arguments("<repo_url:string>")
  .option("-s, --slug <slug:string>", "git profile slug")
  .action(async (options: any, ...args: any) => {
    const [repoUrl] = args;
    const { slug } = options;

    if (slug) {
      inlineAction(slug, repoUrl);
    } else {
      action(repoUrl);
    }
  });

export default {
  action,
  command,
};
