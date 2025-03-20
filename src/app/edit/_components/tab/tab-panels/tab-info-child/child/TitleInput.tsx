import { useMapTitleState, useSetMapTitleState } from "@/app/edit/atoms/stateAtoms";
import { Flex } from "@chakra-ui/react";
import InfoInput from "./child/InfoInput";

interface TitleInputProps {
  isGeminiLoading: boolean;
}

const TitleInput = (props: TitleInputProps) => {
  const setMapTitle = useSetMapTitleState();
  const mapTitle = useMapTitleState();

  return (
    <Flex alignItems="center">
      <InfoInput
        label={"曲名タイトル"}
        placeholder="曲名タイトル"
        inputState={mapTitle}
        setInputState={setMapTitle}
        isRequired={true}
        isGeminiLoading={props.isGeminiLoading}
      />
    </Flex>
  );
};

export default TitleInput;
