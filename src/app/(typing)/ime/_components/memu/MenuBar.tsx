import VolumeRange from "@/components/share-components/VolumeRange";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { useParams } from "next/navigation";
import { useState } from "react";
import start from "../../_img/control.png";
import gear from "../../_img/gear.png";
import metronome from "../../_img/metronome.png";
import reportPencil from "../../_img/report--pencil.png";
import trophy from "../../_img/trophy.png";
import { usePlayer } from "../../_lib/atoms/refAtoms";
import { useResultDialogDisclosure, useSceneState } from "../../_lib/atoms/stateAtoms";
import useSceneControl from "../../_lib/hooks/sceneControl";
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
            <Popover open={isCardVisible} onOpenChange={setIsCardVisible}>
              <PopoverTrigger asChild>
                <MenuButton image={gear} title="設定" />
              </PopoverTrigger>
              <SettingCard isCardVisible={isCardVisible} setIsCardVisible={setIsCardVisible} />
            </Popover>
            <LinkMenuButton title="タイピングページに戻る" href={`/type/${mapId}`} />
          </div>
        </div>
      </div>
      <ResultDialog isOpen={resultDialogDisclosure.open} onClose={resultDialogDisclosure.onClose} />
    </>
  );
};

export default MenuBar;
