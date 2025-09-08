"use client";

import { useEffect, useState } from "react";
import DeleteButton from "@/components/DeleteButton";

type Post = {
  id: number;
  name: string;
  content: string;
  created_at: string | Date;
  updated_at: string | Date;
  tags: string[];
};

export default function PostsByTagWindow({ tagId }: { tagId: number }) {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [tagName, setTagName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setError(null);
        const res = await fetch(`/api/posts?tagId=${tagId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "取得に失敗しました");
        if (!ignore) {
          setPosts(data.posts as Post[]);
          if (data.tagName) setTagName(String(data.tagName));
        }
      } catch (e: any) {
        if (!ignore) setError(e?.message || "取得に失敗しました");
      }
    })();
    return () => { ignore = true; };
  }, [tagId]);

  if (error) return <div className="text-sm" style={{ color: "#b91c1c" }}>{error}</div>;
  if (!posts) return <div className="text-sm" style={{ color: "#333" }}>読み込み中...</div>;

  return (
    <div className="space-y-4">
      <div className="text-sm" style={{ color: "#111" }}>タグ: {tagName || `#${tagId}`}</div>
      {posts.length === 0 ? (
        <p className="text-sm" style={{ color: "#333" }}>このタグの投稿はありません。</p>
      ) : (
        <ul className="space-y-4">
          {posts.map((p) => (
            <li key={p.id} className="rounded border border-gray-200 p-3 bg-white/70">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-base font-semibold">{p.name}</h2>
                  <div className="text-xs" style={{ color: "#333" }}>{new Date(p.created_at).toLocaleString()}</div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {/* 編集はホームのブログ一覧から開く仕様のまま。拡張可 */}
                  <DeleteButton postId={p.id} onDone={() => setPosts((arr) => (arr || []).filter((it) => it.id !== p.id))} />
                </div>
              </div>
              {p.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <span key={t} className="inline-flex items-center px-2 py-0.5 text-[11px]" style={{ color: "#111", background: "#fff", border: "1px solid #b5b1a7", boxShadow: "inset 1px 1px 0 #e6e6e6" }}>{t}</span>
                  ))}
                </div>
              )}
              <p className="mt-2 text-sm whitespace-pre-wrap" style={{ color: "#111" }}>
                {p.content.length > 200 ? p.content.slice(0, 200) + "..." : p.content}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

