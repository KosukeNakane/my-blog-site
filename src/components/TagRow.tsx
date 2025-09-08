"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  id: number;
  name: string;
  postCount: number;
  onChanged?: () => void;
  onOpenList?: (id: number, name: string) => void;
};

export default function TagRow({ id, name, postCount, onChanged, onOpenList }: Props) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(name);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function save() {
    const n = val.trim();
    if (!n) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/tags/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: n }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "更新に失敗しました");
      }
      setEditing(false);
      if (onChanged) onChanged();
      else router.refresh();
    } catch (e: any) {
      alert(e?.message || "更新に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    const ok = window.confirm(`タグ「${name}」を削除しますか？`);
    if (!ok) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/tags/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "削除に失敗しました");
      }
      if (onChanged) onChanged();
      else router.refresh();
    } catch (e: any) {
      alert(e?.message || "削除に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <li className="flex items-center justify-between border-b border-gray-300 py-2">
      <div className="flex items-center gap-3">
        <span className="inline-block min-w-6 text-right text-xs" style={{ color: "#333" }}>
          {postCount}
        </span>
        {editing ? (
          <input
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="px-2 py-1 text-sm rounded-sm"
            style={{ background: "#FFFFFF", border: "1px solid #b5b1a7", boxShadow: "inset 1px 1px 0 #e6e6e6" }}
          />
        ) : (
          <span className="font-medium">{name}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {onOpenList ? (
          <button
            onClick={() => onOpenList(id, name)}
            className="px-2 py-1 text-sm rounded-sm"
            style={{ color: "#111", background: "linear-gradient(180deg, #f7f7f7 0%, #d9d9d9 100%)", border: "1px solid #6e6e6e", boxShadow: "0 1px 0 #ffffff inset, 0 -1px 0 #b4b4b4 inset" }}
          >
            一覧
          </button>
        ) : (
          <Link href={`/posts/tags/${id}`} className="px-2 py-1 text-sm rounded-sm" style={{ color: "#111", background: "linear-gradient(180deg, #f7f7f7 0%, #d9d9d9 100%)", border: "1px solid #6e6e6e", boxShadow: "0 1px 0 #ffffff inset, 0 -1px 0 #b4b4b4 inset" }}>一覧</Link>
        )}
        {editing ? (
          <>
            <button onClick={save} disabled={loading} className="px-2 py-1 text-sm rounded-sm disabled:opacity-60" style={{ color: "#111", background: "linear-gradient(180deg, #f7f7f7 0%, #d9d9d9 100%)", border: "1px solid #6e6e6e", boxShadow: "0 1px 0 #ffffff inset, 0 -1px 0 #b4b4b4 inset" }}>保存</button>
            <button onClick={() => setEditing(false)} className="px-2 py-1 text-sm rounded-sm" style={{ color: "#111", background: "linear-gradient(180deg, #f7f7f7 0%, #d9d9d9 100%)", border: "1px solid #6e6e6e", boxShadow: "0 1px 0 #ffffff inset, 0 -1px 0 #b4b4b4 inset" }}>キャンセル</button>
          </>
        ) : (
          <>
            <button onClick={() => setEditing(true)} className="px-2 py-1 text-sm rounded-sm" style={{ color: "#111", background: "linear-gradient(180deg, #f7f7f7 0%, #d9d9d9 100%)", border: "1px solid #6e6e6e", boxShadow: "0 1px 0 #ffffff inset, 0 -1px 0 #b4b4b4 inset" }}>変更</button>
            <button onClick={remove} disabled={loading} className="px-2 py-1 text-sm rounded-sm disabled:opacity-60" style={{ color: "#111", background: "linear-gradient(180deg, #f7f7f7 0%, #d9d9d9 100%)", border: "1px solid #6e6e6e", boxShadow: "0 1px 0 #ffffff inset, 0 -1px 0 #b4b4b4 inset" }}>削除</button>
          </>
        )}
      </div>
    </li>
  );
}
