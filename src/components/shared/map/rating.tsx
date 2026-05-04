import { Badge } from "@/components/ui/badge";

export const RatingBadge = ({ rating }: { rating: number }) => {
  return (
    <Badge variant={getDifficultyLevelVariant(rating)} size="xs" className="min-w-10 rounded-full">
      <span>★</span>
      <span className="font-bold">{formatMapDifficultyRating(rating)}</span>
    </Badge>
  );
};

function formatMapDifficultyRating(rating: number): string {
  return rating < 1 ? rating.toFixed(1) : String(Math.trunc(rating));
}

export const DIFFICULTY_TIERS = [
  { label: "★1", min: 0, max: 1.99, variant: "level-easy" },
  { label: "★2-3", min: 2, max: 3.99, variant: "level-normal" },
  { label: "★4-5", min: 4, max: 5.99, variant: "level-hard" },
  { label: "★6-8", min: 6, max: 8.99, variant: "level-expert" },
  { label: "★9-11", min: 9, max: 11.99, variant: "level-master" },
  { label: "★12-∞", min: 12, max: null, variant: "level-ultra" },
] as const;

type DifficultyVariant = (typeof DIFFICULTY_TIERS)[number]["variant"];

/** DIFFICULTY_TIERS と同じ区分で rating に対応する variant を返す */
function getDifficultyLevelVariant(rating: number): DifficultyVariant {
  for (const tier of DIFFICULTY_TIERS) {
    if (rating <= (tier.max ?? Infinity)) return tier.variant;
  }
  return "level-ultra";
}
