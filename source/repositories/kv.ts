export const openKv = async () => {
  return await Deno.openKv();
};

export const kv = await openKv();
