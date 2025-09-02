# Copilot Instructions — ms-office-citation-jp

## プロジェクト目的

* Microsoft Word（Web/Teams/Win/Mac）の **Office アドイン**として、日本語執筆に耐える **引用・参考文献管理**を提供する
* 初期は **サイドロード運用**。のちに **AppSource** 申請可能な品質へ
* 短期は **実用性優先**：`citeproc-js + CSL` を採用。将来差し替え可能な抽象化層を持つ

## 主要機能（MVP）

* 文献データのインポート（CSL-JSON / BibTeX / RIS → 内部は CSL-JSON に正規化）
* 文中引用の挿入（著者年 or 数字参照の2系統。設定で切替）
* 文末の参考文献リスト自動生成・再生成（専用 Content Control を占有）
* 既存引用の一括更新（重複マージ、順序・番号再割り当て）
* 設定：言語（ja/en）、スタイル（JIS 風プリセット／APA など参考）

## 技術スタック

* Office Add-in（Task Pane）: **TypeScript + React**
* ビルド: Vite または Webpack（どちらでもよいが一貫性厳守）
* ランタイム: `office-js`
* 整形: `citeproc-js`（AGPLv3）、`CSL locales ja`
* 型・品質: `typescript`, `eslint`, `prettier`, `zod`
* テスト: `vitest` or `jest`（どちらか統一）
* i18n: 最小は `ja` 固定、メッセージは将来拡張できる構造で

## ライセンス方針

* リポジトリは **AGPL-3.0**（`citeproc-js` 内包のため）
* `CSL`/スタイルファイルは CC-BY-SA 表記を `LICENSES/` に同梱
* 将来エンジン差し替え時にライセンス再検討可。**エンジンは抽象化して依存を隔離**

## ディレクトリ構成（提案）

```
/src
  /app           # UI（React）
  /office        # Office.js 呼び出し（Word run, ribbon, commands）
  /engine        # 形式変換・citeproc ラッパー（抽象化層）
  /models        # 型定義（CSL-JSONスキーマ等）
  /services      # 設定保存、ファイル入出力、ID発行
  /styles        # UI スタイル
  /utils         # 汎用
/public
/manifest        # manifest.xml, assets
/scripts         # 開発補助（sideload 等）
/tests
/LICENSE
```

## 抽象化インターフェース（差し替え前提）

```ts
// engine/interfaces.ts
export type CitationStyle = 'author-date' | 'numeric';

export interface CiteEngine {
  init(styleCslXml: string, localeXml: string): Promise<void>;
  formatInText(itemKeys: string[], options: { style: CitationStyle }): string;
  formatBibliography(itemKeys: string[]): string; // HTML or plain text
}
```

* `engine/citeproc/` に `CiteEngine` 実装を置く
* 将来独自実装へ差し替える場合は **この Interface の互換性を死守**

## Word 連携規約

* 文末参考文献は **Content Control** を専用占有

  * `title: "JIS-Bibliography"` を常用
* 文中引用は **テキスト**挿入（過度なフィールド依存は避ける）
* 更新は **明示操作**（自動トリガは避ける）。`[引用更新]` ボタンで実行
* 大量処理時は UI フリーズ回避（バッチ化、status 表示）

## データ取り扱い

* 内部形式は **CSL-JSON**（正規化ユーティリティを作る）
* 参照IDは **安定キー**（例: `source:doi:10.1234/...`、`cinii:NAID:...`、`local:uuid`）
* `OfficeRuntime.storage` を基本ストアに。将来バックエンド連携可
* 個人情報/通信は**既定でオフ**。外部API呼出は **明示オプトイン**

## 既定スタイル

* 既定は **JIS 風（著者. 年. 題名. 誌名, 巻(号), 頁.）** の CSL を同梱
* 句読点/括弧は和文（、 。 （ ））
* 著者名は和文は「姓 名」、欧文は `Family, Given`
* 複数著者の省略は「ほか」

## コーディング規約（抜粋）

* TypeScript strict / ESLint + Prettier を必須
* 副作用のある関数は戻り型に `Promise<void>` を避ける（戻り値で状態を返す）
* UI はアクセスビリティ準拠（キーボード操作、aria）
* 例外は握り潰さない。ユーザー可視なエラー表示を統一

## セキュリティ/プライバシ

* 外部送信（API/ログ/テレメトリ）は **デフォルト無効**
* AppSource 想定の **Privacy Policy** 文案を `/docs/privacy.md` に用意
* 依存ライブラリのライセンスは `pnpm licenses`/`npm ls --json` で検査

## パフォーマンス指針

* 大量文献（1000件程度）でのリスト生成に耐える

  * 差分更新（変更のあったキーのみ再整形）
  * メインスレッド占有を避ける（必要あれば Web Worker）

## ビルド/実行（npm scripts 例）

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "test": "vitest run",
    "office:start": "office-addin-debugging start manifest/manifest.xml",
    "office:stop": "office-addin-debugging stop"
  }
}
```

## サイドロード手順（要約）

1. `npm i` → `npm run build`
2. `manifest/manifest.xml` を Word Online の「アドインのアップロード」で指定
3. タスクペインが開くことを確認

## PR/コミット規約

* Conventional Commits 準拠（`feat:`, `fix:`, `chore:`…）
* PR には **目的・スクショ・テスト観点**を記載
* 変更がエンジン層に触れる場合は **後方互換性**を説明

## 受け入れ基準（MVP Done）

* 5件の文献（和文2/英文3）で

  * 文中引用（著者年/数字）を挿入できる
  * 文末リストが JIS 風で生成される
  * 追加・削除後に `[引用更新]` で整合が保たれる
* 再起動後も文献/設定が保持される
* 依存ライセンスの表記が `NOTICE` に出力される

## 追加タスク（優先順）

1. **インポートUI**（CSL-JSON/BibTeX/RIS）
2. **JIS 風 CSL の同梱と単体テスト**
3. **引用更新ロジック（重複統合/番号採番）**
4. **Content Control 管理（存在検出・作成・置換）**
5. **設定UI（スタイル/言語）**
6. **エラーハンドリング/トースト通知**
7. **簡易ドキュメント `/README.md`**

## 明確な禁止事項 / 回避

* Word ネイティブ「引用文献の管理」データベースとの直結はしない（Office.js API 非公開のため）
* 自動でドキュメント保存/印刷時に処理を走らせない
* 外部に個人データや文献メタデータを送信しない（明示許可がない限り）

## 参考（最小コード断片）

```ts
// 文中引用挿入（概念）
await Word.run(async ctx => {
  const sel = ctx.document.getSelection();
  const text = engine.formatInText(['local:uuid-1'], { style: 'author-date' });
  sel.insertText(text, Word.InsertLocation.replace);
  await ctx.sync();
});

// 参考文献リスト再生成（概念）
await Word.run(async ctx => {
  const body = ctx.document.body;
  const cc = body.contentControls.getByTitle("JIS-Bibliography");
  cc.load("items");
  await ctx.sync();
  const rng = cc.items.length ? cc.items.getFirst().getRange() : body.insertContentControl().getRange();
  const html = engine.formatBibliography(allKeys);
  rng.insertHtml(`<h2>参考文献</h2>${html}`, Word.InsertLocation.replace);
  await ctx.sync();
});
```

## エージェントへの振る舞いルール

* 出力は **具体的なコードと差分**を優先。要約や長文解説は短く
* 破壊的変更は PR で実施し、根拠を記載
* 仕様不明点は **最小仮実装**→ TODO コメントで明示
* フレームワーク・ライブラリの選定は **一貫性優先**。無断差し替え禁止

