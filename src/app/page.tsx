import { getPool } from "@/lib/db";
import XpDesktop from "@/components/xp/XpDesktop";
import type { PostItem as Post } from "@/components/BlogListWindow";

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
  return <XpDesktop blogPosts={posts} />;
}
