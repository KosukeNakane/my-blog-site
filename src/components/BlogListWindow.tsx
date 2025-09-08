"use client";

import DeleteButton from "@/components/DeleteButton";

export type PostItem = {
  id: number;
  name: string;
  content: string;
  created_at: string | Date;
  updated_at: string | Date;
  tags: string[];
};

type Props = {
  posts: PostItem[];
  onOpenNewPost: () => void;
  onOpenTags: () => void;
  onOpenEdit: (id: number) => void;
  onRefresh?: () => void;
};

import { useEffect, useState } from "react";

export default function BlogListWindow({ posts, onOpenNewPost, onOpenTags, onOpenEdit, onRefresh }: Props) {
  const [items, setItems] = useState(posts);
  const [reloading, setReloading] = useState(false);
  useEffect(() => setItems(posts), [posts]);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              if (!onRefresh) return;
              try {
                setReloading(true);
                await onRefresh();
              } finally {
                setReloading(false);
              }
            }}
            className="px-2 py-1 text-sm rounded-sm disabled:opacity-60"
            disabled={reloading}
            style={{
              color: "#111",
              background: "linear-gradient(180deg, #f7f7f7 0%, #d9d9d9 100%)",
              border: "1px solid #6e6e6e",
              boxShadow: "0 1px 0 #ffffff inset, 0 -1px 0 #b4b4b4 inset",
            }}
            title="最新状態に更新"
          >
            {reloading ? "更新中..." : "更新"}
          </button>
          <div className="text-sm" style={{ color: "#111" }}>ブログ投稿一覧</div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onOpenNewPost}
            className="px-2 py-1 text-sm rounded-sm"
            style={{
              color: "#111",
              background: "linear-gradient(180deg, #f7f7f7 0%, #d9d9d9 100%)",
              border: "1px solid #6e6e6e",
              boxShadow: "0 1px 0 #ffffff inset, 0 -1px 0 #b4b4b4 inset",
            }}
          >
            新規投稿
          </button>
          <button
            onClick={onOpenTags}
            className="px-2 py-1 text-sm rounded-sm"
            style={{
              color: "#111",
              background: "linear-gradient(180deg, #f7f7f7 0%, #d9d9d9 100%)",
              border: "1px solid #6e6e6e",
              boxShadow: "0 1px 0 #ffffff inset, 0 -1px 0 #b4b4b4 inset",
            }}
          >
            タグ管理
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-sm" style={{ color: "#333" }}>まだ投稿がありません。</p>
      ) : (
        <ul className="space-y-4">
          {items.map((p) => (
            <li key={p.id} className="rounded border border-gray-200 p-3 bg-white/70">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-base font-semibold">{p.name}</h2>
                  <div className="text-xs" style={{ color: "#333" }}>
                    {new Date(p.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => onOpenEdit(p.id)}
                    className="px-2 py-1 text-sm rounded-sm"
                    style={{
                      color: "#111",
                      background: "linear-gradient(180deg, #f7f7f7 0%, #d9d9d9 100%)",
                      border: "1px solid #6e6e6e",
                      boxShadow: "0 1px 0 #ffffff inset, 0 -1px 0 #b4b4b4 inset",
                    }}
                  >
                    編集
                  </button>
                  <DeleteButton postId={p.id} onDone={() => setItems((arr) => arr.filter((it) => it.id !== p.id))} />
                </div>
              </div>
              {p.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center px-2 py-0.5 text-[11px]"
                      style={{ color: "#111", background: "#fff", border: "1px solid #b5b1a7", boxShadow: "inset 1px 1px 0 #e6e6e6" }}
                    >
                      {t}
                    </span>
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
