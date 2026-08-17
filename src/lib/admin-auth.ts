import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "node:crypto";

export function expectedAdminToken() {
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.SUPABASE_SECRET_KEY;

  if (!password || !secret) {
    throw new Error("ADMIN_PASSWORD / SUPABASE_SECRET_KEY is missing.");
  }

  return createHash("sha256")
    .update(`${password}:${secret}`)
    .digest("hex");
}

export async function isAdminRequest() {
  try {
    const store = await cookies();
    const actual = store.get("indie_admin")?.value ?? "";
    const expected = expectedAdminToken();

    const a = Buffer.from(actual);
    const b = Buffer.from(expected);

    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
