"use client";

import { useMemo, useState } from "react";
import BackButton from "@/components/BackButton";

type NewPostPayload = {
  name: string; // タイトル（posts.name）
  content: string; // 本文（posts.content）
  tags: string[]; // タグ名の配列（tags.name）。保存時に中間テーブル post_tag を作成
};

function parseTags(input: string): string[] {
  const parts = input
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter(Boolean);
  // ひとまず小文字で正規化＋重複排除（必要に応じて仕様変更可）
  return Array.from(new Set(parts.map((t) => t.toLowerCase())));
}

export default function NewPostPage() {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const tags = useMemo(() => parseTags(tagsInput), [tagsInput]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);

    const payload: NewPostPayload = { name, content, tags };

    try {
      setSubmitting(true);
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || "保存に失敗しました");
      }
      setMessage(`保存しました（ID: ${data.id}）`);
      // 入力リセット（必要に応じて遷移に変更可）
      setName("");
      setContent("");
      setTagsInput("");
    } catch (err: any) {
      console.error(err);
      setMessage(err?.message || "送信に失敗しました");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">新規投稿</h1>
        <BackButton />
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            タイトル
          </label>
          <input
            id="title"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="例: はじめての投稿"
            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-1">
            本文
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={10}
            placeholder="本文を入力"
            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium mb-1">
            タグ（カンマ or 空白区切り）
          </label>
          <input
            id="tags"
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="例: nextjs blog, mysql"
            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-700"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? "送信中..." : "保存"}
          </button>
          {message && <p className="text-sm text-gray-600">{message}</p>}
        </div>
      </form>

      <div className="text-xs text-gray-500">
        {/* 将来の実装メモ: MySQL(MAMP)の `posts`/`tags`/`post_tag` を使用。保存時は
        1) `posts` に `name`/`content` をINSERT、2) `tags` は存在確認の上INSERT、
        3) 中間 `post_tag` に対応IDをINSERT、一覧はJOINで取得します。 */}
      </div>
    </div>
  );
}
