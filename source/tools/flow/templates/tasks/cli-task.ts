// deno-lint-ignore-file
import { task } from "jsr:@vseplet/shibui@0.4.33/core";
import { CoreStartPot } from "jsr:@vseplet/shibui@0.4.33/core/pots";

export default task(CoreStartPot)
  .name`Simple Task`
  .do(async ({ finish, pots, log }) => {
    log.dbg(`run do function...`);
    return finish();
  });

// const res = await execute();
// Deno.exit(res ? 1 : -1);
