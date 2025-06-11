#command

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