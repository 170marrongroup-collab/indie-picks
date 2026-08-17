"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error || "ログインに失敗しました。");
      }

      router.push("/admin/works");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "ログインに失敗しました。"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0c0c10",
        color: "#fff",
        display: "grid",
        placeItems: "center",
        padding: 20,
      }}
    >
      <form
        onSubmit={submit}
        style={{
          width: "min(420px,100%)",
          border: "1px solid #292932",
          borderRadius: 18,
          background: "#141419",
          padding: 26,
        }}
      >
        <p
          style={{
            color: "#ff5c7a",
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: ".16em",
            margin: 0,
          }}
        >
          H-IT ADMIN
        </p>

        <h1 style={{ fontSize: 28, margin: "8px 0 8px" }}>
          管理画面ログイン
        </h1>

        <p style={{ color: "#888", fontSize: 12, lineHeight: 1.7 }}>
          管理者パスワードを入力してください。
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          placeholder="管理者パスワード"
          style={{
            width: "100%",
            marginTop: 14,
            background: "#0d0d11",
            color: "#fff",
            border: "1px solid #303039",
            borderRadius: 10,
            padding: "13px 14px",
            fontSize: 14,
            outline: "none",
          }}
        />

        <button
          type="submit"
          disabled={loading || !password}
          style={{
            width: "100%",
            marginTop: 14,
            border: 0,
            borderRadius: 10,
            background: "#ff5c7a",
            color: "#fff",
            padding: "13px 16px",
            fontWeight: 900,
            cursor: "pointer",
            opacity: loading || !password ? 0.5 : 1,
          }}
        >
          {loading ? "確認中..." : "ログイン"}
        </button>

        {error && (
          <p
            style={{
              color: "#ff8da2",
              fontSize: 12,
              lineHeight: 1.6,
              marginTop: 12,
            }}
          >
            {error}
          </p>
        )}
      </form>
    </main>
  );
}
