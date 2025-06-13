import { useMapTitleState, useSetMapTitle } from "@/app/edit/atoms/stateAtoms";
import InfoInput from "./child/InfoInput";

interface TitleInputProps {
  isGeminiLoading: boolean;
}

const TitleInput = (props: TitleInputProps) => {
  const setMapTitle = useSetMapTitle();
  const mapTitle = useMapTitleState();

  return (
    <div className="flex items-center">
      <InfoInput
        label={"曲名タイトル"}
        placeholder="曲名タイトル"
        inputState={mapTitle}
        setInputState={setMapTitle}
        isRequired={true}
        isGeminiLoading={props.isGeminiLoading}
      />
    </div>
  );
};

export default TitleInput;
