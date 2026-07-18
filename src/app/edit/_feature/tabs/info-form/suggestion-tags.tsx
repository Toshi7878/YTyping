import type { VariantProps } from "class-variance-authority";
import { toast } from "sonner";
import type { badgeVariants } from "@/ui/badge";
import { Badge } from "@/ui/badge";
import { Skeleton } from "@/ui/skeleton";
import { cn } from "@/utils/cn";
import { TAG_MAX_LENGTH } from "./card";

interface SuggestionTagsProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  isAIFetching?: boolean;
  aiTags?: string[];
}

export const SuggestionTags = ({ tags, onTagsChange, isAIFetching, aiTags }: SuggestionTagsProps) => {
  return (
    <div className="flex flex-col gap-5">
      <TemplateTags tags={tags} onTagsChange={onTagsChange} />
      <AISuggestionTags
        tags={tags}
        onTagsChange={onTagsChange}
        isAIFetching={isAIFetching ?? false}
        aiTags={aiTags ?? []}
      />
    </div>
  );
};

interface TagListProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
}

interface AITagSuggestionsProps extends TagListProps {
  isAIFetching: boolean;
  aiTags: string[];
}

const AISuggestionTags = ({ tags, onTagsChange, isAIFetching, aiTags }: AITagSuggestionsProps) => {
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
        const isSelected = tags.some((tag) => tag === label);
        if (isSelected) return null;

        return (
          <SuggestionTagBadge
            key={label}
            label={label}
            tags={tags}
            onTagsChange={onTagsChange}
            variant="primary-light"
          />
        );
      })}
    </div>
  );
};

const CHOICE_TAGS = [
  "公式動画",
  "Cover/歌ってみた",
  "アニメ",
  "J-POP",
  "ボーカロイド/ボカロ",
  "VTuber",
  "TikTok",
  "東方ボーカル",
  "映画",
  "ゲーム",
  "音ゲー",
  "洋楽",
  "多言語",
  "ロック",
  "ラップ",
  "フリー音源",
  "セリフ読み",
  "キッズ&ファミリー",
  "MAD",
  "Remix",
  "Nightcore",
  "OSU",
  "装飾譜面",
  "ギミック譜面",
  "YouTube Premium",
];

const TemplateTags = ({ tags, onTagsChange }: TagListProps) => {
  return (
    <div className="flex flex-row flex-wrap gap-3">
      {CHOICE_TAGS.map((label) => {
        const isSelected = tags.some((tag) => tag === label);
        if (isSelected) return null;

        return (
          <SuggestionTagBadge
            key={label}
            label={label}
            tags={tags}
            onTagsChange={onTagsChange}
            variant="secondary-light"
          />
        );
      })}
    </div>
  );
};

interface TagBadgeProps extends TagListProps {
  label: string;
  variant?: VariantProps<typeof badgeVariants>["variant"];
}

const SuggestionTagBadge = ({ label, tags, onTagsChange, variant }: TagBadgeProps) => {
  return (
    <Badge
      className={cn(
        "cursor-pointer rounded-lg text-sm opacity-70 hover:opacity-100",
        tags.length >= TAG_MAX_LENGTH && "cursor-default opacity-50 hover:opacity-50",
      )}
      variant={variant}
      onClick={() => {
        if (tags.length < TAG_MAX_LENGTH) {
          onTagsChange([...tags, label]);
        } else {
          toast.warning("タグは最大10個まで追加できます");
        }
      }}
    >
      {label}
    </Badge>
  );
};
