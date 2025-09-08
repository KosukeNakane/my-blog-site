import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
export const runtime = "nodejs";

export async function GET() {
  try {
    const pool = getPool();
    const [rows]: any = await pool.query(
      `SELECT t.id, t.name, COUNT(pt.post_id) AS post_count
       FROM tags t
       LEFT JOIN post_tag pt ON pt.tag_id = t.id
       GROUP BY t.id, t.name
       ORDER BY t.name ASC`
    );
    const tags = (rows as any[]).map((r) => ({
      id: Number(r.id),
      name: r.name as string,
      postCount: Number(r.post_count ?? 0),
    }));
    return NextResponse.json({ tags });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "取得に失敗しました" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "不正なボディです" }, { status: 400 });
  }
  const name = String(body?.name ?? "").trim().toLowerCase();
  if (!name) {
    return NextResponse.json({ message: "name は必須です" }, { status: 400 });
  }

  const pool = getPool();
  try {
    // 既存チェック
    const [rows]: any = await pool.execute(
      "SELECT id FROM tags WHERE name = ? LIMIT 1",
      [name]
    );
    if (Array.isArray(rows) && rows.length > 0) {
      return NextResponse.json(
        { id: Number(rows[0].id), message: "exists" },
        { status: 200 }
      );
    }
    const [res]: any = await pool.execute(
      "INSERT INTO tags (name) VALUES (?)",
      [name]
    );
    return NextResponse.json({ id: Number(res.insertId), message: "created" }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "作成に失敗しました" }, { status: 500 });
  }
}

