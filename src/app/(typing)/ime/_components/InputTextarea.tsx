import { Flex, Textarea } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { useInputTextarea } from "../atom/refAtoms";
import { useReadGameUtilParams, useReadMap, useTextareaPlaceholderTypeState } from "../atom/stateAtoms";
import { useJudgeTargetWords } from "../hooks/judgeTargetWords";
import useSceneControl from "../hooks/sceneControl";
import { useSkip } from "../hooks/skip";

const InputTextarea = () => {
  const judgeTargetWords = useJudgeTargetWords();
  const handleSkip = useSkip();
  const { handleEnd } = useSceneControl();
  const { readGameUtilParams } = useReadGameUtilParams();
  const readMap = useReadMap();
  const textareaPlaceholderType = useTextareaPlaceholderTypeState();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey) {
      const value = e.currentTarget.value;
      e.preventDefault();
      judgeTargetWords(value);

      switch (value.toLowerCase()) {
        case "skip":
          const { skipRemainTime } = readGameUtilParams();
          if (skipRemainTime !== null) {
            handleSkip();
          }
          break;
        case "end":
          const map = readMap();
          const { count } = readGameUtilParams();
          if (!map.lines[count]) {
            handleEnd();
          }
          break;
      }

      e.currentTarget.value = "";
    }
  };

  const lyricsTextareaRef = useRef<HTMLTextAreaElement>(null);
  const { writeInputTextarea: writeLyricsTextarea } = useInputTextarea();

  useEffect(() => {
    if (lyricsTextareaRef.current) {
      writeLyricsTextarea(lyricsTextareaRef.current);
    }
  }, [writeLyricsTextarea]);

  const placeholder =
    textareaPlaceholderType === "skip"
      ? "ワードを入力（Enterで送信）\nskipを入力してスキップできます"
      : textareaPlaceholderType === "end"
      ? "ワードを入力（Enterで送信）\nendを入力して終了できます"
      : "ワードを入力（Enterで送信）";

  return (
    <Flex bg="background.card" fontSize="3xl" width="85%" alignItems="center" justifyContent="center" mx="auto">
      <Textarea
        ref={lyricsTextareaRef}
        px={4}
        height="130px"
        color="white"
        autoComplete="off"
        resize="none"
        fontSize="90%"
        borderRadius="md"
        fontWeight="bold"
        letterSpacing={1.5}
        placeholder={placeholder}
        onKeyDown={handleKeyDown}
      />
    </Flex>
  );
};

export default InputTextarea;
