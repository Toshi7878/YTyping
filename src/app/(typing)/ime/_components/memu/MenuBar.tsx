import VolumeRange from "@/components/share-components/VolumeRange";
import { Box, Flex, useDisclosure } from "@chakra-ui/react";
import { useParams } from "next/navigation";
import { usePlayer } from "../../atom/refAtoms";
import { useSceneState } from "../../atom/stateAtoms";
import useSceneControl from "../../hooks/sceneControl";
import start from "../../img/control.png";
import gear from "../../img/gear.png";
import metronome from "../../img/metronome.png";
import reportPencil from "../../img/report--pencil.png";
import trophy from "../../img/trophy.png";
import LinkMenuButton from "./menu-item/LinkMenuButton";
import MenuButton from "./menu-item/MenuButton";
import MenuSpeedButton from "./menu-item/MenuSpeedButton";
import ResultDialog from "./ResultDialog";

const MenuBar = () => {
  const { id: mapId } = useParams();
  const { readPlayer } = usePlayer();
  const { handleStart, handleEnd } = useSceneControl();
  const scene = useSceneState();

  const scoreDisclosure = useDisclosure();

  return (
    <>
      <Box bg="background.card">
        <Flex justifyContent="space-between" mx={4}>
          <Flex>
            <VolumeRange player={readPlayer()} />
            <MenuSpeedButton isDisabled={true} image={metronome} title="倍速" />
          </Flex>

          <Flex justifyContent="space-between" width="20%">
            <MenuButton image={start} isDisabled={scene === "play"} onClick={handleStart} title="開始" />
            <MenuButton image={trophy} isDisabled={scene !== "play"} onClick={handleEnd} title="終了" />
            <MenuButton
              isDisabled={scene === "ready"}
              onClick={scoreDisclosure.onOpen}
              image={reportPencil}
              title="採点結果"
            />
          </Flex>

          <Flex width="30%" justifyContent="flex-end">
            <MenuButton image={gear} isDisabled={true} title="設定" />
            <LinkMenuButton title="タイピングページに戻る" href={`/type/${mapId}`} />
          </Flex>
        </Flex>
      </Box>
      <ResultDialog isOpen={scoreDisclosure.isOpen} onClose={scoreDisclosure.onClose} />
    </>
  );
};

export default MenuBar;
