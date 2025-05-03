import tui from "$/providers/tui/mod.ts";
import { SERVICE_URL } from "$/constants";
import fetchify from "@vseplet/fetchify";
import { getSession } from "$/providers/session.ts";
import { DxAction } from "$/types";
import clipboard from "$/providers/clipboard.ts";

const createClient = async () => {
  const session = await getSession();
  if (session === null) {
    tui.err("Has no session, please login");
    Deno.exit(-1);
  }

  return fetchify.create({
    limiter: {
      rps: 1,
      rt: () => 1000,
    },
    baseURL: `${SERVICE_URL}/tool/clip`,
    headers: {
      Identifier: session.id,
      Authorization: session.key,
    },
  });
};

export const loadAction: DxAction = {
  name: "load",
  description: "loads the stored text from the cloud clipboard.",
  handler: async (options: any) => {
    const clipApi = await createClient();
    const res = await clipApi.post("/load");

    if (res.status == 200) {
      const text = await res.text();
      await clipboard.write(text);

      if (options?.show) {
        console.log();
        tui.log(text);
        console.log();
      }

      tui.def("Text successfully loaded.");
    } else {
      tui.errAndExit(`Failed to load text. Reason: ${res.statusText}`);
    }

    Deno.exit();
  },
};

export const storeAction: DxAction = {
  name: "store",
  description: "stores the provided text to the cloud clipboard",
  handler: async (options: any, ...args: any) => {
    const clipApi = await createClient();

    const text = args.join(" ") || await clipboard.read();

    const res = await clipApi.post("/store", {
      body: text,
    });

    if (res.status == 200) {
      if (options?.show) {
        console.log();
        tui.log(text);
        console.log();
      }

      tui.log("Text successfully stored.");
    } else {
      tui.errAndExit(`Failed to store text. Reason: ${res.statusText}`);
    }

    Deno.exit();
  },
};
