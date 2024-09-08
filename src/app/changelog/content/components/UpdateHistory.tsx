import { ThemeColors } from "@/types";
import { Box, Text, UnorderedList, ListItem, useTheme } from "@chakra-ui/react"; // UnorderedListとListItemを追加
import React from "react";

const updates = [
  {
    date: "2024-09-8",
    descriptions: [
      "タイピングページにエディターのリンクを追加",
      "エディターで譜面IDが割り振られている譜面にタイピングページに移動ボタンを追加",
      `エディターのプレビュータイム設定を情報 & 保存タブに移動`,
    ],
  },
  {
    date: "2024-09-6",
    descriptions: [`エディターのラインオプションにプレビュータイム変更設定を追加`],
  },
  {
    date: "2024-09-1",
    descriptions: [
      `エディターの設定タブにショートカットキー 一覧を追加`,
      `ヘッダーの幅がスクロールバーの有無で変化しないように変更`,
      `エディターの歌詞テキストボックス内で、歌詞の一部を選択してEnterを押すとRubyタグを挿入する機能を追加`,
      `エディターの設定一覧をを設定タブに移動`,
      `エディターで選択中の行を再度クリックしたときに時間・歌詞・ワードが再挿入されるように変更`,
      `譜面のend時間が動画の総時間よりも長い場合、譜面のend時間を動画の総時間に合わせる処理を追加`,
      ,
    ],
  },
  {
    date: "2024-08-31",
    descriptions: [
      `エディターに適用中のテーマを適用(一部のみ)`,
      `エディターで譜面のend時間を動画を再生する前に予め取得するように変更`,
      `エディターで新規作成譜面, 自分が作成した譜面のみに保存ボタンを表示するように変更`,
    ],
  },
  {
    date: "2024-08-25",
    descriptions: [
      `プレイ終了時の詳細リザルト → 各ラインリザルト結果をクリックした時に簡易リプレイされる機能を追加。`,
    ],
  },
  {
    date: "2024-08-24",
    descriptions: [
      `かな入力を含む記録のランキングホバー時の吹き出しにローマ字換算kpm表示を追加(追加時より前に登録された記録については表示されませんm(_ _)m)`,
      `ランキングの新規登録時にエラーが発生していた問題を修正`,
    ],
  },
  {
    date: "2024-08-21",
    descriptions: [`練習モードでタイムが短いラインの前後で→キーが正常に動作しない問題を修正`],
  },
  {
    date: "2024-08-20",
    descriptions: [
      `練習モードの選択ライン表示をドラッグで移動させた後にページ移動するとclientエラーが発生する問題を修正`,
      `"ん" の入力に2打鍵を要するパターン(nn xn n')の時に配点が10Pointになっていた問題を修正`,
      `ローマ字入力で "んん" の入力パターン(nxn)に対応`,
      `ローマ字入力で "んう" の入力パターン(nwu nwhu)に対応`,
      "練習モードで選択中のライン表示を追加",
    ],
  },
  { date: "2024-08-19", descriptions: [`ローマ字入力モードで "..." → "z." ".." → "z," に対応`] },
  {
    date: "2024-08-18",
    descriptions: [
      "ランキング登録ボタンクリック時にローディングアニメーションが行われない問題を修正",
      "倍速時に打鍵記録データが1倍速の打鍵時間で記録されていた問題を修正。(修正前の倍速リプレイは正常に再生できなくなりますm(_ _)m)",
      "倍速プレイ時にタイムボーナスが低くなる問題を修正",
      "詳細リザルトの取得Point+timeBonus点にカーソルを合わせたときに合計Point表示・時点のスコア表示を追加",
    ],
  },
  {
    date: "2024-08-17",
    descriptions: [
      "リプレイモード終了時にステータスがリセットされる問題を修正",
      "リプレイモードのLine Kpm計算が正常に再生されていない問題を修正",
    ],
  },
  {
    date: "2024-08-16",
    descriptions: [
      "0Miss & 0Lost達成時はスコアに関係なくランキング登録ボタンを設置(スコアが低い場合は確認ダイアログ表示)",
      "0Miss & 0Lostの記録は正確率と最大コンボ数の色が変わるように変更",
    ],
  },
  { date: "2024-08-15", descriptions: ["更新履歴ページを追加"] },
];

const UpdateHistory = () => {
  const theme: ThemeColors = useTheme();

  return (
    <Box>
      {updates.map((update, index) => (
        <Box key={index} mb={12} gap={2} color={theme.colors.color}>
          <Text fontWeight="bold">{update.date}</Text>
          <UnorderedList>
            {update.descriptions.map((desc, i) => (
              <ListItem key={i}>{desc}</ListItem>
            ))}
          </UnorderedList>
        </Box>
      ))}
    </Box>
  );
};

export default UpdateHistory;
