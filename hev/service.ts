import proxy from "./proxy/mod.ts";
import isolator from "./isolator/mod.ts";
import api from "./api/mod.ts";

const main = async () => {
  api.init();
  proxy.init();
  isolator.init();
};

await main();
