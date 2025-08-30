import { usePlayer } from "@/app/edit/_lib/atoms/refAtoms";
import VolumeRange from "@/components/shared/VolumeRange";
import { CardWithContent } from "@/components/ui/card";
import AllTimeAdjust from "./tab-settings/AllTimeAdjust";
import ConvertOptionButtons from "./tab-settings/ConvertOptionButtons";
import LrcImportButton from "./tab-settings/LrcConvertButton";

const TabSettings = () => {
  const { readPlayer } = usePlayer();

  return (
    <CardWithContent className={{ card: "py-4", cardContent: "space-y-4 sm:space-y-6" }}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <VolumeRange player={readPlayer()} />
        <LrcImportButton />
      </div>
      <ConvertOptionButtons />
      <ShortCutKeyList />
      <AllTimeAdjust />
    </CardWithContent>
  );
};

const SHORTCUT_KEY_LIST = [
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
    <section className="mt-2">
      <h3 className="mb-3 text-base font-semibold sm:mb-4 sm:text-lg">ショートカットキー 一覧</h3>
      <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 sm:gap-4 sm:text-base lg:grid-cols-3">
        {SHORTCUT_KEY_LIST.map((shortcut, index) => (
          <div key={index} className="flex flex-wrap items-center gap-1">
            <div className="flex flex-wrap gap-1">
              {shortcut.keys.map((key, keyIndex) => (
                <kbd
                  key={keyIndex}
                  className="bg-background text-foreground border-border/50 rounded border px-1.5 py-0.5 text-xs font-bold sm:px-2 sm:py-1 sm:text-sm"
                >
                  {key}
                </kbd>
              ))}
            </div>
            <span className="text-muted-foreground">:</span>
            <span className="break-words">{shortcut.description}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TabSettings;
