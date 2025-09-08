import Link from "next/link";
import { getPool } from "@/lib/db";
import EditPostForm from "@/components/EditPostForm";
import BackButton from "@/components/BackButton";

type Props = { params: Promise<{ postId: string }> };

async function fetchPost(postId: number) {
  const pool = getPool();
  const [rows]: any = await pool.query(
    `SELECT p.id, p.name, p.content, p.created_at, p.updated_at, t.name AS tag_name
     FROM posts p
     LEFT JOIN post_tag pt ON pt.post_id = p.id
     LEFT JOIN tags t ON t.id = pt.tag_id
     WHERE p.id = ?`,
    [postId]
  );
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const base = rows[0];
  const tags = Array.from(new Set((rows as any[]).map((r) => r.tag_name).filter(Boolean)));
  return {
    id: Number(base.id),
    name: base.name as string,
    content: base.content as string,
    tags: tags as string[],
  };
}

export default async function EditPostPage({ params }: Props) {
  const { postId } = await params;
  const idNum = Number(postId);
  if (!Number.isFinite(idNum) || idNum <= 0) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-600">不正なIDです。</p>
      </div>
    );
  }

  const post = await fetchPost(idNum);
  if (!post) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">投稿編集</h1>
        <p className="text-sm text-gray-600">見つかりませんでした。</p>
        <Link href="/" className="text-blue-600 hover:underline text-sm">
          一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">投稿編集</h1>
        <BackButton />
      </div>

      <EditPostForm
        postId={post.id}
        initialName={post.name}
        initialContent={post.content}
        initialTags={post.tags}
      />
    </div>
  );
}
