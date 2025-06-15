import { useMapTagsState } from "@/app/edit/_lib/atoms/stateAtoms";
import TagBadge from "./TagBadge";

const CHOICE_TAGS = [
  "公式動画",
  "Cover/歌ってみた",
  "J-POP",
  "ボーカロイド/ボカロ",
  "東方ボーカル",
  "洋楽",
  "VTuber",
  "アニメ",
  "ゲーム",
  "英語",
  "英語&日本語",
  "多言語",
  "ラップ",
  "フリー音源",
  "ロック",
  "セリフ読み",
  "キッズ&ファミリー",
  "映画",
  "MAD",
  "Remix",
  "Nightcore",
  "TikTok",
  "音ゲー",
  "簡単",
  "難しい",
  "装飾譜面",
  "ギミック譜面",
  "YouTube Premium",
];

const TagSuggestions = () => {
  const tags = useMapTagsState();

  return (
    <div className="flex flex-col flex-wrap">
      <div className="flex flex-row flex-wrap gap-3">
        {CHOICE_TAGS.map((label, index) => {
          const isSelected = tags.some((tag) => tag.id === label);

          if (isSelected) {
            return null;
          } else {
            return <TagBadge key={index} label={label} bg="#4fd1c5" />;
          }
        })}
      </div>
    </div>
  );
};

export default TagSuggestions;
