import { Lord } from "./Lord.ts";

const kv = await Deno.openKv();
const pm = new Lord(kv, "default");

export default {
  pm,
  Lord,
};
