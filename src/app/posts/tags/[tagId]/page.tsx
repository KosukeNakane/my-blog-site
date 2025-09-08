import Link from "next/link";
import DeleteButton from "@/components/DeleteButton";
import { getPool } from "@/lib/db";
import BackButton from "@/components/BackButton";
import XpPage from "@/components/xp/XpPage";

type Props = { params: Promise<{ tagId: string }> };

type Post = {
  id: number;
  name: string;
  content: string;
  created_at: string | Date;
  updated_at: string | Date;
  tags: string[];
};

async function fetchByTag(tagId: number): Promise<{ tagName: string; posts: Post[] } | null> {
  const pool = getPool();
  // まずタグ名
  const [tagRows]: any = await pool.query("SELECT name FROM tags WHERE id = ?", [tagId]);
  if (!Array.isArray(tagRows) || tagRows.length === 0) return null;
  const tagName = String(tagRows[0].name);

  // タグに紐づく投稿 + その投稿の全タグ
  const [rows]: any = await pool.query(
    `SELECT p.id, p.name, p.content, p.created_at, p.updated_at, t2.name AS tag_name
     FROM posts p
     JOIN post_tag pt_filter ON pt_filter.post_id = p.id AND pt_filter.tag_id = ?
     LEFT JOIN post_tag pt2 ON pt2.post_id = p.id
     LEFT JOIN tags t2 ON t2.id = pt2.tag_id
     ORDER BY p.created_at DESC`,
    [tagId]
  );

  const map = new Map<number, Post>();
  for (const r of rows as any[]) {
    const id = Number(r.id);
    if (!map.has(id)) {
      map.set(id, {
        id,
        name: r.name,
        content: r.content,
        created_at: r.created_at,
        updated_at: r.updated_at,
        tags: [],
      });
    }
    if (r.tag_name) {
      const post = map.get(id)!;
      if (!post.tags.includes(r.tag_name)) post.tags.push(r.tag_name);
    }
  }

  return { tagName, posts: Array.from(map.values()) };
}

export default async function PostsByTagPage({ params }: Props) {
  const { tagId } = await params;
  const idNum = Number(tagId);
  if (!Number.isFinite(idNum) || idNum <= 0) {
    return (
      <XpPage title="タグ別一覧">
        <p className="text-sm text-red-600">不正なタグIDです。</p>
      </XpPage>
    );
  }
  const data = await fetchByTag(idNum);
  if (!data) {
    return (
      <XpPage title="タグ別一覧">
        <div className="space-y-3">
          <h1 className="text-lg font-bold">タグ別一覧</h1>
          <p className="text-sm" style={{ color: '#333' }}>タグが見つかりませんでした。</p>
          <Link href="/tags" className="text-blue-600 hover:underline text-sm">タグ管理へ戻る</Link>
        </div>
      </XpPage>
    );
  }

  const { tagName, posts } = data;
  return (
    <XpPage title={`タグ: ${tagName}`}>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold">タグ: {tagName}</h1>
        <BackButton />
      </div>

      {posts.length === 0 ? (
        <p className="text-sm" style={{ color: '#333' }}>このタグの投稿はありません。</p>
      ) : (
        <ul className="space-y-4">
          {posts.map((p) => (
            <li key={p.id} className="rounded border border-gray-200 p-4 bg-white">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold">{p.name}</h2>
                  <div className="text-xs" style={{ color: "#333" }}>{new Date(p.created_at).toLocaleString()}</div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link href={`/posts/${p.id}/edit`} className="px-2 py-1 text-sm rounded-sm" style={{ color: "#111", background: "linear-gradient(180deg, #f7f7f7 0%, #d9d9d9 100%)", border: "1px solid #6e6e6e", boxShadow: "0 1px 0 #ffffff inset, 0 -1px 0 #b4b4b4 inset" }}>編集</Link>
                  <DeleteButton postId={p.id} />
                </div>
              </div>
              {p.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <span key={t} className="inline-flex items-center rounded-full bg-gray-200 px-2 py-1 text-xs" style={{ color: '#111' }}>{t}</span>
                  ))}
                </div>
              )}
              <p className="mt-3 text-sm whitespace-pre-wrap" style={{ color: '#111' }}>
                {p.content.length > 200 ? p.content.slice(0, 200) + "..." : p.content}
              </p>
            </li>
          ))}
        </ul>
      )}
    </XpPage>
  );
}
