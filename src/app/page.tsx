import Link from "next/link";
import DeleteButton from "@/components/DeleteButton";
import { getPool } from "@/lib/db";

type Post = {
  id: number;
  name: string;
  content: string;
  created_at: string | Date;
  updated_at: string | Date;
  tags: string[];
};

async function fetchPosts(): Promise<Post[]> {
  const pool = getPool();
  const [rows]: any = await pool.query(
    `SELECT p.id, p.name, p.content, p.created_at, p.updated_at, t.name AS tag_name
     FROM posts p
     LEFT JOIN post_tag pt ON pt.post_id = p.id
     LEFT JOIN tags t ON t.id = pt.tag_id
     ORDER BY p.created_at DESC`
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
  return Array.from(map.values());
}

export default async function HomePage() {
  const posts = await fetchPosts();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ブログ一覧</h1>
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
      </div>

      {posts.length === 0 ? (
        <p className="text-sm text-gray-600">まだ投稿がありません。</p>
      ) : (
        <ul className="space-y-4">
          {posts.map((p) => (
            <li key={p.id} className="rounded border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold">{p.name}</h2>
                  <div className="text-xs text-gray-500">
                    {new Date(p.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link
                    href={`/posts/${p.id}/edit`}
                    className="px-2 py-1 rounded bg-gray-700 text-white hover:bg-gray-800"
                  >
                    編集
                  </Link>
                  <DeleteButton postId={p.id} />
                </div>
              </div>
              {p.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-700"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <p className="mt-3 text-sm text-gray-800 whitespace-pre-wrap">
                {p.content.length > 200 ? p.content.slice(0, 200) + "..." : p.content}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
