const log = (...data: any[]) => {
  const white = "\x1b[37m";
  const reset = "\x1b[0m";
  console.log("  " + white, ...data, reset);
};

const err = (...data: any[]) => {
  const redBgWhiteText = "\x1b[41m\x1b[37m";
  const reset = "\x1b[0m";
  const str = data.map((item) => String(item)).join(" ");
  console.log("  " + redBgWhiteText + str + reset);
};

const errAndExit = (...data: any[]): null => {
  const redBgWhiteText = "\x1b[41m\x1b[37m";
  const reset = "\x1b[0m";
  const str = data.map((item) => String(item)).join(" ");
  console.log("  " + redBgWhiteText + str + reset);
  Deno.exit(-1);
};

const def = (...data: any[]) => {
  const str = data.map((item) => String(item)).join(" ");
  console.log("  " + str);
};

const print = (...data: any[]) => {
  const encoder = new TextEncoder();
  const str = data.map((item) => String(item)).join(" ");
  Deno.stdout.writeSync(encoder.encode(str));
};

export default {
  print,
  def,
  log,
  err,
  errAndExit,
};
