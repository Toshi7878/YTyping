import { useSetIsYTStarted, useSetVideoId, useVideoIdState } from "@/app/edit/atoms/stateAtoms";
import { extractYouTubeVideoId } from "@/util/global-hooks/extractYTId";
import { z } from "@/validator/z";
import { Button, Flex, FormLabel, Input, InputGroup, InputLeftAddon } from "@chakra-ui/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

const videoIdSchema = z
  .string()
  .length(11)
  .regex(/^[!-~]+$/);

const VideoIdInput = () => {
  const searchParams = useSearchParams();
  const isNewCreateMap = !!searchParams.get("new");

  const videoId = useVideoIdState();
  const [changeVideoId, setChangeVideoId] = useState(videoId);
  const setIsYTStarted = useSetIsYTStarted();
  const setVideoId = useSetVideoId();
  const canChangeVideo = videoIdSchema.safeParse(changeVideoId).success && videoId !== changeVideoId;
  return (
    <Flex alignItems="center" hidden={isNewCreateMap ? true : false}>
      <FormLabel mb="0" width="150px" fontWeight="bold">
        YouTube URL
      </FormLabel>
      <InputGroup as={Flex} flexDirection={{ base: "column", lg: "row" }} size="sm">
        <InputLeftAddon isTruncated>https://www.youtube.com/watch?v=</InputLeftAddon>

        <Input
          placeholder="YouTube URL(動画URLをそのまま貼り付けできます)"
          size="sm"
          maxLength={11} // YouTubeのID11文字に制限
          fontWeight="bold"
          value={changeVideoId}
          onPaste={async (e) => {
            const url = await navigator.clipboard.readText();
            const inputElement = e.target as HTMLInputElement;
            const videoId = extractYouTubeVideoId(url);
            if (videoId) {
              inputElement.value = videoId;
              setChangeVideoId(videoId);
            }
          }}
          onChange={(e) => setChangeVideoId(e.target.value)}
        />
        <Button
          variant={"outline"}
          colorScheme={canChangeVideo ? "yellow" : ""}
          opacity={canChangeVideo ? 1 : 0.5}
          cursor={canChangeVideo ? "" : "not-allowed"}
          onClick={() => {
            if (canChangeVideo) {
              setIsYTStarted(false);
              setVideoId(changeVideoId);
            }
          }}
        >
          切替
        </Button>
      </InputGroup>
    </Flex>
  );
};

export default VideoIdInput;
