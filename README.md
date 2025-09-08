## プロジェクト概要

Next.js 15（App Router）+ TypeScript のブログアプリです。DB は MySQL（`mysql2` クライアント）を使用し、`posts` / `tags` / `post_tag` の3テーブルで記事とタグを管理します。UI はホームページで Windows XP 風デスクトップを再現し、ウインドウ内で「新規投稿」「編集」「タグ管理」「タグ別一覧」などの画面を開きます。

<img width="1898" height="990" alt="スクリーンショット 2025-09-08 22 25 12" src="https://github.com/user-attachments/assets/d145e2a3-10db-43d6-9827-153ee336fb7e" />

## 前提
- Node.js 18 以上（推奨: 20+）
- pnpm 10 以上（npm/yarn でも可）
- MySQL 5.7+ or 8.x（ローカル MAMP でも可）

## セットアップ手順
1) 依存関係のインストール

```bash
pnpm install
```

2) 環境変数 `.env.local` を作成（`.env.local.example` をコピー）

```bash
cp .env.local.example .env.local
```

3) `.env.local` を自分の環境に合わせて編集

補足: `.gitignore` で `.env*` はコミット対象外ですが、テンプレートの `.env.local.example` は除外解除しているため、リポジトリに含まれます（第三者はそこからコピー可能）。

例（MAMP のデフォルト設定）:

```
DB_HOST=127.0.0.1
DB_PORT=8889
DB_USER=root
DB_PASSWORD=root
DB_NAME=my-blog-site
```

例（一般的なローカル MySQL）:

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=my_blog
```

4) データベースとテーブルを作成（下記「データベースの作り方」参照）

5) 開発サーバ起動（環境変数を変更した場合は起動し直してください）

```bash
pnpm dev
# http://localhost:3000
```

## データベースの作り方（MySQL）

1) データベース（スキーマ）作成

```sql
CREATE DATABASE IF NOT EXISTS `my-blog-site` DEFAULT CHARACTER SET utf8mb4;
```

2) 使用する DB を選択

```sql
USE `my-blog-site`;
```

3) テーブル作成

```sql
-- posts: 記事本体
CREATE TABLE IF NOT EXISTS posts (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- tags: タグ
CREATE TABLE IF NOT EXISTS tags (
  id   BIGINT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- post_tag: 記事とタグの中間
CREATE TABLE IF NOT EXISTS post_tag (
  id      INT NOT NULL AUTO_INCREMENT,
  post_id BIGINT NOT NULL,
  tag_id  BIGINT NOT NULL,
  PRIMARY KEY (id),
  KEY idx_post_id (post_id),
  KEY idx_tag_id  (tag_id),
  CONSTRAINT fk_post_tag_post
    FOREIGN KEY (post_id) REFERENCES posts(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_post_tag_tag
    FOREIGN KEY (tag_id) REFERENCES tags(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- （任意・推奨）post_id と tag_id の重複を物理的に防ぐ
-- ALTER TABLE post_tag ADD UNIQUE KEY uniq_post_tag (post_id, tag_id);
```

4) 動作確認

```sql
USE `my-blog-site`;
SHOW TABLES;            -- posts, tags, post_tag が表示されること
DESCRIBE posts;         -- name, content, created_at, updated_at など
```

## API の簡易確認（任意）

開発サーバ起動中に以下を実行して 201 が返ることを確認（新規投稿）。

```bash
curl -i -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"name":"test","content":"hello","tags":"web, next"}'
```

## 実装メモ（接続とランタイム）

- DB 接続は `mysql2/promise` を使用し、`src/lib/db.ts` でプール（コネクションプーリング）を構築しています。開発時の HMR でも 1 つのプールを再利用する実装です。
- API ルートは Node ランタイムで実行（`export const runtime = "nodejs"`）し、Edge で実行されないようにしています。
- 環境変数は Next.js が `.env.local` を自動で読み込みます。値を変更したら開発サーバを再起動してください。

## よくあるエラーと対処

- 500（Internal Server Error）で保存できない
  - `.env.local` の DB 接続情報が正しいか確認（特に MAMP: port=8889, user=root, pass=root）。
  - MySQL が起動しているか、DB/テーブルが存在するか（上記 SQL を再確認）。
- `不正なリクエストです` や 400
  - `name` と `content` は必須です。`tags` は文字列（カンマ/空白区切り）または配列のどちらでも可。

## 起動・ビルド

開発:

```bash
pnpm dev
```

本番ビルド:

```bash
pnpm build
pnpm start
```

---

何か詰まった場合は、開発サーバのコンソールログ（`pnpm dev` 実行ターミナル）とブラウザの開発者ツールのエラーメッセージをご共有ください。
