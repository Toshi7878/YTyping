import VolumeRange from "@/components/share-components/VolumeRange";
import { Flex } from "@chakra-ui/react";
import { usePlayer } from "../../atom/refAtoms";
import start from "../../img/control.png";
import gear from "../../img/gear.png";
import metronome from "../../img/metronome.png";
import reportPencil from "../../img/report--pencil.png";
import trophy from "../../img/trophy.png";
import MenuButton from "./menu-item/MenuButton";
import MenuSpeedButton from "./menu-item/MenuSpeedButton";
export const ICON_SIZE = "4";

interface MenuBarProps {
  menubarRef: React.RefObject<HTMLDivElement>;
}

const MenuBar = ({ menubarRef }: MenuBarProps) => {
  const { readPlayer } = usePlayer();

  return (
    <Flex justifyContent="space-between" bg="background.card" borderRadius={1} ref={menubarRef}>
      <Flex ml={6}>
        <VolumeRange player={readPlayer()} />
        <MenuSpeedButton image={metronome} onClick={() => {}} title="倍速" />
      </Flex>

      <Flex justifyContent="space-between" width="20%">
        <MenuButton image={start} onClick={() => {}} title="開始" />
        <MenuButton image={trophy} onClick={() => {}} title="停止" />
        <MenuButton image={reportPencil} onClick={() => {}} title="採点結果" />
      </Flex>

      <Flex width="30%" justifyContent="flex-end">
        <MenuButton image={gear} onClick={() => {}} title="設定" />
      </Flex>
    </Flex>
  );
};

export default MenuBar;
