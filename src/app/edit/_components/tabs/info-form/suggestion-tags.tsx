import type { VariantProps } from "class-variance-authority";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import type { badgeVariants } from "@/components/ui/badge";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { TAG_MAX_LENGTH } from "./card";

interface SuggestionTagsProps {
  isAIFetching?: boolean;
  aiTags?: string[];
}

export const SuggestionTags = ({ isAIFetching, aiTags }: SuggestionTagsProps) => {
  return (
    <div className="flex flex-col gap-5">
      <TemplateTags />
      <AISuggestionTags isAIFetching={isAIFetching ?? false} aiTags={aiTags ?? []} />
    </div>
  );
};

interface AITagSuggestionsProps {
  isAIFetching: boolean;
  aiTags: string[];
}

const AISuggestionTags = ({ isAIFetching, aiTags }: AITagSuggestionsProps) => {
  const control = useFormContext();
  const tags = control.watch("tags");

  if (isAIFetching) {
    return (
      <div className="flex flex-col flex-wrap">
        <div className="flex flex-row flex-wrap gap-3">
          <Skeleton className="h-5 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-row flex-wrap gap-3">
      {aiTags.map((label) => {
        const isSelected = tags.some((tag: string) => tag === label);
        if (isSelected) return null;

        return <SuggestionTagBadge key={label} label={label} variant="primary-light" />;
      })}
    </div>
  );
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
  const control = useFormContext();
  const tags = control.watch("tags");

  return (
    <div className="flex flex-row flex-wrap gap-3">
      {CHOICE_TAGS.map((label, index) => {
        const isSelected = tags.some((tag: string) => tag === label);
        if (isSelected) return null;

        return <SuggestionTagBadge key={`${index}-${label}`} label={label} variant="secondary-light" />;
      })}
    </div>
  );
};

interface TagBadgeProps {
  label: string;
  variant?: VariantProps<typeof badgeVariants>["variant"];
}

const SuggestionTagBadge = ({ label, variant }: TagBadgeProps) => {
  const control = useFormContext<{ tags: string[] }>();
  const tags = control.watch("tags") ?? [];

  return (
    <Badge
      className={cn(
        "cursor-pointer rounded-lg text-sm opacity-70 hover:opacity-100",
        tags.length >= TAG_MAX_LENGTH && "cursor-default opacity-50 hover:opacity-50",
      )}
      variant={variant}
      onClick={() => {
        const currentTags = tags;
        if (currentTags.length < TAG_MAX_LENGTH) {
          control.setValue("tags", [...currentTags, label], {
            shouldDirty: true,
            shouldTouch: true,
          });
        } else {
          toast.warning("タグは最大10個まで追加できます");
        }
      }}
    >
      {label}
    </Badge>
  );
};
