import { useGeminiTagsState, useMapTagsState } from "@/app/edit/_lib/atoms/stateAtoms";
import { Skeleton } from "@/components/ui/skeleton";
import SuggestionTagBadge from "./TagBadge";

interface GeminiTagSuggestionsProps {
  isGeminiLoading: boolean;
}

const GeminiTagSuggestions = (props: GeminiTagSuggestionsProps) => {
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

export default GeminiTagSuggestions;
