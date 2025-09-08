"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = { onChanged?: () => void };

export default function AddTagForm({ onChanged }: Props) {
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
      if (onChanged) onChanged();
      else router.refresh();
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
        className="px-2 py-1 text-sm rounded-sm"
        style={{
          background: "#FFFFFF",
          border: "1px solid #b5b1a7",
          boxShadow: "inset 1px 1px 0 #e6e6e6",
        }}
      />
      <button
        type="submit"
        disabled={loading}
        className="px-3 py-1 text-sm rounded-sm disabled:opacity-60"
        style={{
          color: "#111",
          background: "linear-gradient(180deg, #f7f7f7 0%, #d9d9d9 100%)",
          border: "1px solid #6e6e6e",
          boxShadow: "0 1px 0 #ffffff inset, 0 -1px 0 #b4b4b4 inset",
        }}
      >
        追加
      </button>
      {msg && <span className="text-xs" style={{ color: '#333' }}>{msg}</span>}
    </form>
  );
}
