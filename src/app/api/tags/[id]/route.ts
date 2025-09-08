import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
export const runtime = "nodejs";

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
  const name = String(body?.name ?? "").trim().toLowerCase();
  if (!name) {
    return NextResponse.json({ message: "name は必須です" }, { status: 400 });
  }
  try {
    const pool = getPool();
    const [res]: any = await pool.execute(
      "UPDATE tags SET name = ? WHERE id = ?",
      [name, idNum]
    );
    if (res.affectedRows === 0) {
      return NextResponse.json({ message: "見つかりませんでした" }, { status: 404 });
    }
    return NextResponse.json({ id: idNum, message: "updated" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "更新に失敗しました" }, { status: 500 });
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
  try {
    const pool = getPool();
    const [res]: any = await pool.execute("DELETE FROM tags WHERE id = ?", [idNum]);
    if (res.affectedRows === 0) {
      return NextResponse.json({ message: "見つかりませんでした" }, { status: 404 });
    }
    // post_tag はFKの ON DELETE CASCADE で自動削除
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "削除に失敗しました" }, { status: 500 });
  }
}

