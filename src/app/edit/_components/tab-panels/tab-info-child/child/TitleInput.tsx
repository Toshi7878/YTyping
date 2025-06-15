import { useMapTitleState, useSetMapTitle } from "@/app/edit/_lib/atoms/stateAtoms";
import { FloatingLabelInput } from "@/components/ui/input/floating-label-input";

interface TitleInputProps {
  isGeminiLoading: boolean;
}

const TitleInput = (props: TitleInputProps) => {
  const setMapTitle = useSetMapTitle();
  const mapTitle = useMapTitleState();

  return (
    <div className="flex items-center">
      <FloatingLabelInput
        label={"曲名タイトル"}
        placeholder="曲名タイトル"
        value={mapTitle}
        // isGeminiLoading={props.isGeminiLoading}
      />
    </div>
  );
};

export default TitleInput;
