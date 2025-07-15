# 在庫管理システム (Inventory Management System)

本格的なDjango + React製在庫管理システムです。

## 🏗️ システム構成

- **バックエンド**: Django + Django REST Framework
- **フロントエンド**: React + TypeScript + Vite + Tailwind CSS
- **データベース**: SQLite (開発用)
- **認証**: Token認証

## 🚀 セットアップ方法

### バックエンドの起動

```bash
cd backend
python manage.py runserver
```

### フロントエンドの起動

```bash
cd frontend
npm install
npm run dev
```

## 🔐 テストアカウント

システムには以下のテストアカウントが用意されています：

### 管理者アカウント
- **ユーザーID**: `test_admin`
- **パスワード**: `test123`
- **権限**: 全工場の主任管理者
- **利用可能機能**:
  - 商品の登録・編集・削除
  - 在庫管理全般
  - 工場管理者の管理
  - システム設定
  - 全レポート閲覧

### 一般ユーザーアカウント
- **ユーザーID**: `test_user`
- **パスワード**: `test123`
- **権限**: 東京第一工場の副管理者
- **利用可能機能**:
  - 入出庫処理
  - 在庫確認・検索
  - 棚卸し作業
  - 基本レポート閲覧

## 📱 使用方法

### 1. ログイン
1. ブラウザで `http://localhost:5174/` にアクセス
2. ログイン画面で「管理者」または「ユーザー」を選択
3. 上記のテストアカウントでログイン

### 2. 主な機能
- **在庫管理**: 商品の登録・編集・削除・検索
- **入出庫処理**: 商品の入荷・出荷記録
- **棚卸し**: 理論在庫と実在庫の確認・調整
- **工場管理**: 工場情報と管理者の設定
- **レポート**: 在庫状況・移動履歴の確認

## 🔧 開発情報

### データベース構造
- **Account**: ユーザー管理
- **Factory**: 工場情報
- **Manager**: 工場管理者（Account-Factory関連）
- **Inventory**: 在庫情報
- **StockMovement**: 在庫移動履歴
- **Stocktaking**: 棚卸し記録

### API エンドポイント
- `/api/admin/login/` - 管理者ログイン
- `/api/user/login/` - ユーザーログイン
- `/api/inventories/` - 在庫管理
- `/api/managers/` - 工場管理者管理
- `/api/stock-movements/` - 在庫移動
- `/api/stocktakings/` - 棚卸し
- `/api/factories/` - 工場管理

## 📝 git コマンド

git push origin develop

git init                    # 新しいリポジトリを作成
git config --global user.name "名前"    # ユーザー名の設定
git config --global user.email "メール"  # メールアドレスの設定

git status                  # 現在の状態を確認
git add .                   # すべての変更をステージング
git add ファイル名           # 特定のファイルをステージング
git commit -m "メッセージ"    # 変更をコミット
git log                     # コミット履歴を表示

git branch                  # ブランチ一覧を表示
git branch ブランチ名        # 新しいブランチを作成
git checkout ブランチ名      # ブランチを切り替え
git checkout -b ブランチ名   # ブランチを作成して切り替え
git merge ブランチ名         # ブランチをマージ

git remote add origin URL   # リモートリポジトリを追加
git push origin ブランチ名   # 変更をプッシュ
git pull origin ブランチ名   # 変更をプル
git clone URL              # リポジトリをクローン

git diff                    # 変更内容を確認
git reset ファイル名         # ステージングを解除
git reset --hard HEAD      # 最後のコミットに戻す
git stash                  # 変更を一時保存
git stash pop              # 保存した変更を復元

git tag タグ名              # タグを作成
git tag -a タグ名 -m "メッセージ"  # 注釈付きタグを作成
git push origin タグ名      # タグをプッシュ

git log --oneline          # コミット履歴を簡潔に表示
git log --graph           # コミット履歴をグラフ表示
git blame ファイル名       # ファイルの各行の変更履歴を表示

git config --list         # 設定一覧を表示
git config --global --list # グローバル設定を表示