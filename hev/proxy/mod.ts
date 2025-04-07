const kv = await Deno.openKv();

const init = async () => {
  console.log("proxy init");
  Deno.serve({ port: 4040 }, (_req) => new Response("Hello, world"));
};

export default {
  init,
};
