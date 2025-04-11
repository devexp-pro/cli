{
  const originalServe = Deno.serve;

  // Переопределяем
  const myCustomServe = function (options: any, handler?: any) {
    const newOptions = Object.assign({}, options, { port: 8000 });

    return originalServe.call(newOptions, handler);
  };

  Object.defineProperty(Deno, "serve", {
    value: myCustomServe,
    configurable: false, // пользователь не сможет переопределить
    writable: false,
  });

  Object.freeze(Deno.serve);

  Deno.listen = null;
}

const s = Deno.serve({ port: 4040 }, (_req) => new Response("Hello, world"));

console.log(Deno.listen);

console.log(Deno.uid());
