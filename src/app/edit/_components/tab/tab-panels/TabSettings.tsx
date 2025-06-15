import { usePlayer } from "@/app/edit/atoms/refAtoms";
import VolumeRange from "@/components/share-components/VolumeRange";
import { CardWithContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import AllTimeAdjust from "./tab-settings/AllTimeAdjust";
import ConvertOptionButtons from "./tab-settings/ConvertOptionButtons";
import LrcConvertButton from "./tab-settings/LrcConvertButton";

const TabSettings = ({ className }: { className: string }) => {
  const { readPlayer } = usePlayer();

  return (
    <CardWithContent className={cn("py-4", className)}>
      <article className="space-y-6">
        <div className="flex items-center justify-between">
          <VolumeRange player={readPlayer()} />
          <LrcConvertButton />
        </div>
        <ConvertOptionButtons />
        <ShortCutKeyList />
        <AllTimeAdjust />
      </article>
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
      <h3 className="mb-4 text-lg font-semibold">ショートカットキー 一覧</h3>
      <div className="flex flex-wrap gap-6 text-base">
        {SHORTCUT_KEY_LIST.map((shortcut, index) => (
          <div key={index}>
            {shortcut.keys.map((key, index) => (
              <kbd
                key={index}
                className="bg-background text-foreground border-border/50 mr-1 rounded border px-2 py-1 font-bold"
              >
                {key}
              </kbd>
            ))}
            :<span className="ml-1">{shortcut.description}</span>
          </div>
        ))}
      </div>
    </section>
  );
};
export default TabSettings;
