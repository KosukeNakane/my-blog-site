import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
export const runtime = "nodejs";

function normalizeTags(input: string | string[] | undefined): string[] {
  let arr: string[] = [];
  if (Array.isArray(input)) arr = input;
  else if (typeof input === "string") arr = input.split(/[\s,]+/);
  return arr.map((t) => t.trim().toLowerCase()).filter(Boolean);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const idNum = Number(params.id);
  if (!Number.isFinite(idNum) || idNum <= 0) {
    return NextResponse.json({ message: "不正なIDです" }, { status: 400 });
  }
  try {
    const pool = getPool();
    const [rows]: any = await pool.query(
      `SELECT p.id, p.name, p.content, p.created_at, p.updated_at, t.name AS tag_name
       FROM posts p
       LEFT JOIN post_tag pt ON pt.post_id = p.id
       LEFT JOIN tags t ON t.id = pt.tag_id
       WHERE p.id = ?`,
      [idNum]
    );
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ message: "見つかりませんでした" }, { status: 404 });
    }
    const base = rows[0];
    const tags = Array.from(
      new Set((rows as any[]).map((r) => r.tag_name).filter(Boolean))
    );
    return NextResponse.json({
      id: Number(base.id),
      name: base.name,
      content: base.content,
      created_at: base.created_at,
      updated_at: base.updated_at,
      tags,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "取得に失敗しました" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const idNum = Number(params.id);
  if (!Number.isFinite(idNum) || idNum <= 0) {
    return NextResponse.json({ message: "不正なIDです" }, { status: 400 });
  }
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "不正なボディです" }, { status: 400 });
  }
  const name = String(body?.name ?? "").trim();
  const content = String(body?.content ?? "").trim();
  const tags = normalizeTags(body?.tags);
  if (!name || !content) {
    return NextResponse.json({ message: "name と content は必須です" }, { status: 400 });
  }

  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [res]: any = await conn.execute(
      "UPDATE posts SET name = ?, content = ? WHERE id = ?",
      [name, content, idNum]
    );
    if (res.affectedRows === 0) {
      await conn.rollback();
      return NextResponse.json({ message: "見つかりませんでした" }, { status: 404 });
    }

    // tags を再構成: 既存リンク削除 → 必要タグ作成 → 新規リンク
    await conn.execute("DELETE FROM post_tag WHERE post_id = ?", [idNum]);
    for (const tag of tags) {
      const [rows]: any = await conn.execute(
        "SELECT id FROM tags WHERE name = ? LIMIT 1",
        [tag]
      );
      let tagId: number;
      if (Array.isArray(rows) && rows.length > 0) {
        tagId = Number(rows[0].id);
      } else {
        const [ins]: any = await conn.execute(
          "INSERT INTO tags (name) VALUES (?)",
          [tag]
        );
        tagId = Number(ins.insertId);
      }
      await conn.execute(
        "INSERT IGNORE INTO post_tag (post_id, tag_id) VALUES (?, ?)",
        [idNum, tagId]
      );
    }

    await conn.commit();
    return NextResponse.json({ id: idNum, message: "updated" });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    return NextResponse.json({ message: "更新に失敗しました" }, { status: 500 });
  } finally {
    conn.release();
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const idNum = Number(params.id);
  if (!Number.isFinite(idNum) || idNum <= 0) {
    return NextResponse.json({ message: "不正なIDです" }, { status: 400 });
  }

  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [res]: any = await conn.execute(
      "DELETE FROM posts WHERE id = ?",
      [idNum]
    );
    await conn.commit();

    if (res.affectedRows === 0) {
      return NextResponse.json({ message: "見つかりませんでした" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    return NextResponse.json({ message: "削除に失敗しました" }, { status: 500 });
  } finally {
    conn.release();
  }
}
