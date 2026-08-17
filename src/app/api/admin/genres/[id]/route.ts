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

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  if (
    !(await isAdminRequest())
  ) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }

  const { id } = await params;
  const body =
    await request.json();

  try {
    const payload:
      Record<string, unknown> = {};

    if (
      "pcolleCategoryId" in body
    ) {
      const raw =
        body.pcolleCategoryId;

      const value =
        raw == null || raw === ""
          ? null
          : Number(raw);

      payload.pcolle_category_id =
        Number.isFinite(value)
          ? value
          : null;
    }

    if (
      "featuredDescription" in body
    ) {
      payload.featured_description =
        typeof body.featuredDescription ===
        "string"
          ? body.featuredDescription.trim() ||
            null
          : null;
    }

    if (
      body.isFeatured === true
    ) {
      // おすすめは必ず1ジャンルだけ
      await sb(
        "genres?is_featured=eq.true",
        {
          method: "PATCH",
          headers: {
            Prefer:
              "return=minimal",
          },
          body: JSON.stringify({
            is_featured: false,
          }),
        }
      );

      payload.is_featured = true;
    }

    const rows = await sb(
      `genres?id=eq.${encodeURIComponent(
        id
      )}`,
      {
        method: "PATCH",
        headers: {
          Prefer:
            "return=representation",
        },
        body: JSON.stringify(
          payload
        ),
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
            : "更新失敗",
      },
      { status: 500 }
    );
  }
}
