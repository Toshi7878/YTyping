import { Flex, Textarea } from "@chakra-ui/react";
import { useJudgeTargetWords } from "../../hooks/scoring";

const LyricsTextarea = () => {
  const judgeTargetWords = useJudgeTargetWords();
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey) {
      e.preventDefault();
      judgeTargetWords(e.currentTarget.value);
      e.currentTarget.value = "";
    }
  };

  return (
    <Flex bg="background.card" width="85%" alignItems="center" justifyContent="center" mx="auto">
      <Textarea
        px={4}
        height="120px"
        color="white"
        autoComplete="off"
        resize="none"
        borderRadius="md"
        fontSize="2xl"
        fontWeight="bold"
        letterSpacing={1.5}
        placeholder="（コメント受信をエミュレートします。コメントサーバーへの送信は行いません。）"
        onKeyDown={handleKeyDown}
      />
    </Flex>
  );
};

export default LyricsTextarea;
