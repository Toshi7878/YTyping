import VolumeRange from "@/components/share-components/VolumeRange";
import { Flex } from "@chakra-ui/react";
import { usePlayer } from "../../atom/refAtoms";
import { useSceneState } from "../../atom/stateAtoms";
import useVideoControl from "../../hooks/videoControl";
import start from "../../img/control.png";
import gear from "../../img/gear.png";
import metronome from "../../img/metronome.png";
import reportPencil from "../../img/report--pencil.png";
import trophy from "../../img/trophy.png";
import MenuButton from "./menu-item/MenuButton";
import MenuSpeedButton from "./menu-item/MenuSpeedButton";

const MenuBar = () => {
  const { readPlayer } = usePlayer();
  const { handleStart, handleEnd } = useVideoControl();
  const scene = useSceneState();

  return (
    <Flex justifyContent="space-between" bg="background.card">
      <Flex ml={6}>
        <VolumeRange player={readPlayer()} />
        <MenuSpeedButton image={metronome} onClick={() => {}} title="倍速" />
      </Flex>

      <Flex justifyContent="space-between" width="20%">
        <MenuButton image={start} isDisabled={scene === "play"} onClick={handleStart} title="開始" />
        <MenuButton image={trophy} isDisabled={scene !== "play"} onClick={handleEnd} title="停止" />
        <MenuButton image={reportPencil} title="採点結果" />
      </Flex>

      <Flex width="30%" justifyContent="flex-end">
        <MenuButton image={gear} onClick={() => {}} title="設定" />
      </Flex>
    </Flex>
  );
};

export default MenuBar;
