import { useMapCommentState, useSetMapComment } from "@/app/edit/atoms/stateAtoms";
import { Flex } from "@chakra-ui/react";
import InfoInput from "./child/InfoInput";

const CreatorCommentInput = () => {
  const setCreatorComment = useSetMapComment();
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
