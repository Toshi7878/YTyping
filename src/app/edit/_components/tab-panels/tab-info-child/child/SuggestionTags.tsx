import { useMapTagsState, useSetMapTags } from "@/app/edit/_lib/atoms/stateAtoms";

import { useGeminiTagsState } from "@/app/edit/_lib/atoms/stateAtoms";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { VariantProps } from "class-variance-authority";

interface SuggestionTagsProps {
  isGeminiLoading: boolean;
}

export default function SuggestionTags({ isGeminiLoading }: SuggestionTagsProps) {
  return (
    <div className="flex flex-col gap-5">
      <TemplateTags />
      <GeminiSuggestionTags isGeminiLoading={isGeminiLoading} />
    </div>
  );
}

interface GeminiTagSuggestionsProps {
  isGeminiLoading: boolean;
}

const GeminiSuggestionTags = (props: GeminiTagSuggestionsProps) => {
  const tags = useMapTagsState();
  const geminiTags = useGeminiTagsState();

  if (props.isGeminiLoading) {
    return (
      <div className="flex flex-col flex-wrap">
        <div className="flex flex-row flex-wrap gap-3">
          <Skeleton className="h-5 w-full" />
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex flex-row flex-wrap gap-3">
        {geminiTags &&
          geminiTags.map((label, index) => {
            const isSelected = tags.some((tag) => tag === label);

            if (isSelected) {
              return null;
            } else {
              return <SuggestionTagBadge key={index} label={label} variant="primary-light" />;
            }
          })}
      </div>
    );
  }
};

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

const TemplateTags = () => {
  const tags = useMapTagsState();

  return (
    <div className="flex flex-row flex-wrap gap-3">
      {CHOICE_TAGS.map((label, index) => {
        const isSelected = tags.some((tag) => tag === label);

        if (isSelected) {
          return null;
        } else {
          return <SuggestionTagBadge key={index} label={label} variant="secondary-light" />;
        }
      })}
    </div>
  );
};

interface TagBadgeProps {
  label: string;
  variant?: VariantProps<typeof badgeVariants>["variant"];
}

const SuggestionTagBadge = ({ label, variant }: TagBadgeProps) => {
  const setTags = useSetMapTags();

  return (
    <Badge
      className="cursor-pointer rounded-lg text-sm opacity-70 hover:opacity-100"
      variant={variant}
      onClick={() => setTags({ type: "add", payload: label })}
    >
      {label}
    </Badge>
  );
};
