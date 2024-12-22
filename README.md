![Альтернативный текст](./docs/dx.png)

## How to install:

Production version (Not available, still in development):

```sh
deno -A -r --unstable-kv https://devexp.pro/branch.ts main dx
```

Development version (For testing the latest changes, new features, and more):

```sh
deno -A -r --unstable-kv https://devexp.pro/branch.ts develop dxd
```

By tag (Great for containers with pre-installed Deno):

```sh
deno -A -r --unstable-kv https://devexp.pro/tag.ts [tag] [alias_name]
```

By branch (Suitable for development and testing from a specific branch):

```sh
deno -A -r --unstable-kv https://devexp.pro/branch.ts [branch_name] [alias_name]
```

## [Documentation](./docs/main.md)
