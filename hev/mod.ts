import proxy from "./proxy/mod.ts";
import isolator from "./isolator/mod.ts";

const init = async () => {
  proxy.init(80);
  console.log("hev init on entry point: http://localhost");
  isolator.init();
};

export default { init, isolator };
