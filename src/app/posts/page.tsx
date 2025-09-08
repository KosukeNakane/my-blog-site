import Link from "next/link";
import BackButton from "@/components/BackButton";
import XpPage from "@/components/xp/XpPage";

export default function PostsPage() {
  return (
    <XpPage title="ブログ一覧">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <Link href="/posts/new" className="px-3 py-1 text-sm rounded-sm" style={{ color: "#111", background: "linear-gradient(180deg, #f7f7f7 0%, #d9d9d9 100%)", border: "1px solid #6e6e6e", boxShadow: "0 1px 0 #ffffff inset, 0 -1px 0 #b4b4b4 inset" }}>
            新規投稿
          </Link>
          <Link href="/tags" className="px-3 py-1 text-sm rounded-sm" style={{ color: "#111", background: "linear-gradient(180deg, #f7f7f7 0%, #d9d9d9 100%)", border: "1px solid #6e6e6e", boxShadow: "0 1px 0 #ffffff inset, 0 -1px 0 #b4b4b4 inset" }}>
            タグ検索
          </Link>
        </div>
        <BackButton />
      </div>
      <div className="text-sm" style={{ color: '#333' }}>ここに投稿一覧を表示し、各投稿に「編集・削除」ボタンを配置します。</div>
    </XpPage>
  );
}
