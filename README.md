# MoneyForward 経費計算アプリケーション

MoneyForwardの家計簿のCSVを入力すると、項目ごとに経費にするものと無視するものの仕分けをして、パートナーと設定した割合で支払い負担を分配するアプリケーションです。

## プロジェクト概要

このプロジェクトは以下の2つの部分から構成されています：

1. **Webアプリケーション**: CSVファイルをアップロードして経費計算を行うWebアプリ
2. **Chrome拡張機能**: MoneyForwardの家計簿ページを開くと自動的に経費計算を行う拡張機能

## Webアプリケーション

Webアプリケーションは以下の機能を提供します：

- MoneyForwardからエクスポートしたCSVファイルのアップロード
- 経費の大項目・中項目ごとに計算対象から除外する設定
- パートナーの金融機関設定
- 負担割合の設定
- 計算結果の表示

### 技術スタック

- TypeScript
- React
- Vite
- Material UI
- PapaParse (CSV解析)

## Chrome拡張機能

Chrome拡張機能は、Webアプリケーションの機能をブラウザ拡張として提供します。拡張機能の実装は `extension` ディレクトリにあります。

### 主な機能

- MoneyForwardの家計簿ページを開くと自動的に経費計算を行う
- ページ内に計算結果を表示
- 拡張機能のポップアップから詳細な設定や結果を確認

### 実装方針

Chrome拡張機能の実装方針は以下の通りです：

1. **直接DOM操作によるデータ抽出**:
   - MoneyForwardのページからテーブルデータを直接抽出
   - DOMからCSVデータと同じ構造のJSONデータを生成

2. **データ処理**:
   - 既存のロジック（ExpenceResult.tsxなど）を再利用
   - 設定はChrome Storageに保存（現在のlocalStorageから移行）

3. **結果表示**:
   - MoneyForwardページ内に結果を表示するサイドパネルを挿入
   - 拡張機能のポップアップUIに詳細結果を表示

### 技術スタック

- TypeScript
- Chrome Extension API
- Material UI (スタイリング)

### 拡張機能のインストール方法

拡張機能のインストール方法については、[extension/README.md](extension/README.md) を参照してください。

## 開発方法

### Webアプリケーション

```bash
# 依存パッケージのインストール
bun install

# 開発サーバーの起動
bun run dev

# ビルド
bun run build
```

## ライセンス

このプロジェクトは個人利用を目的として開発されています。
