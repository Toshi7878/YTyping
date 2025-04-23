import { Stack } from "@chakra-ui/react";
import ArtistNameInput from "./child/ArtistNameInput";
import CreatorCommentInput from "./child/CreatorCommentInput";
import MusicSourceInput from "./child/MusicSource";
import TitleInput from "./child/TitleInput";
import VideoIdInput from "./child/VideoIdInput";

interface InfoInputFormProps {
  isGeminiLoading: boolean;
}

const InfoInputForm = ({ isGeminiLoading }: InfoInputFormProps) => {
  return (
    <Stack display="flex" flexDirection="column" gap="6">
      <VideoIdInput />
      <Stack>
        <TitleInput isGeminiLoading={isGeminiLoading} />
        <ArtistNameInput isGeminiLoading={isGeminiLoading} />
        <MusicSourceInput isGeminiLoading={isGeminiLoading} />
      </Stack>
      <CreatorCommentInput />
    </Stack>
  );
};

export default InfoInputForm;
