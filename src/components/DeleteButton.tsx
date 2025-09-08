"use client";

import { useRouter } from "next/navigation";

type Props = {
  postId: number;
  onDone?: () => void;
};

export default function DeleteButton({ postId, onDone }: Props) {
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
      if (onDone) onDone();
      else router.refresh();
    } catch (e: any) {
      alert(e?.message || "削除に失敗しました");
    }
  }

  return (
    <button
      onClick={onDelete}
      className="px-2 py-1 text-sm rounded-sm"
      style={{
        color: "#111",
        background: "linear-gradient(180deg, #f7f7f7 0%, #d9d9d9 100%)",
        border: "1px solid #6e6e6e",
        boxShadow: "0 1px 0 #ffffff inset, 0 -1px 0 #b4b4b4 inset",
      }}
    >
      削除
    </button>
  );
}
