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

const formatValue = (value: unknown): string => {
  if (Array.isArray(value)) {
    return JSON.stringify(value, null, 2);
  } else if (typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return String(value);
};

const expandedStates: Set<string> = new Set();

const GroupedEntries = (
  entries: { key: string[]; value: unknown; versionstamp: string }[],
) => {
  const grouped = entries.reduce(
    (acc, entry) => {
      const group = entry.key[0] || "Ungrouped";
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(entry);
      return acc;
    },
    {} as {
      [group: string]: {
        key: string[];
        value: unknown;
        versionstamp: string;
      }[];
    },
  );

  return Object.entries(grouped).map(([group, groupEntries]) => {
    return html`
      <tr>
        <td colspan="4"><strong>${group}</strong></td>
      </tr>
      ${
      groupEntries.map((entry, index) =>
        Row({
          index: index + 1,
          key: entry.key,
          value: entry.value,
          versionstamp: entry.versionstamp,
        })
      )
    }
    `;
  });
};

const Row = island<{
  index: number;
  key: string[];
  value: unknown;
  versionstamp: string;
}, {
  toggle: { key: string };
  remove: { key: string };
}>({
  template: ({ props, rpc }) => {
    const keyString = props.key.join("|");
    const isExpanded = expandedStates.has(keyString);
    const isLarge = JSON.stringify(props.value).length > 100;
    const preview = isLarge && !isExpanded
      ? JSON.stringify(props.value).substring(0, 100) + "..."
      : formatValue(props.value);
    // deno-fmt-ignore
    return html`
      <tr class="align-middle">
        <th scope="row">${props.index}</th>
        <td>${props.key.join(" ")}</td>
        <td>
          <div>
            <pre>${preview}</pre>
            ${isLarge ? html`<button class="btn btn-link" ${rpc.hx.toggle({ key: keyString })}>${isExpanded ? "Collapse" : "Expand"}</button>` : ""}
          </div>
        </td>
        <td>${props.versionstamp}</td>
        <td>
          <button
            class="btn btn-danger"
            ${rpc.hx.remove({ key: keyString })}
            hx-target="#alerts">
            Delete
          </button>
        </td>
      </tr>
    `;
  },
  rpc: {
    toggle: async ({ args }) => {
      const key = args.key;
      if (expandedStates.has(key)) {
        expandedStates.delete(key);
      } else {
        expandedStates.add(key);
      }
      return RESPONSE();
    },
    remove: async ({ args }) => {
      const key = args.key.split("|");
      expandedStates.delete(args.key);
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
        GroupedEntries(
          //@ts-ignore
          await Array.fromAsync(kv.list({ prefix: [] })),
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
    <div class="container p-5" style="max-width: 100rem;">
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
      <button class="btn btn-danger mt-3" hx-post="/clear-db" hx-target="#alerts">Clear Database</button>
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
