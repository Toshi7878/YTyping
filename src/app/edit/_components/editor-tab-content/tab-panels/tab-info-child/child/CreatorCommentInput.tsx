import { useCreatorCommentAtom, useSetCreatorCommentAtom } from "@/app/edit/edit-atom/editAtom";
import { Flex } from "@chakra-ui/react";
import InfoInput from "./child/InfoInput";

const CreatorCommentInput = () => {
  const setCreatorComment = useSetCreatorCommentAtom();
  const creatorComment = useCreatorCommentAtom();

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
