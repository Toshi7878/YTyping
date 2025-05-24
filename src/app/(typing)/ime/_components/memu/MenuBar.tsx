import VolumeRange from "@/components/share-components/VolumeRange";
import { useUserAgent } from "@/util/useUserAgent";
import { Box, Flex } from "@chakra-ui/react";
import { useParams } from "next/navigation";
import { usePlayer } from "../../atom/refAtoms";
import { useResultDialogDisclosure, useSceneState } from "../../atom/stateAtoms";
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
  const userAgent = useUserAgent();

  const resultDialogDisclosure = useResultDialogDisclosure();

  return (
    <>
      <Box bg="background.card">
        <Flex justifyContent="space-between" mx={4}>
          <Flex>
            {!userAgent.isMobile && <VolumeRange player={readPlayer()} />}
            <MenuSpeedButton isDisabled={true} image={metronome} title="倍速" />
          </Flex>

          <Flex justifyContent="space-between" width="20%">
            <MenuButton image={start} isDisabled={scene === "play"} onClick={handleStart} title="開始" />
            <MenuButton image={trophy} isDisabled={scene !== "play"} onClick={handleEnd} title="終了" />
            <MenuButton
              isDisabled={scene === "ready"}
              onClick={resultDialogDisclosure.onOpen}
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
      <ResultDialog isOpen={resultDialogDisclosure.open} onClose={resultDialogDisclosure.onClose} />
    </>
  );
};

export default MenuBar;
