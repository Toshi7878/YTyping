import { useMapCommentState, useSetMapCommentState } from "@/app/edit/atoms/stateAtoms";
import { Flex } from "@chakra-ui/react";
import InfoInput from "./child/InfoInput";

const CreatorCommentInput = () => {
  const setCreatorComment = useSetMapCommentState();
  const creatorComment = useMapCommentState();

  return (
    <Flex alignItems="center">
      <InfoInput
        label={"コメント"}
        placeholder="譜面の情報や感想など、なんでもコメントOKです"
        inputState={creatorComment}
        setInputState={setCreatorComment}
      />
    </Flex>
  );
};

export default CreatorCommentInput;
