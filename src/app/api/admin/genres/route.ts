import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL;
const SECRET =
  process.env.SUPABASE_SECRET_KEY;

async function sb(
  path: string,
  init?: RequestInit
) {
  if (!SUPABASE_URL || !SECRET) {
    throw new Error(
      "Supabase env missing."
    );
  }

  const response = await fetch(
    `${SUPABASE_URL.replace(
      /\/$/,
      ""
    )}/rest/v1/${path}`,
    {
      ...init,
      headers: {
        apikey: SECRET,
        Authorization:
          `Bearer ${SECRET}`,
        "Content-Type":
          "application/json",
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    }
  );

  const text =
    await response.text();

  if (!response.ok) {
    throw new Error(
      `${response.status}: ${text}`
    );
  }

  return text
    ? JSON.parse(text)
    : [];
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(
      /[^a-z0-9_-]+/g,
      "-"
    )
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function GET() {
  if (
    !(await isAdminRequest())
  ) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }

  try {
    const genres = await sb(
      "genres?select=id,name,slug,pcolle_category_id,is_featured,featured_description&order=name.asc"
    );

    return NextResponse.json({
      genres,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "取得失敗",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request
) {
  if (
    !(await isAdminRequest())
  ) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }

  const body =
    await request.json();

  const name =
    typeof body.name === "string"
      ? body.name.trim()
      : "";

  const slug = slugify(
    typeof body.slug === "string"
      ? body.slug.trim()
      : ""
  );

  const rawCategory =
    body.pcolleCategoryId;

  const category =
    rawCategory == null ||
    rawCategory === ""
      ? null
      : Number(rawCategory);

  if (!name || !slug) {
    return NextResponse.json(
      {
        error:
          "ジャンル名と英数字slugは必須です。",
      },
      { status: 400 }
    );
  }

  try {
    const rows = await sb(
      "genres?on_conflict=slug",
      {
        method: "POST",
        headers: {
          Prefer:
            "resolution=merge-duplicates,return=representation",
        },
        body: JSON.stringify([
          {
            name,
            slug,
            pcolle_category_id:
              Number.isFinite(category)
                ? category
                : null,
          },
        ]),
      }
    );

    return NextResponse.json({
      ok: true,
      genre:
        rows?.[0] ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "登録失敗",
      },
      { status: 500 }
    );
  }
}
