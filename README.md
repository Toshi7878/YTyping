# 開発環境セットアップ手順

## Node.jsをインストール

<https://nodejs.org/ja/download/>

## pnpmをインストール

<https://pnpm.io/installation>

## 任意のフォルダでコマンドラインを開き、リポジトリをクローン

```bash
git clone https://github.com/ytyping/ytyping.git
```

## リポジトリをクローンしたフォルダに移動

```bash
cd ytyping
```

## 依存関係をインストール

```bash
pnpm install
```

## 環境変数ファイルを作成 (`.env` ファイルをプロジェクトのルートに作成)

```bash
cp .env.example .env
```

.envファイルの中身に以下の環境変数があることを確認

```code
NEXT_PUBLIC_SUPABASE_URL="http://localhost:54321"
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"

NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SECRET_KEY=""
```

## Docker Desktopをインストール

<https://docs.docker.com/desktop/#next-steps>

1. 上記URLのInstall Docker DesktopからDocker Desktop Installerをダウンロード

2. インストール完了後、Docker Desktopを起動

## ローカル環境に開発用のデータベースをセットアップ

```bash
pnpx supabase init
pnpm db:start
pnpm db:status
```

### `NEXT_PUBLIC_SUPABASE_ANON_KEY` と `SUPABASE_SECRET_KEY` を設定

pnpm db:status でコマンドラインに表示されたPublishable keyとSecret keyを .envファイルの `NEXT_PUBLIC_SUPABASE_ANON_KEY` と `SUPABASE_SECRET_KEY` に設定

```code
NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_<ランダムな文字列>"
SUPABASE_SECRET_KEY="sb_secret_<ランダムな文字列>"
```

### ローカル環境のデータベースにテーブルを構築 & 開発用のシードデータを挿入

```bash
pnpm db:migrate
pnpm db:seed
```

## 開発サーバーを起動

```bash
pnpm dev
```

サーバーを起動したら、ブラウザで `http://localhost:3000` にアクセス
YTypingの開発環境用ページが表示されます

## データベースのデータを確認

`pnpm db:start` 実行成功後、ブラウザで<http://127.0.0.1:54323/project/default/editor> を開くとデータベースのデータにアクセスできます。

譜面データやリプレイデータ(jsonファイル)は<http://127.0.0.1:54323/project/default/storage/buckets>を開くとアクセスできます。

## データベースのコマンド一覧

以下のコマンドを実行するには、Docker Desktopを起動している必要があります

`pnpm db:start`
データベースを起動

`pnpm db:stop`
データベースを停止

`pnpm db:migrate`
データベースにテーブルを構築

`pnpm db:seed`
データベースにシードデータを挿入

`pnpm db:reset`
データベースをリセット

`pnpm db:status`
データベースの状態を表示

`pnpm db:generate`
データベースのスキーマを生成

------------------------------------------------------------------------------------------------------------------

## 開発環境で譜面エディターの読み変換機能を利用

読み変換機能を使用するには、.env ファイルに`YAHOO_APP_ID`を設定する必要があります。
以下のURLでClient IDを発行後、.env ファイルのYAHOO_APP_IDに発行したClient IDを設定すると利用可能になります。
<https://developer.yahoo.co.jp/>

### アプリケーション設定

> Web APIを利用する場所
>
> ID連携利用有無: ID連携を利用する
>
> アプリケーションの種類: サーバーサイド（Yahoo! ID連携 v2）
>
> アプリケーションの利用者情報（契約者情報）
>
> 利用者情報: 個人
>
> メールアドレス: 設定済み
>
> 個人情報授受にかかる確認事項
>
> 個人情報提供先としてユーザーへ開示することに同意しますか？: 同意しない
>
> アプリケーションの基本情報
>
> アプリケーション名: YTyping
>
> サイトURL: <http://localhost:3000>

```code
YAHOO_APP_ID=<Client ID>
```

## 機能開発

### ブラウザ拡張機能・UserScript で実装可能な機能について

新機能を開発してプルリクエストを作成する際はまず、ブラウザ拡張機能やUserScriptでの実装ができないか検討していただけると助かります。

**理由**: 本体コードに機能を追加すると、コード量の増加によりメンテナンスコストが高くなります。ブラウザ拡張機能やUserScriptで実装できる機能をそちらで対応することで、本体のコードベースをシンプルに保ちながら、ユーザーが必要な機能を選択的に利用できる利点があります。

### 貢献方法

#### バグ修正・改善提案

1. [GitHub Issues](https://github.com/Toshi7878/YTyping/issues) で Issue を作成、または、実際に修正を行いプルリクエストを作成 → レビュー → マージ

#### 機能追加

1. GitHub Issues で機能提案を作成、または、実際に開発を行いプルリクエストを作成 → レビュー → マージ
