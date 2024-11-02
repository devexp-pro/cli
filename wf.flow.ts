
import { workflow } from "jsr:@vseplet/shibui@0.4.36/core";
import { ContextPot } from "jsr:@vseplet/shibui@0.4.36/core/pots";

class CTX_wf extends ContextPot<{ x: number }> {
  override data = {
    x: 10,
  };
}

export default workflow(CTX_wf)
  .name("wf")
  .sq(({ task }) =>
    task()
      .name("single workflow task")
      .do(async ({ ctx, log, finish, fail }) => {
        if (Math.random() > 0.5) return fail("random!");
        log.dbg(`context data: ${JSON.stringify(ctx.data)}`);
        return finish();
      })
  );
