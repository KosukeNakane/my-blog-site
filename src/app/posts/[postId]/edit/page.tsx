type Props = {
  params: { postId: string };
};

export default function EditPostPage({ params }: Props) {
  const { postId } = params;
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">投稿編集</h1>
      <p className="text-sm text-gray-600">編集対象ID: {postId}</p>
      <p className="text-sm text-gray-600">
        ここに既存データを読み込んでフォームを表示・更新処理を実装します。
      </p>
    </div>
  );
}

