import { Command } from "@cliffy/command";
import { Select } from "@cliffy/prompt/select";
import { Input } from "@cliffy/prompt/input";

const shibuiVersion = "0.4.40";

const taskFileText = (name: string) => `
import { task } from "jsr:@vseplet/shibui@${shibuiVersion}/core";

export default task()
  .name\`${name}\`
  .do(async ({ finish, pots, log }) => {
    log.dbg('run do function...');
    return finish();
  });
`;

const workflowFileText = (name: string) => `
import { workflow } from "jsr:@vseplet/shibui@${shibuiVersion}/core";
import { ContextPot } from "jsr:@vseplet/shibui@${shibuiVersion}/core/pots";

class CTX_${name} extends ContextPot<{ x: number }> {
  override data = {
    x: 10,
  };
}

export default workflow(CTX_${name})
  .name("${name}")
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

  Deno.exit(0);
};

const command = new Command()
  .name("create")
  .description("Create scripts")
  .action(async (_options: any, ..._args: any) => {
    await action();
  });

export default {
  action,
  command,
};
