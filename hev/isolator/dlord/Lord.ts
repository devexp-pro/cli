import { shelly } from "@vseplet/shelly";

export class Lord {
  constructor(kv: Deno.Kv, groupSlug: string) {}

  async start(slug: string, args: any[]) {}
  async restart(slug: string) {}
  async stop(slug: string) {}
  async get(slug: string) {}
  async list() {}
}
