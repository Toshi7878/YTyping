import { useMapCommentState, useSetMapComment } from "@/app/edit/atoms/stateAtoms";
import InfoInput from "./child/InfoInput";

const CreatorCommentInput = () => {
  const setCreatorComment = useSetMapComment();
  const creatorComment = useMapCommentState();

  return (
    <div className="flex items-center">
      <InfoInput
        label={"コメント"}
        placeholder="譜面の情報や感想など、なんでもコメントOKです"
        inputState={creatorComment}
        setInputState={setCreatorComment}
      />
    </div>
  );
};

export default CreatorCommentInput;
