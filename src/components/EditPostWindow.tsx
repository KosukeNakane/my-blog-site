"use client";

import { useEffect, useState } from "react";
import EditPostForm from "@/components/EditPostForm";

type Post = {
  id: number;
  name: string;
  content: string;
  tags: string[];
};

export default function EditPostWindow({ postId }: { postId: number }) {
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setError(null);
        const res = await fetch(`/api/posts/${postId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "取得に失敗しました");
        if (!ignore) setPost({ id: data.id, name: data.name, content: data.content, tags: data.tags || [] });
      } catch (e: any) {
        if (!ignore) setError(e?.message || "読み込みに失敗しました");
      }
    })();
    return () => { ignore = true; };
  }, [postId]);

  if (error) return <div className="text-sm" style={{ color: "#b91c1c" }}>{error}</div>;
  if (!post) return <div className="text-sm" style={{ color: "#333" }}>読み込み中...</div>;

  return (
    <EditPostForm
      postId={post.id}
      initialName={post.name}
      initialContent={post.content}
      initialTags={post.tags}
    />
  );
}
