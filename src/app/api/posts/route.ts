import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import { getPool } from "@/lib/db";

type Body = {
  name?: string;
  content?: string;
  tags?: string[] | string; // 文字列 or 配列どちらも許容
};

// 文字列/配列どちらの tags でも受け取れるように正規化
function normalizeTags(input: Body["tags"]): string[] {
  let tags: string[] = [];
  if (Array.isArray(input)) {
    tags = input;
  } else if (typeof input === "string") {
    tags = input.split(",");
  }
  return tags.map((t) => t.trim().toLowerCase()).filter(Boolean);
}

// Content-Type を見て JSON / FormData の両方に対応
async function readBody(
  req: NextRequest
): Promise<{ name: string; content: string; tags: string[] } | null> {
  const ctype = req.headers.get("content-type") || "";
  try {
    if (ctype.includes("application/json")) {
      const raw = (await req.json()) as Body;
      return {
        name: String(raw?.name ?? "").trim(),
        content: String(raw?.content ?? "").trim(),
        tags: normalizeTags(raw?.tags),
      };
    }
    if (ctype.includes("application/x-www-form-urlencoded") || ctype.includes("multipart/form-data")) {
      const fd = await req.formData();
      return {
        name: String(fd.get("name") ?? "").trim(),
        content: String(fd.get("content") ?? "").trim(),
        tags: normalizeTags(String(fd.get("tags") ?? "")),
      };
    }
    // ヘッダ不備時のフォールバック（テキスト→JSONパース）
    const text = await req.text();
    if (text) {
      const raw = JSON.parse(text) as Body;
      return {
        name: String(raw?.name ?? "").trim(),
        content: String(raw?.content ?? "").trim(),
        tags: normalizeTags(raw?.tags),
      };
    }
  } catch {
    return null; // 下で400を返す
  }
  return null;
}

export async function POST(req: NextRequest) {
  const parsed = await readBody(req);

  if (!parsed || !parsed.name || !parsed.content) {
    return NextResponse.json({ message: "不正なリクエストです" }, { status: 400 });
  }

  const { name, content, tags } = parsed;

  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // posts 追加
    const [postRes]: any = await conn.execute(
      "INSERT INTO posts (name, content) VALUES (?, ?)",
      [name, content]
    );
    const postId = Number(postRes.insertId);

    // tags 作成/取得 → post_tag 紐付け
    for (const tag of tags) {
      // 既存タグ検索
      const [rows]: any = await conn.execute(
        "SELECT id FROM tags WHERE name = ? LIMIT 1",
        [tag]
      );
      let tagId: number;
      if (Array.isArray(rows) && rows.length > 0) {
        tagId = Number(rows[0].id);
      } else {
        const [tagRes]: any = await conn.execute(
          "INSERT INTO tags (name) VALUES (?)",
          [tag]
        );
        tagId = Number(tagRes.insertId);
      }

      // 重複行を避けるために IGNORE
      await conn.execute(
        "INSERT IGNORE INTO post_tag (post_id, tag_id) VALUES (?, ?)",
        [postId, tagId]
      );
    }

    await conn.commit();
    return NextResponse.json({ id: postId, message: "created" }, { status: 201 });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    return NextResponse.json({ message: "保存に失敗しました" }, { status: 500 });
  } finally {
    conn.release();
  }
}

export async function GET() {
  try {
    const pool = getPool();
    const [rows]: any = await pool.query(
      `SELECT p.id, p.name, p.content, p.created_at, p.updated_at, t.name AS tag_name
       FROM posts p
       LEFT JOIN post_tag pt ON pt.post_id = p.id
       LEFT JOIN tags t ON t.id = pt.tag_id
       ORDER BY p.created_at DESC`
    );

    const map = new Map<number, any>();
    for (const r of rows as any[]) {
      const id = Number(r.id);
      if (!map.has(id)) {
        map.set(id, {
          id,
          name: r.name,
          content: r.content,
          created_at: r.created_at,
          updated_at: r.updated_at,
          tags: [] as string[],
        });
      }
      if (r.tag_name) {
        const post = map.get(id)!;
        if (!post.tags.includes(r.tag_name)) post.tags.push(r.tag_name);
      }
    }

    const list = Array.from(map.values());
    return NextResponse.json({ posts: list });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "取得に失敗しました" }, { status: 500 });
  }
}
