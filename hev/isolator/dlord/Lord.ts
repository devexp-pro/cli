import { shelly } from "@vseplet/shelly";
import { ok } from "node:assert";

export class Lord {
  constructor(private kv: Deno.Kv, private groupSlug: string = "default") {
  }

  async add(isolateParams: {
    slug: string;
    group: string;
    pathToScript: string;
    importMap?: string;
    env?: Record<string, string>;
  }): Promise<boolean> {
    const res = await this.kv.set(
      ["isolate", isolateParams.group, isolateParams.slug],
      isolateParams,
    );

    return res.ok;
  }

  async start(slug: string) {}
  async restart(slug: string) {}
  async stop(slug: string) {}
  async get(slug: string) {}
  async list() {}
}
