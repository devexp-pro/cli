import dlord from "./dlord/mod.ts";

const kv = await Deno.openKv();
const pm = new dlord.Lord(kv, "isolator");

const init = async () => {
  Deno.addSignalListener("SIGINT", () => {
    // kill all isolates
    Deno.exit();
  });
};

export default {
  init,
};
