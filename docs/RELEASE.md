# Release Policy

- main: 公開用。**Squash merge のみ**（線形履歴）
- devel: 次版の作業ブランチ
- タグ: vX.Y.Z（SemVer）
- CI: build/test 合格を必須（Branch Protection）
- Pages: main → gh-pages 自動デプロイ
- manifest: dev→prod 置換（絶対URL）

## 初回リリース（v0.1.0）

1. devel を最新 main に合わせる
   - `git checkout devel && git fetch origin && git rebase origin/main`
   - `npm run build && npm test`
2. PR（devel→main）を Squash merge
3. タグ付与: `git tag -a v0.1.0 -m "Initial public release" && git push origin v0.1.0`
