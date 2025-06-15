import CreatorCommentInput from "./child/CreatorCommentInput";
import VideoIdInput from "./child/VideoIdInput";

interface InfoInputFormProps {
  isGeminiLoading: boolean;
}

const InfoInputForm = ({ isGeminiLoading }: InfoInputFormProps) => {
  return (
    <div className="flex flex-col gap-6">
      <VideoIdInput />
      <div className="flex flex-col gap-4">
        {/* <TitleInput isGeminiLoading={isGeminiLoading} /> */}
        {/* <ArtistNameInput isGeminiLoading={isGeminiLoading} /> */}
        {/* <MusicSourceInput isGeminiLoading={isGeminiLoading} /> */}
      </div>
      <CreatorCommentInput />
    </div>
  );
};

export default InfoInputForm;
