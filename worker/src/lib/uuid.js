/** UUID v4 via Web Crypto — available natively in Cloudflare Workers */
export function randomUUID() {
  return crypto.randomUUID();
}
