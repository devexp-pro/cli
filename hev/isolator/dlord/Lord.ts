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

  async start(group: string, slug?: string) {
    const isolatesToStart: any = this.get(group, slug);

    return isolatesToStart;
  }

  async restart(group: string, slug?: string) {
    const isolatesToRestart: any = this.get(group, slug);

    return isolatesToRestart;
  }
  async stop(group: string, slug?: string) {
    const isolatesToStop: any = this.get(group, slug);

    return isolatesToStop;
  }

  async get(group: string, slug?: string) {
    const isolates: any = [];

    if (slug) {
      const isolate = await this.kv.get(
        ["isolate", group, slug],
      );

      isolates.push(isolate.value);
    } else {
      const list = this.kv.list({ prefix: ["isolate", group] });
      for await (const entry of list) {
        isolates.push(entry.value);
      }
    }

    return isolates;
  }
}
