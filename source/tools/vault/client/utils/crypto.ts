import {
  decode,
  encode,
} from "https://deno.land/std@0.203.0/encoding/base64.ts";
import { getOrGenerateVaultKey } from "./key.ts";

const SECRET_KEY = await getOrGenerateVaultKey();

let keyData: Uint8Array;
try {
  keyData = decode(SECRET_KEY);
} catch (e) {
  console.error("VAULT_SECRET_KEY содержит некорректную base64 строку.");
  Deno.exit(1);
}

if (![16, 24, 32].includes(keyData.length)) {
  console.error(
    "VAULT_SECRET_KEY должна быть закодирована в base64 и иметь длину 16, 24 или 32 байта.",
  );
  Deno.exit(1);
}

const cryptoKey = await crypto.subtle.importKey(
  "raw",
  keyData,
  { name: "AES-GCM" },
  false,
  ["encrypt", "decrypt"],
);

export async function encryptText(text: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const encoded = encoder.encode(text);

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    encoded,
  );

  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return btoa(String.fromCharCode(...combined));
}

export async function decryptText(data: string): Promise<string> {
  const combined = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));

  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    ciphertext,
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}
