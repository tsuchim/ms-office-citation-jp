# Contributing

## ブランチ戦略
- 開発は `devel` から派生して PR 作成
- `main` は公開用: **Squash merge のみ**（線形履歴）

## コミットメッセージ（Conventional Commits）
- `feat: …` / `fix: …` / `docs: …` / `chore: …` / `refactor: …`
- PR は複数コミットOK、マージ時に Squash で1コミット化

## PR ルール
- CI（build/test）に合格
- UI 変更時はスクショ or 動画
- Word（Teams）での簡易動作確認
