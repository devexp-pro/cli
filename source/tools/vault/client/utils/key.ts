import {
  decode,
  encode,
} from "https://deno.land/std@0.203.0/encoding/base64.ts";

const CONFIG_DIR = Deno.env.get("GUARDEN_CONFIG_DIR") ||
  `${Deno.env.get("HOME")}/.guarden`;
const CONFIG_FILE = `${CONFIG_DIR}/config.json`;

async function ensureConfigDir() {
  try {
    await Deno.stat(CONFIG_DIR);
  } catch {
    await Deno.mkdir(CONFIG_DIR, { recursive: true });
  }
}

function generateBase64Key(byteLength: number): string {
  const key = crypto.getRandomValues(new Uint8Array(byteLength));
  return btoa(String.fromCharCode(...key));
}

export async function getOrGenerateVaultKey(): Promise<string> {
  let key = Deno.env.get("VAULT_SECRET_KEY");
  if (key) {
    return key;
  }

  try {
    const configContent = await Deno.readTextFile(CONFIG_FILE);
    const config = JSON.parse(configContent);
    if (config.vaultSecretKey) {
      return config.vaultSecretKey;
    }
  } catch {}

  const generatedKey = generateBase64Key(32);
  const newConfig = { vaultSecretKey: generatedKey };
  await ensureConfigDir();
  await Deno.writeTextFile(CONFIG_FILE, JSON.stringify(newConfig, null, 2));

  console.log(
    "VAULT_SECRET_KEY не была установлена. Сгенерирован новый ключ и сохранён в конфигурационном файле.",
  );
  return generatedKey;
}
