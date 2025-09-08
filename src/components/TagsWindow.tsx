"use client";

import { useCallback, useEffect, useState } from "react";
import AddTagForm from "@/components/AddTagForm";
import TagRow from "@/components/TagRow";

type Tag = { id: number; name: string; postCount: number };

type Props = { onOpenList?: (id: number, name: string) => void };

export default function TagsWindow({ onOpenList }: Props) {
  const [tags, setTags] = useState<Tag[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/tags");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "取得に失敗しました");
      setTags(data.tags as Tag[]);
    } catch (e: any) {
      setError(e?.message || "取得に失敗しました");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (error) return <div className="text-sm" style={{ color: "#b91c1c" }}>{error}</div>;
  if (!tags) return <div className="text-sm" style={{ color: "#333" }}>読み込み中...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-medium mb-2">タグ追加</h2>
        <AddTagForm onChanged={load} />
      </div>
      <div>
        <h2 className="text-sm font-medium mb-2">タグ一覧</h2>
        {tags.length === 0 ? (
          <p className="text-sm" style={{ color: "#333" }}>タグがありません。</p>
        ) : (
          <ul className="divide-y divide-gray-200 border border-gray-200 rounded bg-white">
            {tags.map((t) => (
              <TagRow key={t.id} id={t.id} name={t.name} postCount={t.postCount} onChanged={load} onOpenList={onOpenList} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
