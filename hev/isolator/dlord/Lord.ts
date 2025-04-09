import proxy from "../../proxy/mod.ts";

async function getFreePort(): Promise<number> {
  const listener = Deno.listen({ port: 0 }); // порт 0 — значит "любой свободный"
  const { port } = listener.addr as Deno.NetAddr;
  listener.close(); // освобождаем порт
  return port;
}

export class Lord {
  private childs: Array<Deno.ChildProcess> = [];

  constructor(private kv: Deno.Kv) {
    Deno.addSignalListener("SIGINT", async () => {
      this.childs.forEach((child) => {
        child.kill();
      });

      Deno.exit();
    });
  }

  async add(isolateParams: {
    slug: string;
    group: string;
    entrypoint: string;
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
    const isolatesToStart: any = await this.get(group, slug);

    for (const i in isolatesToStart) {
      const isolate = isolatesToStart[i];
      const port = await getFreePort();

      const command = new Deno.Command(Deno.execPath(), {
        args: [
          "-A",
          isolate.entrypoint,
        ],
        env: {
          "DX_PORT": port.toString(),
          "DX_ID": "1",
        },
        // stdin: "piped",
        stderr: "piped",
        stdout: "piped",
      });

      proxy.addRoute(isolate.slug, port);

      const child = command.spawn();
      this.childs.push(child);

      console.log(
        `start isolate on http://${isolate.slug}.localhost (pid: ${child.pid}, port: ${port})`,
      );

      // child.stdout.pipeTo(Deno.stdout.writable);
      // child.stderr.pipeTo(Deno.stderr.writable);
    }

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
