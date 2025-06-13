import TagInput from "./child/TagInput";
import TagSuggestions from "./child/TagSuggestions";
import GeminiTagSuggestions from "./child/GeminiTagSuggestions";

interface InfoTagProps {
  isGeminiLoading: boolean;
}

const InfoTag = (props: InfoTagProps) => {
  return (
    <div className="flex flex-col gap-5">
      <TagInput />
      <TagSuggestions />
      <GeminiTagSuggestions isGeminiLoading={props.isGeminiLoading} />
    </div>
  );
};

export default InfoTag;
