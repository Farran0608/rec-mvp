import crypto from "crypto";
import { canonicalize } from "./canonical.js";
export function computeSignature(body: any, secret: string): string {
  const msg = canonicalize(body);
  return crypto.createHmac("sha256", secret).update(msg).digest("hex");
}
export function verifySignature(body: any, headerSig: string | undefined, secret: string): boolean {
  if (!headerSig) return false;
  const expected = computeSignature(body, secret);
  const a = Buffer.from(expected), b = Buffer.from(headerSig);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
