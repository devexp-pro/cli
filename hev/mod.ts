import proxy from "./proxy/mod.ts";
import isolator from "./isolator/mod.ts";

const init = () => {
  proxy.init();
  console.log("hev init");
  isolator.init();
};

export default { init };
