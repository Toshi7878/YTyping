import { Box, Flex } from "@chakra-ui/react";

const LyricsViewArea = () => {
  const lyrics = ["test", "test", "test"];
  return (
    <Box
      fontFamily="Yu Gothic Ui"
      id="word-area"
      bg="rgba(0, 0, 0, 0.6)"
      width="100%"
      fontWeight="bold"
      textShadow="0px 0px 10px rgba(0, 0, 0, 1)"
      fontSize="4xl"
    >
      <Flex id="lyrics-container" ml={28} flexDirection="column" gap={1} my={1}>
        <Box id="lyrics" color="#fff">
          {lyrics ? lyrics.map((line, index) => <div key={index}>{line}</div>) : <div>歌詞がロード中...</div>}
        </Box>
        <Box id="next_lyrics" color="#aaa" fontSize="60%">
          NEXT: test
        </Box>
      </Flex>

      {/* <div id="music-title-container">
        <img src="/assets/img/music.png" alt="音楽アイコン" />
        <span id="title">{title || ""}</span>
      </div> */}

      {/* <div id="font-size-container">
        <img src="assets\img\control-090.png" id="font-size-arrow-top" className="arrow-highlight mb-2 p-1" />
        <img src="assets\img\control-270.png" id="font-size-arrow-down" className="arrow-highlight p-1" />
      </div> */}
    </Box>
  );
};

export default LyricsViewArea;
