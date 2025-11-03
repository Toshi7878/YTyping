import type { StaticImageData } from "next/image";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { ComponentProps } from "react";
import { VolumeRange } from "@/components/shared/volume-range";
import { Button } from "@/components/ui/button";
import start from "../../_img/control.png";
import gear from "../../_img/gear.png";
import metronome from "../../_img/metronome.png";
import reportPencil from "../../_img/report--pencil.png";
import trophy from "../../_img/trophy.png";
import { usePlayer } from "../../_lib/atoms/read-atoms";

import { useResultDialogDisclosure, useSceneState } from "../../_lib/atoms/state-atoms";
import { useSceneControl } from "../../_lib/hooks/scene-control";
import { ResultDialog } from "./result-dialog";
import { SettingPopover } from "./setting-popover";

const ICON_SIZE = "16";

export const MenuBar = () => {
  const { id: mapId } = useParams();
  const { readPlayer } = usePlayer();
  const { handleStart, handleEnd } = useSceneControl();
  const scene = useSceneState();

  const resultDialogDisclosure = useResultDialogDisclosure();

  return (
    <>
      <div id="menu_bar" className="bg-card">
        <div className="mx-4 flex flex-col items-center justify-between lg:flex-row">
          <div className="flex flex-col items-center lg:flex-row">
            <VolumeRange YTPlayer={readPlayer()} />
            <MenuButton disabled={true} image={metronome} title="倍速" />
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
          <div className="flex lg:w-1/5">
            <SettingPopover triggerButton={<MenuButton image={gear} title="設定" />} />
            <Link href={`/type/${mapId}`} replace>
              <Button variant="outline" size="sm" className="gap-2">
                タイピングページに戻る
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <ResultDialog isOpen={resultDialogDisclosure.open} onClose={resultDialogDisclosure.onClose} />
    </>
  );
};

interface MenuButtonProps {
  image?: StaticImageData;
  title: string;
  onClick?: () => void;
}

const MenuButton = ({ image, title, onClick, ...props }: MenuButtonProps & ComponentProps<typeof Button>) => {
  return (
    <Button variant="ghost" size="sm" onClick={onClick} className="gap-2" {...props}>
      {image && <Image src={image} alt={title} width={ICON_SIZE} height={ICON_SIZE} className="shrink-0" />}
      {title}
    </Button>
  );
};
