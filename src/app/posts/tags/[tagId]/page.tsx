type Props = {
  params: { tagId: string };
};

export default function PostsByTagPage({ params }: Props) {
  const { tagId } = params;
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">タグ別一覧</h1>
      <p className="text-sm text-gray-600">対象タグID: {tagId}</p>
      <p className="text-sm text-gray-600">
        ここに指定タグで絞り込んだ投稿一覧を表示します。
      </p>
    </div>
  );
}

