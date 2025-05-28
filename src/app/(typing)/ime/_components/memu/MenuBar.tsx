import VolumeRange from "@/components/share-components/VolumeRange";
import { useUserAgent } from "@/util/useUserAgent";
import { Box, Flex } from "@chakra-ui/react";
import { useParams } from "next/navigation";
import { useState } from "react";
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
import SettingCard from "./setting-card/SettingCard";

const MenuBar = () => {
  const { id: mapId } = useParams();
  const { readPlayer } = usePlayer();
  const { handleStart, handleEnd } = useSceneControl();
  const scene = useSceneState();
  const userAgent = useUserAgent();

  const resultDialogDisclosure = useResultDialogDisclosure();
  const [isCardVisible, setIsCardVisible] = useState(false);

  return (
    <>
      <Box id="menu_bar" bg="background.card">
        <Flex justifyContent="space-between" mx={4} flexDirection={{ base: "column", lg: "row" }}>
          <Flex flexDirection={{ base: "column", lg: "row" }}>
            {!userAgent.isMobile && <VolumeRange player={readPlayer()} />}
            <MenuSpeedButton isDisabled={true} image={metronome} title="倍速" />
          </Flex>

          <Flex justifyContent="space-between" width={{ base: "100%", lg: "20%" }}>
            <MenuButton image={start} isDisabled={scene === "play"} onClick={handleStart} title="開始" />
            <MenuButton image={trophy} isDisabled={scene !== "play"} onClick={handleEnd} title="終了" />
            <MenuButton
              isDisabled={scene === "ready"}
              onClick={resultDialogDisclosure.onOpen}
              image={reportPencil}
              title="採点結果"
            />
          </Flex>

          <Flex width={{ base: "100%", lg: "30%" }} justifyContent="flex-end">
            <MenuButton image={gear} title="設定" onClick={() => setIsCardVisible(true)} />
            <LinkMenuButton title="タイピングページに戻る" href={`/type/${mapId}`} />
          </Flex>
        </Flex>
      </Box>
      <ResultDialog isOpen={resultDialogDisclosure.open} onClose={resultDialogDisclosure.onClose} />
      <SettingCard isCardVisible={isCardVisible} setIsCardVisible={setIsCardVisible} />
    </>
  );
};

export default MenuBar;
