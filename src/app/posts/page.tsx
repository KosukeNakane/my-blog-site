import Link from "next/link";
import BackButton from "@/components/BackButton";

export default function PostsPage() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ブログ一覧</h1>
        <BackButton />
      </div>

      <div className="flex gap-3">
        <Link
          href="/posts/new"
          className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          新規投稿
        </Link>
        <Link
          href="/tags"
          className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300"
        >
          タグ検索
        </Link>
      </div>

      <div className="text-sm text-gray-600">
        ここに投稿一覧を表示し、各投稿に「編集・削除」ボタンを配置します。
      </div>
    </div>
  );
}
