# Copilot Instructions — ms-office-citation-jp

## プロジェクト目的

* Microsoft Word（Web/Teams/Win/Mac）の **Office アドイン**として、日本語執筆に耐える **引用・参考文献管理**を提供する
* **サイドロード運用 → AppSource 公開**まで見据える
* **CSL + citeproc-js** による整形を採用（将来の独自実装差し替えも可能）

---

## 全体設計方針

* 文献データは **CSL-JSON** を正規化形式として統一
* 文中引用は **Content Control(CC)** に JSON メタを埋め込み
* 文末参考文献は **専用 CC 占有（単一）**。再生成は常に全置換
* **抽象化層 (CiteEngine)** を必須とし、`citeproc-js` への直接依存を禁止
* **冪等性・再生成で整合性が回復する設計**を徹底

---

## 技術スタック

* **TypeScript + React + Vite**
* **office-js** (Word API)
* **citeproc-js**（AGPLv3）, **citation-js**（BibTeX/RIS 変換, MIT）
* 型・品質: `typescript`, `eslint`, `prettier`, `zod`
* テスト: `vitest`
* i18n: まずは日本語固定（構造は拡張可能）

---

## データモデル

* **UserStore** (`OfficeRuntime.storage`)

  * `library`: CSL-JSON 配列
  * `settings`: style, locale, rules
* **DocStore** (文書内 CC)

  * 引用CC: `title="JIS-Cite"`, `tag={"keys":[...],"style":"author-date","seq":n}`
  * 文献リストCC: `title="JIS-Bibliography"`, `tag="msocj:bib"`
  * 文書メタCC: `title="JIS-DocMeta"`, `tag={"style":"numeric","locale":"ja","map":{...}}`

---

## 抽象化インターフェース

```ts
export type CitationStyle = 'author-date' | 'numeric';

export interface CiteEngine {
  init(opts: { styleXml: string; localeXml: string }): Promise<void>;
  formatInText(keys: string[], ctx: { style: CitationStyle; seqMap?: Record<string, number> }): string;
  formatBibliography(keysInOrder: string[]): string; // HTML
}
```

* `engine/citeproc/adapter.ts` に `CiteEngine` 実装を配置
* UI/サービス層は **この IF のみを利用**。内部実装に触れない

---

## Word 連携規約

* 文末参考文献は **単一 CC 占有**、常に全置換
* 文中引用は **リッチテキスト CC**。過剰なフィールド依存は禁止
* 更新は **明示操作ボタン**のみ。自動フック禁止
* 大量処理はバッチ化＋進行表示

---

## UI 構造

* **タスクペイン** 4タブ:

  1. **ライブラリ**（インポート/検索/削除）
  2. **挿入**（選択→引用挿入）
  3. **更新**（文中引用・文献リストの一括再生成）
  4. **設定**（style, locale, 著者省略ルール等）
* トースト通知＋処理中インジケータ必須

---

## コーディング規約

* strict TS / ESLint + Prettier
* 例外握り潰し禁止。ユーザーに通知＋詳細ログ出力
* 副作用関数は必ず戻り値型を定義
* UI は a11y 準拠（aria/キーボード操作）

---

## セキュリティ・プライバシ

* 既定で **外部送信なし**。CiNii/Crossref API 利用はオプトイン
* CSP で外部通信ドメインを制限
* 依存ライブラリのライセンスは CI で検査 (`pnpm licenses`)
* `/docs/privacy.md` に公開用プライバシーポリシーを置く

---

## パフォーマンス指針

* 1000件規模の文献に耐える
* 差分更新を基本とし、再生成は O(n)
* 重い処理は Web Worker 化を検討

---

## 受け入れ基準（必要十分）

* 著者年／数値参照を切替可能。混在は警告で禁止
* numeric モードでは初出順に採番 → 再生成で整合性回復
* 文中引用 CC と Bib CC の**冪等性**保証
* 欠損キーは `[?]` と明示表示＋ダイアログ通知
* 再起動後もライブラリ・設定保持
* 他PCでも文書内タグ情報から再生成可能
* 依存ライセンスが `NOTICE` に全記録される

---

## 開発タスク順序

1. Engine IF 実装（CiteEngine + citeproc adapter）
2. WordApi（CC操作ユーティリティ）
3. CitationService（採番・再描画ロジック）
4. BibliographyService（リスト全置換生成）
5. ImportService（CSL-JSON/BibTeX/RIS 正規化）
6. UI（React タブ＋操作ボタン＋通知）
7. 設定保存・復元
8. 単体テスト（和2/英3ケースで通過必須）

---

## 禁止事項

* Word ネイティブ「引用文献の管理」DBへの直接アクセス
* 保存/印刷時など**暗黙トリガー**での更新処理
* 個人データや文献メタを外部送信（許可なし）
* **エージェントがやりがちなNG**:

  * 同じ機能の再実装を繰り返す
  * 一時しのぎのフォールバック処理でエラーを隠蔽
  * コピペ改変で重複コードを量産
  * 場当たり的修正で設計を崩す

---

## エージェントへの振る舞いルール

* **一貫した設計を優先**し、指示された抽象化・API を厳守
* 出力は **具体的なコード差分**を優先。解説は簡潔でよい
* 不明点は「TODO コメント」で明示し、暫定コードに留める
* 新規実装は既存仕様と突き合わせて重複を避ける
* 破壊的変更は必ず PR + 根拠を提示

---
