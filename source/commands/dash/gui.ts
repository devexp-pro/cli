import { Hono } from "@hono/hono";
import {
  clean,
  component,
  html,
  island,
  Reface,
  RESPONSE,
} from "@vseplet/reface";
import { kv } from "$/repositories/kv.ts";

const Row = island<{
  index: number;
  key: string[];
  value: unknown;
  versionstamp: string;
}, {
  remove: { key: string };
}>({
  template: ({ props, rpc }) => {
    // deno-fmt-ignore
    return html`
      <tr class="align-middle">
        <th scope="row">${props.index}</th>
        <td>${props.key.join(" ")}</td>
        <td>${JSON.stringify(props.value)}</td>
        <td>${props.versionstamp}</td>
        <td>
          <button
            class="btn btn-danger"
            ${rpc.hx.remove({ key: props.key.join("|") })}
            hx-target="#alerts">
            Delete
          </button>
        </td>
      </tr>
    `
  },
  rpc: {
    remove: async ({ args }) => {
      const key = args.key.split("|");
      await kv.delete(key);
      return RESPONSE(
        Alert("warning", `Value by key: ${key.join(" ")} deleted`),
      );
    },
  },
});

const ListOfEntries = island<{ interval: number }, { entries: null }>({
  template: ({ rpc, props }) => {
    return html`
      <table class="table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">key</th>
            <th scope="col">value</th>
            <th scope="col">versionstamp</th>
          </tr>
        </thead>
        <tbody ${rpc.hx.entries()} hx-trigger="load, every ${props.interval}s" hx-target="this" style="overflow-y: auto;">
        </tbody>
      </table>
    `;
  },
  rpc: {
    entries: async () =>
      RESPONSE(
        (await Array.fromAsync(kv.list({ prefix: [] })))
          .map((entry, index) =>
            Row({
              index: index + 1,
              key: entry.key as string[],
              value: entry.value,
              versionstamp: entry.versionstamp,
            })
          ),
      ),
  },
});

const Alert = (type: "success" | "danger" | "warning", message: string) => {
  return html`<div class="alert alert-${type}" role="alert" _="on load wait 4s then remove me">${message}</div>`;
};

const SubmitValue = island<
  { alertsId: string },
  { submit: { key: string; value: string; isJSON: string } }
>({
  template: ({ rpc, props }) => {
    return html`
      <form ${rpc.hx.submit()} hx-target="#${props.alertsId}" class="form-group">
        <div class="row mb-3">
          <div class="col">
            <label for="key" class="form-label">KEY</label>
            <input type="text" name="key" id="key" class="form-control" />
          </div>
          <div class="col">
            <label for="value" class="form-label">VALUE</label>
            <input type="text" name="value" id="value" class="form-control" />
          </div>
          <div class="col d-flex flex-column align-items-start">
            <div class="form-check mb-2">
              <input type="checkbox" name="isJSON" id="isJSON" class="form-check-input" />
              <label for="isJSON" class="form-check-label">JSON?</label>
            </div>
            <button type="submit" class="btn btn-primary w-100">Submit</button>
          </div>
        </div>
      </form>
    `;
  },
  rpc: {
    submit: async ({ args }) => {
      try {
        const isJSON = args.isJSON === "on";
        const key = args.key.split(" ");
        const value = isJSON
          ? JSON.parse(args.value || "{}")
          : args.value?.toString();
        const result = await kv.set(key as string[], value);
        if (result.ok) {
          return RESPONSE(Alert("success", "Value submitted"));
        } else {
          return RESPONSE(Alert("danger", "Value not submitted"));
        }
      } catch (e) {
        if (e instanceof Error) {
          return RESPONSE(Alert("danger", e.message));
        } else {
          return RESPONSE(Alert("danger", "Unknown error occurred"));
        }
      }
    },
  },
});

const EntryPage = component(() => {
  return html`
    <div class="container p-5" style="max-width: 50rem;">
      <h1>Simple Deno KV viewer</h1>
      <div class="mt-5">
        ${SubmitValue({ alertsId: "alerts" })}
        <hr class="my-5" />
      </div>
      <div class="mt-5">
        ${ListOfEntries({ interval: 2 })}
      </div>
      <hr class="my-5" />
      <div id="alerts"></div>
    </div>
  `;
});

const start = () => {
  Deno.serve(
    new Hono().route(
      "/",
      new Reface({
        layout: clean({
          htmx: true,
          jsonEnc: true,
          hyperscript: true,
          bootstrap: true,
        }),
      }).page("/", EntryPage).hono(),
    ).fetch,
  );
};

export default {
  start,
};
