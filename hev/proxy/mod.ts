const kv = await Deno.openKv();

const init = async () => {
  console.log("proxy init");
};

export default {
  init,
};
