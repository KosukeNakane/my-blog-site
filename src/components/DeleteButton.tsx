"use client";

import { useRouter } from "next/navigation";

type Props = {
  postId: number;
};

export default function DeleteButton({ postId }: Props) {
  const router = useRouter();

  async function onDelete() {
    const ok = window.confirm("この投稿を削除しますか？");
    if (!ok) return;
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "削除に失敗しました");
      }
      router.refresh();
    } catch (e: any) {
      alert(e?.message || "削除に失敗しました");
    }
  }

  return (
    <button
      onClick={onDelete}
      className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
    >
      削除
    </button>
  );
}

