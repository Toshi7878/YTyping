import { useMapArtistState, useSetMapArtist } from "@/app/edit/_lib/atoms/stateAtoms";
import InfoInput from "./child/InfoInput";

interface ArtistNameInputProps {
  isGeminiLoading: boolean;
}

const ArtistNameInput = (props: ArtistNameInputProps) => {
  const setMapArtistName = useSetMapArtist();
  const mapArtistName = useMapArtistState();

  return (
    <div className="flex items-center">
      <InfoInput
        label={"アーティスト名"}
        placeholder="アーティスト名"
        inputState={mapArtistName}
        setInputState={setMapArtistName}
        isRequired={true}
        isGeminiLoading={props.isGeminiLoading}
      />
    </div>
  );
};

export default ArtistNameInput;
