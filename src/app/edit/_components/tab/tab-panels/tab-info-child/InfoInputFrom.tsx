import { Stack } from "@chakra-ui/react";
import ArtistNameInput from "./child/ArtistNameInput";
import CreatorCommentInput from "./child/CreatorCommentInput";
import MusicSourceInput from "./child/MusicSource";
import TitleInput from "./child/TitleInput";
import VideoIdInput from "./child/VideoIdInput";

interface InfoInputFormProps {
  isGeminiLoading: boolean;
}

const InfoInputForm = (props: InfoInputFormProps) => {
  return (
    <Stack display="flex" flexDirection="column" gap="6">
      <VideoIdInput />
      <Stack>
        <TitleInput isGeminiLoading={props.isGeminiLoading} />
        <ArtistNameInput isGeminiLoading={props.isGeminiLoading} />
        <MusicSourceInput isGeminiLoading={props.isGeminiLoading} />
      </Stack>
      <CreatorCommentInput />
    </Stack>
  );
};

export default InfoInputForm;
