import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";

function tokenFor(password: string, secret: string) {
  return createHash("sha256")
    .update(`${password}:${secret}`)
    .digest("hex");
}

export async function POST(request: Request) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const secret = process.env.SUPABASE_SECRET_KEY;

  if (!adminPassword || !secret) {
    return NextResponse.json(
      { error: "管理画面の環境変数が未設定です。" },
      { status: 500 }
    );
  }

  let body: { password?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "リクエストが不正です。" },
      { status: 400 }
    );
  }

  const input =
    typeof body.password === "string" ? body.password : "";

  const a = Buffer.from(input);
  const b = Buffer.from(adminPassword);

  const valid =
    a.length === b.length &&
    timingSafeEqual(a, b);

  if (!valid) {
    return NextResponse.json(
      { error: "パスワードが違います。" },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set(
    "indie_admin",
    tokenFor(adminPassword, secret),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    }
  );

  return response;
}
