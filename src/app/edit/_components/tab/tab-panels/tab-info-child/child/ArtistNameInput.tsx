import { useMapArtistState, useSetMapArtistState } from "@/app/edit/atoms/stateAtoms";
import { Flex } from "@chakra-ui/react";
import InfoInput from "./child/InfoInput";

interface ArtistNameInputProps {
  isGeminiLoading: boolean;
}

const ArtistNameInput = (props: ArtistNameInputProps) => {
  const setMapArtistName = useSetMapArtistState();
  const mapArtistName = useMapArtistState();

  return (
    <Flex alignItems="center">
      <InfoInput
        label={"アーティスト名"}
        placeholder="アーティスト名"
        inputState={mapArtistName}
        setInputState={setMapArtistName}
        isRequired={true}
        isGeminiLoading={props.isGeminiLoading}
      />
    </Flex>
  );
};

export default ArtistNameInput;
