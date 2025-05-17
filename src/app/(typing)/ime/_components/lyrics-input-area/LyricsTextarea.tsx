import { Flex, Textarea } from "@chakra-ui/react";
import { useJudgeTargetWords } from "../../hooks/judgeTargetWords";

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
    <Flex bg="background.card" fontSize="3xl" width="85%" alignItems="center" justifyContent="center" mx="auto">
      <Textarea
        px={4}
        height="130px"
        color="white"
        autoComplete="off"
        resize="none"
        fontSize="90%"
        borderRadius="md"
        fontWeight="bold"
        letterSpacing={1.5}
        placeholder="（コメント受信をエミュレートします。コメントサーバーへの送信は行いません。）"
        onKeyDown={handleKeyDown}
      />
    </Flex>
  );
};

export default LyricsTextarea;
