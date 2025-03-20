import { useMapSourceState, useSetMapSourceState } from "@/app/edit/atoms/stateAtoms";
import { Flex } from "@chakra-ui/react";
import InfoInput from "./child/InfoInput";

interface MusicSourceInputProps {
  isGeminiLoading: boolean;
}

const MusicSourceInput = (props: MusicSourceInputProps) => {
  const setMusicSouce = useSetMapSourceState();
  const musicSource = useMapSourceState();

  return (
    <Flex alignItems="center">
      <InfoInput
        label={"ソース"}
        placeholder="曲が使用されているアニメ・ドラマ・映画タイトルを入力"
        inputState={musicSource}
        setInputState={setMusicSouce}
        isRequired={false}
        isGeminiLoading={props.isGeminiLoading}
      />
    </Flex>
  );
};

export default MusicSourceInput;
