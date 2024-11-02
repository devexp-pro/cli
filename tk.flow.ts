
import { task } from "jsr:@vseplet/shibui@0.4.36/core";

export default task()
  .name`tk`
  .do(async ({ finish, pots, log }) => {
    log.dbg('run do function...');
    return finish();
  });
