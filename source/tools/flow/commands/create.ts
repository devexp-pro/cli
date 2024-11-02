import { Command } from "@cliffy/command";
import { Select } from "@cliffy/prompt/select";
import { Input } from "@cliffy/prompt/input";

const taskFileText = (name: string) => `
import { task } from "jsr:@vseplet/shibui@0.4.33/core";
import { CoreStartPot } from "jsr:@vseplet/shibui@0.4.33/core/pots";

export default task(CoreStartPot)
  .name\`${name}\`
  .do(async ({ finish, pots, log }) => {
    log.dbg('run do function...');
    return finish();
  });
`;

const workflowFileText = (name: string) => `
import { workflow } from "jsr:@vseplet/shibui@0.4.33/core";
import { ContextPot, CoreStartPot } from "jsr:@vseplet/shibui@0.4.33/core/pots";

class CTX_${name} extends ContextPot<{ x: number }> {
  override data = {
    x: 10,
  };
}

export default workflow(CTX_${name})
  .name("${name}")
  .on(CoreStartPot, (_pot) => new CTX_${name})
  .sq(({ task }) =>
    task()
      .name("single workflow task")
      .do(async ({ ctx, log, finish, fail }) => {
        if (Math.random() > 0.5) return fail("random!");
        log.dbg(\`context data: \${JSON.stringify(ctx.data)}\`);
        return finish();
      })
  );
`;

const action = async () => {
  const command: string = await Select.prompt({
    message: "Please, select action:",
    options: [
      { name: "workflow", value: "workflow" },
      { name: "task", value: "task" },
      { name: "help", value: "help" },
    ],
  });

  const name = (await Input.prompt(`Please, type ${command} name:`))
    .replaceAll(" ", "_");

  if (command == "task") {
    Deno.writeFileSync(
      `${name}.flow.ts`,
      new TextEncoder().encode(taskFileText(name)),
    );
  }

  if (command == "workflow") {
    Deno.writeFileSync(
      `${name}.flow.ts`,
      new TextEncoder().encode(workflowFileText(name)),
    );
  }
};

const command = new Command()
  .name("create")
  .description("create subcommand description")
  .action(async (_options: any, ..._args: any) => {
    await action();

    Deno.exit(0);
  });

export default {
  action,
  command,
};
