// deno-lint-ignore-file require-await
import { workflow } from "jsr:@vseplet/shibui@0.4.33/core";
import { ContextPot, CoreStartPot } from "jsr:@vseplet/shibui@0.4.33/core/pots";

class CTX extends ContextPot<{ x: number }> {
  override data = {
    x: 10,
  };
}

export default workflow(CTX)
  .name("simple workflow")
  .on(CoreStartPot, (_pot) => new CTX())
  .sq(({ task }) =>
    task()
      .name("single workflow task")
      .do(async ({ ctx, log, finish, fail }) => {
        if (Math.random() > 0.5) return fail("random!");
        log.dbg(`context data: ${JSON.stringify(ctx.data)}`);
        return finish();
      })
  );

// const res = await execute();
// Deno.exit(res ? 1 : -1);
