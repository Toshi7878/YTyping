# PPランキングに入力方式別タブ(ローマ字/かな/フリック/英語)を追加

## Context

現在のPPランキング(`/rankings/performance`)は `user_stats.total_pp` による単一ランキングのみ。入力方式(ローマ字/かな入力/フリック/英語)ごとのランキングタブを追加し、各ランキングは**その入力方式のみで打鍵されたリザルト**だけを集計対象とする。ユーザープロフィールページにも方式別ランクを表示する。

### 確定仕様(ユーザー確認済み)
- タブ構成: **総合 / ローマ字 / かな / フリック / 英語**(デフォルト=総合、既存URL挙動は不変)
- `result_statuses` の type カウントによる判定(優先順に評価、`total` = 全7カウントの合計):
  1. **flick**: `flickType > 0` — フリック入力はモード切替できないため、flick打鍵が含まれていれば無条件にフリック集計対象
  2. **roma**: `romaType > 0 AND kanaType = 0 AND englishType / total <= 0.1` — 英語打鍵が全打鍵の10%以下のリザルトのみ
  3. **kana**: `kanaType > 0 AND romaType = 0 AND englishType / total <= 0.1` — 同上
  4. **english**: `englishType > 0 AND romaType = 0 AND kanaType = 0`(英語のみ譜面のリザルト)
  5. いずれにも該当しない(roma+kana混合、英語比率10%超のroma/kana等)→ どの方式にも集計しない
- スペース・数字・記号打鍵は中立扱い(判定に影響しない。10%判定の分母 `total` には含む)
- 参考: 既存の表示用分類 `InputModeText`(`src/shared/result/input-mode-text.tsx`)は `(englishType + spaceType) / total >= 0.1` で「・英語」併記に切り替わる。本ランキング判定は英語打鍵のみを分子とする(スペースは中立のため)
- 方式別合計PPは既存と同じ加重式: 上位200件 × 減衰0.95(`calcTotalPP` @ `src/shared/result/pp/calc.ts`)
- 方式PPが0のユーザーはそのランキングに表示しない/プロフィールにランク表示しない

### 方針
`total_pp` と同じ「事前集計カラム + 書き込み時再計算」パターンを踏襲。`user_stats` に方式別PPカラムを4つ追加し、リザルト登録時と一括再計算スクリプトで更新する。ランキングはクエリ時集計しない。

## 実装ステップ

### 1. 共有モジュール: モード定義と分類器
**新規: `src/shared/result/pp/mode.ts`**
- `PP_MODES = ["total", "roma", "kana", "flick", "english"] as const` / `type PpMode`
- `INPUT_PP_MODES = ["roma", "kana", "flick", "english"] as const` / `type InputPpMode`
- `PP_MODE_LABELS: Record<PpMode, string>` — 総合/ローマ字/かな/フリック/英語
- `classifyResultPpMode(counts: { romaType; kanaType; flickType; englishType; spaceType; symbolType; numType }): InputPpMode | null` — 上記判定基準のTS実装(flick最優先 → roma/kana は英語比率 `englishType / total <= 0.1` を要求 → english)。`total = 0` のリザルトは null

### 2. スキーマ変更
**変更: `src/server/drizzle/schema/user/stats.ts`** — `userStats` に追加:
```ts
romaPp: integer("roma_pp").default(0).notNull(),
kanaPp: integer("kana_pp").default(0).notNull(),
flickPp: integer("flick_pp").default(0).notNull(),
englishPp: integer("english_pp").default(0).notNull(),
```
既存の `user_stats_total_pp_idx` に倣い、各カラムにbtreeインデックスを追加。

適用は `pnpm db:push`(リポジトリにmigrationsディレクトリは存在せず、`db:push` 運用)。

### 3. PP再計算の共通化 + 方式別対応
既存の `recalculateUserTotalPP`(`src/server/api/routers/result/ranking.ts:289`)と `syncUserTotalPP`(`src/server/drizzle/scripts/recalculate-all-pp.ts:70`)はほぼ重複コード。共通関数に抽出して方式別ロジックを一箇所にする。

**新規: `src/server/api/utils/recalculate-user-pp.ts`**
- `recalculateUserPP(tx: TXType, userId: number)`:
  1. 1クエリでユーザーの全リザルトの `pp` + 全7 type カウントを取得(`resultStatuses` ⋈ `results`)
  2. `classifyResultPpMode` でTS側でバケット分類
  3. 全体 + 各バケットに `calcTotalPP`(内部でsort+top200なので `ORDER BY`/`LIMIT` 不要)
  4. `userStats` へ `totalPp/romaPp/kanaPp/flickPp/englishPp` を `onConflictDoUpdate` でupsert

**変更: `src/server/api/routers/result/ranking.ts`** — `recalculateUserTotalPP` を削除し、`register` 内(L120)で `recalculateUserPP(tx, userId)` を呼ぶ。

