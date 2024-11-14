import { Command } from "@cliffy/command";
import { Checkbox, Input, prompt } from "@cliffy/prompt";
import { shelly } from "@vseplet/shelly";
import { HOME } from "$/constants";
import { kv } from "$/kv";
import { GitProfile } from "$/tools/git/types.ts";

const create = new Command()
  .name("create")
  .description("create git profile")
  .action(async () => {
    const { slug, email, name } = await prompt([{
      name: "slug",
      message: "Enter profile slug:",
      type: Input,
    }, {
      name: "email",
      message: "Enter profile email:",
      type: Input,
    }, {
      name: "name",
      message: "Enter profile full name:",
      type: Input,
    }]);

    const keyPath = `${HOME}/.ssh/dx_git_${slug}`;

    // @ts-ignore
    const result = await shelly([
      "ssh-keygen",
      "-t",
      "ed25519",
      "-C",
      email,
      "-f",
      `${HOME}/.ssh/dx_git_${slug}`,
    ]);

    if (result.code !== 0) {
      console.error(`\n${result.stderr}\n`);
      Deno.exit(1);
    }

    console.log(`\n${result.stdout}\n`);

    // @ts-ignore
    const res = await kv.set<GitProfile>(
      ["tool", "git", "profile", slug],
      {
        slug,
        email,
        name,
        keyPath,
      },
    );

    if (res.ok) {
      console.log("  Git profile created successfully");
      Deno.exit(0);
    } else {
      Deno.exit(1);
    }
  });

const edit = new Command()
  .name("edit")
  .description("edit git profile")
  .action(async (_options: any, ..._args: any) => {
    Deno.exit(0);
  });

const remove = new Command()
  .name("remove")
  .description("remove git profile")
  .action(async (_options: any, ..._args: any) => {
    const profiles = await Array.fromAsync(
      kv.list<GitProfile>({ prefix: ["tool", "git", "profile"] }),
    );

    const profilesToRemove: { slug: string; keyPath: string }[] = await Checkbox
      .prompt({
        message: "Please select profiles:\n",
        options: profiles.map((entry) => ({
          // @ts-ignore
          name: `${entry.value.slug} ${entry.value.name}`,
          // @ts-ignore
          value: {
            slug: entry.value.slug,
            keyPath: entry.value.keyPath,
          },
        })),
      });

    for (const profile of profilesToRemove) {
      await kv.delete(["tool", "git", "profile", profile.slug]);
      await Deno.remove(profile.keyPath);
      await Deno.remove(profile.keyPath + ".pub");
      console.log(`  Git profile '${profile.slug}' has been removed!`);
    }

    Deno.exit(0);
  });

const list = new Command()
  .name("list")
  .description("list git profiles")
  .action(async (_options: any, ..._args: any) => {
    Deno.exit(0);
  });

const action = async () => {
};

const command = new Command()
  .name("profile")
  .description("update or create git profile")
  .action(async (_options: any, ..._args: any) => {
    command.showHelp();
    Deno.exit(0);
  })
  .command("create", create)
  .command("edit", edit)
  .command("remove", remove)
  .command("list", list);

export default {
  action,
  command,
};
