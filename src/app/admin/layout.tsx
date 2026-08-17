import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash } from "node:crypto";

function expectedToken() {
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.SUPABASE_SECRET_KEY;

  if (!password || !secret) {
    throw new Error(
      "ADMIN_PASSWORD または SUPABASE_SECRET_KEY が設定されていません。"
    );
  }

  return createHash("sha256")
    .update(`${password}:${secret}`)
    .digest("hex");
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = await cookies();
  const token = store.get("indie_admin")?.value;

  if (!token || token !== expectedToken()) {
    redirect("/admin-login");
  }

  return <>{children}</>;
}
