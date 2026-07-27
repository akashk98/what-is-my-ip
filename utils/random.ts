const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
const TOKEN_ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function randomValues(length: number) {
  if (typeof globalThis?.crypto?.getRandomValues === "function") {
    const bytes = new Uint8Array(length);
    globalThis.crypto.getRandomValues(bytes);
    return bytes;
  }

  const nodeCrypto = typeof require !== "undefined" ? require("crypto") : null;
  if (nodeCrypto?.webcrypto?.getRandomValues) {
    return nodeCrypto.webcrypto.getRandomValues(new Uint8Array(length));
  }

  const fallback = new Uint8Array(length);
  for (let i = 0; i < length; i += 1) {
    fallback[i] = Math.floor(Math.random() * 256);
  }
  return fallback;
}

function createRandomString(length: number, alphabet: string) {
  const bytes = randomValues(length);
  const alphabetLength = alphabet.length;
  let result = "";

  for (let i = 0; i < length; i += 1) {
    result += alphabet[bytes[i] % alphabetLength];
  }

  return result;
}

export function createRandomSlug(length = 8) {
  return createRandomString(length, ALPHABET);
}

export function createEditToken(length = 32) {
  return createRandomString(length, TOKEN_ALPHABET);
}

export function getCurrentIsoDate() {
  return new Date().toISOString();
}
