# ms-office-citation-jp
ms-office-citation-jp は、Microsoft Word Online / Teams 上で動作するオープンソースの参考文献管理アドインです。
日本語論文執筆に適した引用・参考文献リストの作成を目指し、Citation Style Language (CSL) を利用して著者名や出版情報を自動整形することを目指しています。

### 免責

- このアドインは、AIを最大限活用して突貫開発されたものであり、品質やセキュリティについては保証されません。
- バグ報告や改善提案は歓迎しますが、対応を約束するものではありません。

## 配布ガイド（GitHub Pages + 管理センター自動配布）

結論: GitHub Pages でホスティングし、Microsoft 365 管理センターの「統合アプリ」から対象グループへ「必須（自動追加）」で割り当てるのが、安価・確実・ゲストにも行き渡る運用です。AppSource 申請は不要です。

### 0) 前提

- ゲストは該当テナントに外部ユーザー（Entra IDのゲスト）として招待済み
- 配布対象の Team に対応する Microsoft 365 グループに、ゲストも含めてメンバー追加済み
- 管理センターの「統合アプリ」でアプリ追加できる権限がある

### 1) GitHub Pages へ自動デプロイ

このリポジトリには、`main` へ push すると `dist/` を `gh-pages` ブランチに公開する GitHub Actions を同梱しています。

1. GitHub のリポジトリ設定 → Pages → Branch を `gh-pages` に設定
2. `webpack.config.js` の `urlProd` を自分の Pages URL に設定（環境変数 `PROD_BASE_URL` でも可）。例: `https://tsuchim.github.io/ms-office-citation-jp/`
3. `main` ブランチへ push すると、自動で `https://tsuchim.github.io/ms-office-citation-jp/` に `taskpane.html` 等が公開されます

補足: manifest.xml 内の URL は開発時 `https://localhost:3000/` になっていますが、ビルド時に `urlDev -> urlProd` 置換され、本番は `https://tsuchim.github.io/ms-office-citation-jp/` の絶対 URL に変換されます。

### 2) manifest.xml を管理センターへアップロード

1. Microsoft 365 管理センター → 設定 → 統合アプリ → アプリをアップロード → Office アドイン
2. `ms-office-citation-jp/manifest.xml` を指定（ビルド済み不要。ファイル内 URL は Pages 先に置換されます）
3. 「割り当て」で対象の M365 グループ（Team）を選択
4. インストール種別を「必須（自動的に追加）」に設定

反映は数分〜数十分。必要に応じて Office への再サインインで更新反映。

### 3) 動作確認

- Teams/Word を開き、リボンのボタンからタスクペイン起動
- 文献リストが 1 行レイアウト（著者 (年) · タイトル）で横スクロールなしで表示されること
- ネットワーク先が `https://tsuchim.github.io/ms-office-citation-jp/` になっていること

### 4) よくあるつまづき

- manifest 内に相対パスが残っている → すべて `https://tsuchim.github.io/ms-office-citation-jp/` の絶対 URL に
- 割り当て対象にゲストを含む M365 グループを選んでいない
- 反映遅延時：再サインイン/Office再起動

### 5) ロールバック/更新

- `main` に修正を push → 自動で `https://tsuchim.github.io/ms-office-citation-jp/` に反映
- 大きな破壊的変更時は、管理センターで manifest.xml を再アップロード（バージョンを上げると確実）

---

補足: 本番 URL は `webpack.config.js` の `urlProd` を確定させておきました。リポジトリの実オーナー/リポ名が決まり次第、固定値にしておくと運用が安定します。
