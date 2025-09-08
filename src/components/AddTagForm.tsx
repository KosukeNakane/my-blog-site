"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddTagForm() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const n = name.trim();
    if (!n) return;
    try {
      setLoading(true);
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: n }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "作成に失敗しました");
      }
      setName("");
      router.refresh();
      setMsg("追加しました");
    } catch (e: any) {
      setMsg(e?.message || "エラー");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="タグ名"
        className="rounded border border-gray-300 px-3 py-2"
      />
      <button
        type="submit"
        disabled={loading}
        className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
      >
        追加
      </button>
      {msg && <span className="text-xs text-gray-600">{msg}</span>}
    </form>
  );
}

