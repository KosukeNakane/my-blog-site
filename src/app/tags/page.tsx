import { getPool } from "@/lib/db";
import AddTagForm from "@/components/AddTagForm";
import TagRow from "@/components/TagRow";
import BackButton from "@/components/BackButton";
import XpPage from "@/components/xp/XpPage";

type Tag = { id: number; name: string; postCount: number };

async function fetchTags(): Promise<Tag[]> {
  const pool = getPool();
  const [rows]: any = await pool.query(
    `SELECT t.id, t.name, COUNT(pt.post_id) AS post_count
     FROM tags t
     LEFT JOIN post_tag pt ON pt.tag_id = t.id
     GROUP BY t.id, t.name
     ORDER BY t.name`
  );
  return (rows as any[]).map((r) => ({
    id: Number(r.id),
    name: r.name as string,
    postCount: Number(r.post_count ?? 0),
  }));
}

export default async function TagsPage() {
  const tags = await fetchTags();
  return (
    <XpPage title="タグ管理">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold">タグ管理</h1>
        <BackButton />
      </div>
      <div className="space-y-6">
        <div>
          <h2 className="text-sm font-medium mb-2">タグ追加</h2>
          <AddTagForm />
        </div>
        <div>
          <h2 className="text-sm font-medium mb-2">タグ一覧</h2>
          {tags.length === 0 ? (
            <p className="text-sm" style={{ color: '#333' }}>タグがありません。</p>
          ) : (
            <ul className="divide-y divide-gray-200 border border-gray-200 rounded">
              {tags.map((t) => (
                <TagRow key={t.id} id={t.id} name={t.name} postCount={t.postCount} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </XpPage>
  );
}
