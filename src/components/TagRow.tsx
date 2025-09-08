"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  id: number;
  name: string;
  postCount: number;
};

export default function TagRow({ id, name, postCount }: Props) {
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
      router.refresh();
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
      router.refresh();
    } catch (e: any) {
      alert(e?.message || "削除に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <li className="flex items-center justify-between border-b border-gray-200 py-2">
      <div className="flex items-center gap-3">
        <span className="inline-block min-w-6 text-right text-xs text-gray-500">
          {postCount}
        </span>
        {editing ? (
          <input
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="rounded border border-gray-300 px-2 py-1"
          />
        ) : (
          <span className="font-medium">{name}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Link
          href={`/posts/tags/${id}`}
          className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm"
        >
          一覧
        </Link>
        {editing ? (
          <>
            <button
              onClick={save}
              disabled={loading}
              className="px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm disabled:opacity-60"
            >
              保存
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm"
            >
              キャンセル
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setEditing(true)}
              className="px-2 py-1 rounded bg-gray-700 text-white hover:bg-gray-800 text-sm"
            >
              変更
            </button>
            <button
              onClick={remove}
              disabled={loading}
              className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 text-sm disabled:opacity-60"
            >
              削除
            </button>
          </>
        )}
      </div>
    </li>
  );
}

