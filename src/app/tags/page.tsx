export default function TagsPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">タグ管理</h1>
      <ul className="list-disc pl-6 text-sm text-gray-700">
        <li>タグ追加</li>
        <li>タグ名編集</li>
        <li>タグ削除</li>
      </ul>
      <p className="text-sm text-gray-600">
        ここにタグの一覧・追加/編集/削除用のUIを実装します。
      </p>
    </div>
  );
}

