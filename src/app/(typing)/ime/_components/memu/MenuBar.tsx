import VolumeRange from "@/components/share-components/VolumeRange";
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

  const resultDialogDisclosure = useResultDialogDisclosure();
  const [isCardVisible, setIsCardVisible] = useState(false);

  return (
    <>
      <div id="menu_bar" className="bg-card">
        <div className="mx-4 flex flex-col justify-between lg:flex-row">
          <div className="flex flex-col lg:flex-row">
            <VolumeRange player={readPlayer()} />
            <MenuSpeedButton disabled={true} image={metronome} title="倍速" />
          </div>

          <div className="flex w-full justify-between lg:w-1/5">
            <MenuButton image={start} disabled={scene === "play"} onClick={handleStart} title="開始" />
            <MenuButton image={trophy} disabled={scene !== "play"} onClick={handleEnd} title="終了" />
            <MenuButton
              disabled={scene === "ready"}
              onClick={resultDialogDisclosure.onOpen}
              image={reportPencil}
              title="採点結果"
            />
          </div>

          <div className="flex w-full justify-end lg:w-[30%]">
            <MenuButton image={gear} title="設定" onClick={() => setIsCardVisible(true)} />
            <LinkMenuButton title="タイピングページに戻る" href={`/type/${mapId}`} />
          </div>
        </div>
      </div>
      <ResultDialog isOpen={resultDialogDisclosure.open} onClose={resultDialogDisclosure.onClose} />
      <SettingCard isCardVisible={isCardVisible} setIsCardVisible={setIsCardVisible} />
    </>
  );
};

export default MenuBar;