**変更: `src/server/drizzle/scripts/recalculate-all-pp.ts`** — `syncUserTotalPP` を削除し `recalculateUserPP` を利用。**このスクリプト(`pnpm pp:recalculate`)が既存データのバックフィルを兼ねる**(デプロイ後に本番で1回実行)。

### 4. tRPCルーター
**変更: `src/server/api/routers/ranking/pp/const.ts`** — カラムマップを追加:
```ts
PP_MODE_COLUMNS = { total: userStats.totalPp, roma: userStats.romaPp, ... } satisfies Record<PpMode, PgColumn>
```

**変更: `src/server/api/routers/ranking/pp/list.ts`**
- `get`: input に `mode: z.enum(PP_MODES).default("total")` を追加。`PP_MODE_COLUMNS[mode]` で選択カラム・`RANK() OVER`・`orderBy` を切替。非totalモードは `gt(col, 0)` フィルタ追加。出力フィールド名は `totalPP` → `pp` にリネーム
- `getPageCount`: 同様に `mode` input + `> 0` フィルタ(totalは現行挙動維持)

**変更: `src/server/api/routers/ranking/pp/pp.ts`**
- `getRankByUserId` は**変更しない**(ヘッダーの user-menu が総合ランクで使用中)
- 新規 `getRanksByUserId`: input `z.number().int()`、戻り値 `Record<PpMode, number | null>`
  1. 対象ユーザーの `userStats` 行を取得(なければ全モード null)
  2. `count(*) FILTER (WHERE col > ${me.col})` を5カラム分まとめた1クエリ(banned除外)で上位人数を取得
  3. 各モード: `me[col] > 0 ? count + 1 : null`(総合も0PPならnull → プロフィールは "-" 表示)

### 5. ランキングページUI
**変更: `src/app/rankings/performance/_feature/search-params.ts`**
- `mode: parseAsStringLiteral(PP_MODES).withDefault("total")` を追加
- フックを `useQueryStates` ベース(`usePpRankingQueryStates`)に変更し、タブ切替時に `{ mode, page: 1 }` をアトミックに設定できるようにする

**変更: `src/app/rankings/performance/page.tsx`** — `{ page, mode }` を読み、`list.get({ cursor: page - 1, mode })` と `getPageCount({ mode })` をprefetch。

**変更: `src/app/rankings/performance/_feature/pp-ranking.tsx`**
- `src/app/user/[id]/_features/tabs.tsx` と同じパターンで `Tabs`/`TabsList variant="underline"`/`TabsTrigger`(`@/ui/tabs`)を使用。`TabsContent` は不要(下のリストが共通コンテンツ)
- ラベルは `PP_MODE_LABELS`、`onValueChange` で `setQuery({ mode, page: 1 })`
- 両クエリに `mode` を渡し、`row.totalPP` → `row.pp` に変更(「合計 PP」ヘッダーは全モードで妥当なので維持)

### 6. プロフィールページの方式別ランク表示
**変更: `src/app/user/[id]/page.tsx`** — prefetch を `getRankByUserId` から `getRanksByUserId` に差し替え。

**変更: `src/app/user/[id]/_features/user-profile-card.tsx`**
- `useSuspenseQuery(trpc.ranking.pp.getRanksByUserId...)` に変更
- 実力ランク(総合)は現行の位置・体裁を維持(`ranks.total`、null時 "-"、リンクは `/rankings/performance?page=N`)
- その下/横に方式別ランクを表示: rank が非null のモードのみ `ローマ字 #12` 形式(`PP_MODE_LABELS` 使用)で、`/rankings/performance?mode=roma&page=${Math.ceil(rank / PAGE_SIZE)}` へリンク

## 検証

1. `pnpm db:start` → `pnpm db:push` — `user_stats` に4カラム+インデックスが追加されること
2. `pnpm db:seed`(必要なら)→ `pnpm pp:recalculate` — 方式別PPがバックフィルされること
3. SQLスポットチェック: あるユーザーの `roma_pp` がromaに分類されるリザルトの `calcTotalPP` と一致 / 混合入力リザルト(roma+kana)がどのモードにも入らない / 英語比率10%超のromaリザルトが roma に入らない / flick打鍵を含むリザルトが flick に入る / 英語のみリザルトが english に入る
4. `pnpm typecheck` / `pnpm check`
5. 手動確認: `/rankings/performance` デフォルト(総合)が現行と同一、`?page=2` 等の既存URLも不変。各タブでPP>0のユーザーのみ表示・順位/ページングが正しい。プロフィールページで総合+PP>0のモードのみランク表示。ヘッダーのランク表示(`getRankByUserId`)が壊れていないこと
   - 注: `register` mutation は development では FORBIDDEN のため、ローカルでの再計算検証はスクリプト経由で行う

## デプロイ後の運用
本番で `pnpm pp:recalculate` を1回実行して既存データの方式別PPをバックフィルする(以降はリザルト登録時に自動更新)。
