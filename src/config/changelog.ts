export const changelog = [
  {
    date: "2025-1-02",
    descriptions: [
      "文字を選択した際のbgカラーを変更",
      "タイピング中の処理を一部改善",
      "エディターのTabキーの動作を歌詞追加テキストエリアのフォーカス切り替えに変更",
    ],
  },
  {
    date: "2024-12-30",
    descriptions: [
      "ログイン・ログアウトの処理を改善",
      "譜面一覧のランキングカウントホバーで自分の順位表示を追加",
    ],
  },
  {
    date: "2024-12-29",
    descriptions: [
      "ヘッダーのユーザー名メニューにユーザー設定ページ追加 & 名前変更機能追加",
      "正常にリプレイできない可能性の表示方法を改善",
      "タイムラインにいいねアイコンとランキングアイコンを表示",
    ],
  },
  {
    date: "2024-12-22",
    descriptions: [
      "タイピングページを開いたときにエラーが発生する問題を修正",
      "ログインできない問題を修正",
    ],
  },
  {
    date: "2024-12-15",
    descriptions: [
      "ランキング登録日時より後に譜面データがアップデートされている場合はリプレイ再生開始時に「正常にリプレイ再生できない可能性があります」ダイアログを表示",
      "譜面データ最終更新日時の更新をラインの増減・タイム変更・ワード変更時にのみ更新されるように変更",
    ],
  },
  {
    date: "2024-12-14",
    descriptions: [
      "タイピング中に入力モードを変更した際に元の入力モード設定が変更される問題を修正",
      "エディターでワードが存在しないラインを追加する場合は追加時間の補正を行わないように変更",
      "エディターページの動作を改善(処理方法を変更したため、正常に動作していた箇所で不具合が発生している可能性があります)",
    ],
  },
  {
    date: "2024-11-29",
    descriptions: [
      "練習モードのラインリスト表示(Tab)の動作を改善",
      "スコアとKpmの値が予期なく上昇してしまう問題を修正",
    ],
  },
  {
    date: "2024-11-28",
    descriptions: [
      "かな入力で開始時にローマ字入力になる問題を修正",
      "稀に発生するタイピング中の処理落ちを改善（要検証）",
      "開始前の速度変更ボタンを修正",
      "新着通知時のバッジ表示が無効になっている問題を修正",
    ],
  },
  {
    date: "2024-11-27",
    descriptions: [
      "タイピング中にF7キーで練習モード→本番モードに移行した時、元々の倍速設定がうまく反映されない問題を修正",
      "タイムラインページでの動画プレビュー再生時に、その記録の倍速スピードで再生されるように変更",
      `タイピング中に動画速度を変更した時でも、最低速度が記録に反映されるように修正
      \n※やり直し時は最低速度リセット、間奏ライン時の速度変更はカウントされない`,
      "エディターでダブルクォーテーションが \\ に変換されてしまう問題を修正",
    ],
  },
  {
    date: "2024-11-26",
    descriptions: [
      "エディターでテキストボックスフォーカス時TABキーを押したときは追加ボタンの動作になるように変更",
      "譜面式作成時の情報生成の動作を改善",
    ],
  },
  {
    date: "2024-11-25",
    descriptions: [
      "譜面一覧のいいねボタンにアニメーション追加",
      "通知でスコアの差がマイナス(抜かし返し)になった場合は通知を削除するように変更",
      `ワードの並びが ん+[AIUEOYN(いずれか)] のばあいにnnの打鍵パターンに齟齬が生じる問題を修正`,
      "ランキングで抜かされた通知の元々のランクの表示が正しくない時がある問題を修正",
      "通知デモ追加",
    ],
  },
  {
    date: "2024-11-24",
    descriptions: ["譜面一覧読み込み時のレイアウト崩れを修正", "背景色を#212529→#1f2427に変更"],
  },
  {
    date: "2024-11-23",
    descriptions: [
      "譜面ページからブラウザの戻るボタンを押したときに譜面ページのトップに戻ってしまう問題を修正",
      "ランキング登録時に前の同ランクのユーザーの拍手数を引き継いで表示されてしまう問題を修正",
      "いいね・拍手した際にページ遷移するといいね、拍手されていない状態に戻るときがある問題を修正",
      "エディターのCtrl+登録ラインクリックの挙動を改善",
      "エディターの次の歌詞をセットするショートカットキーをQ → Tabに変更(テキストボックスにフォーカス時も動作させるため)",
    ],
  },
  {
    date: "2024-11-21",
    descriptions: [
      "ヘッダーをスマホ表示に対応",
      "譜面にいいね・記録に拍手した際にUI更新にラグがある問題を修正",
      "初回ページロード時のフラッシュを修正",
      "Ctrl Shift + リンククリックで別タブ・別ウィンドウ遷移を対応",
    ],
  },
  {
    date: "2024-11-19",
    descriptions: [
      "タイピング設定を追加",
      "新規譜面作成時に動画の譜面が既にあるかチェックする機能追加",
      "音量設定を追加",
    ],
  },
  {
    date: "2024-11-18",
    descriptions: ["タイピング設定の全体タイミング調整・次のワード表示方法を追加"],
  },
  {
    date: "2024-11-17",
    descriptions: ["譜面一覧にランキング登録数表示・登録済み色を追加", "いいね機能追加"],
  },
  {
    date: "2024-11-16",
    descriptions: ["拍手機能を追加"],
  },
  {
    date: "2024-11-15",
    descriptions: [
      "拍手機能のUIを追加(まだ動作しない)",
      "譜面一覧にキーワード検索を追加",
      "タイムラインのキーワード検索時にEnterキーでも検索可能に変更",
      "タイムラインで譜面のキーワード検索機能を追加",
      "タイムラインのキーワード検索機能の処理を改善",
      "譜面一覧の譜面ロード時の挙動を調整",
    ],
  },
  {
    date: "2024-11-13",
    descriptions: ["タイムラインの検索機能の数値絞り込みを追加"],
  },
  {
    date: "2024-11-12",
    descriptions: [
      "タイムラインで入力モード・ユーザー名での検索機能を追加",
      "新規作成時にアップロードエラーが出てしまう問題を修正",
    ],
  },
  {
    date: "2024-11-11",
    descriptions: ["タイムラインにフィルター機能のUIを追加(まだ動作しない)"],
  },
  {
    date: "2024-11-7",
    descriptions: ["タイムラインに入力モード絞り込み機能を追加"],
  },
  {
    date: "2024-11-5",
    descriptions: ["リプレイ機能で稀に正常に動作しない問題を一部修正"],
  },
  {
    date: "2024-10-14",
    descriptions: [
      "タイムラインページをレスポンシブ対応",
      "タイムラインを開いた時に常に最新のデータを取得するように変更",
      "タイムラインにkpm表示・曲の速度表示を追加",
      "タイムラインのデザイン一部変更",
      "譜面一覧に難易度表示(仮)を追加",
    ],
  },
  {
    date: "2024-10-11",
    descriptions: [
      "リプレイデータがロードできない&自分のリプレイデータがロードされてしまう問題を修正",
    ],
  },
  {
    date: "2024-10-7",
    descriptions: ["タイムラインに入力モードの表示を追加"],
  },
  {
    date: "2024-10-6",
    descriptions: ["タイムラインに順位を追加", "タイムラインのリンクをヘッダーに表示"],
  },
  {
    date: "2024-10-5",
    descriptions: ["リザルトタイムラインを追加"],
  },
  {
    date: "2024-09-29",
    descriptions: [
      "譜面の新規作成中に作成中譜面のバックアップを行う機能を追加(バックアップが存在する場合はヘッダー新規作成ボタンクリック時のダイアログにボタンが表示されます。)",
    ],
  },
  {
    date: "2024-09-23",
    descriptions: [
      "稀にpointが次のラインに引き継がれてしまう問題を修正",
      "エディターで[Ctrl+登録済みラインクリック]で直接編集モードになる機能を追加",
      "譜面一覧に元ソースの情報を追加",
      "譜面新規作成時に情報生成の視覚効果を追加",
      "タイピング中F6キーを無効化",
      "練習モードで選択中のライン表示が正しく表示されない時がある問題を修正",
      "採点変更 1key=50 1miss=25 10ms=1 ※再度調整する可能性がありますm(_ _)m",
    ],
  },
  {
    date: "2024-09-22",
    descriptions: [
      "採点変更 1key=25 1miss=25 10ms=1 ※再度調整する可能性がありますm(_ _)m",
      "新規譜面作成後に譜面一覧及び譜面ページがロードされなくなる時がある問題を修正",
      "ゲーム中の処理をリファクタリング(稀にpointが次のラインに引き継がれてしまうバグは要検証)",
      "タイピング中にF7キーを押して本番モードに移動した時にステータスが初期化されない問題を修正。",
    ],
  },
  {
    date: "2024-09-16",
    descriptions: [
      "タイピング時の配点を一部変更 1key=50 1miss=25 (今後また調整する可能性がありますm(_ _)m)",
      "ランキングにクリア率を追加。正確性率はランキングホバー時のミス数の項目に移動",
    ],
  },
  {
    date: "2024-09-15",
    descriptions: [
      "一覧ページの無限スクロール読み込みのタイミングを調整",
      "譜面のタイトルをタイトルとアーティストに分割",
      "譜面新規作成時に動画の情報からタイトルとアーティストを自動生成する機能を追加(Gemini APIを利用)",
      "動画情報からタグキーワードの候補を自動生成する機能を追加",
      "追加済み譜面のプレビュー再生時間を調整",
    ],
  },
  {
    date: "2024-09-8",
    descriptions: [
      "譜面一覧で譜面を40件ずつ読み込むように変更",
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
