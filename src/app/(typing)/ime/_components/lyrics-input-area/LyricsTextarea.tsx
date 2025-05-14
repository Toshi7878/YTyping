import { Flex, Textarea } from "@chakra-ui/react";

interface LyricsTextareaProps {
  lyricsInputRef: React.RefObject<HTMLDivElement>;
}

const LyricsTextarea = ({ lyricsInputRef }: LyricsTextareaProps) => {
  return (
    <Flex bg="background.card" width="80%" alignItems="center" justifyContent="center" mx="auto" ref={lyricsInputRef}>
      <Textarea
        px={4}
        height="100px"
        autoComplete="off"
        resize="none"
        borderRadius={1}
        fontSize="2xl"
        fontWeight="bold"
        letterSpacing={1.5}
        placeholder="（コメント受信をエミュレートします。コメントサーバーへの送信は行いません。）"
      />
    </Flex>
  );
};

export default LyricsTextarea;
