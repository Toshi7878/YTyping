
const shortCutList = [
  { keys: ["←", "→"], description: "3秒スキップ" },
  { keys: ["↑", "↓"], description: "選択行の移動" },
  { keys: ["S"], description: "追加" },
  { keys: ["Shift+S"], description: "空行を追加" },
  { keys: ["U"], description: "変更" },
  { keys: ["Delete"], description: "削除" },
  { keys: ["Esc"], description: "再生・停止" },
  { keys: ["D"], description: "選択行の解除" },
  { keys: ["Tab"], description: "歌詞追加テキストエリアフォーカス切り替え" },
  { keys: ["Ctrl+Shift+F"], description: "全体よみ置換" },
  { keys: ["Ctrl+Z"], description: "元に戻す" },
  { keys: ["Ctrl+Y"], description: "繰り返し" },
  { keys: ["Enter"], description: "歌詞テキストボックスの選択した文字にRubyタグを挿入" },
  { keys: ["Ctrl+登録済み歌詞クリック"], description: "直接編集モード" },
];

const ShortCutKeyList = () => {
  return (
    <div className="mt-2">
      <h3 className="text-lg font-semibold mb-4">
        ショートカットキー 一覧
      </h3>
      <div className="flex flex-wrap gap-6 text-base">
        {shortCutList.map((shortcut, index) => (
          <div key={index}>
            {shortcut.keys.map((key, index) => (
              <kbd
                key={index}
                className="font-bold bg-background text-foreground border border-border/50 px-2 py-1 rounded mr-1"
              >
                {key}
              </kbd>
            ))}
            :
            <span className="ml-1">
              {shortcut.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShortCutKeyList;
