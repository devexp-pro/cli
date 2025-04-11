const kv = await Deno.openKv();

const portMap: Record<string, number> = {};
const handlerMap: Record<string, (req: Request) => Promise<Response>> = {};
const defaultHandler: (req: Request) => Promise<Response> = async (
  req: Request,
) => {
  return new Response("Not found", { status: 404 });
};

const mainRequestHandler = async (req: Request) => {
  const url = new URL(req.url);
  const hostname = req.headers.get("host") ?? "";
  const subdomain = hostname.split(".")[0];

  if (subdomain === hostname) {
    console.log(`subdomain not found, run default handler`);
    return await defaultHandler(req);
  }

  const handler = handlerMap[subdomain];
  if (handler) {
    console.log(`found subdomain ${subdomain} for handler`);
    try {
      return await handler(req);
    } catch (err) {
      console.error("Proxy error:", err);
      return new Response("Upstream error", { status: 502 });
    }
  }

  const port = portMap[subdomain];
  if (!port) {
    console.error("Domain not found:", hostname);
    return new Response("Domain not found", { status: 502 });
  } else {
    console.log(`found subdomain ${subdomain} for port ${port}`);
  }

  const targetUrl = `http://127.0.0.1:${port}${url.pathname}${url.search}`;

  const proxyReq = new Request(targetUrl, {
    method: req.method,
    headers: req.headers,
    body: req.body,
  });

  try {
    const response = await fetch(proxyReq);
    return response;
  } catch (err) {
    console.error("Proxy error:", err);
    return new Response("Upstream error", { status: 502 });
  }
};

const addRoute = (subDomain: string, localPort: number) => {
  portMap[subDomain] = localPort;
  console.log("proxy addRoute", subDomain, localPort);
};

const init = async (port: number = 4040) => {
  console.log(`proxy init on port: ${port}`);
  Deno.serve({ port }, mainRequestHandler);
};

export default {
  init,
  addRoute,
};
