import type { StaticImageData } from "next/image";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { ComponentProps } from "react";
import { VolumeRange } from "@/shared/volume-range";
import { Button } from "@/ui/button";
import start from "../../_img/control.png";
import gear from "../../_img/gear.png";
import metronome from "../../_img/metronome.png";
import reportPencil from "../../_img/report--pencil.png";
import trophy from "../../_img/trophy.png";

import { useSceneState } from "../../_lib/atoms/state";
import { useYTPlayer } from "../../_lib/atoms/yt-player";
import { handleSceneEnd, startPlayFlow } from "../../_lib/core/scene-control";
import { openResultDialog, ResultDialog } from "./result-dialog";
import { SettingPopover } from "./setting-popover";

const ICON_SIZE = "16";

export const MenuBar = () => {
  const { id: mapId } = useParams();
  const YTPlayer = useYTPlayer();
  const scene = useSceneState();
  return (
    <>
      <div id="menu_bar" role="toolbar" className="bg-card">
        <div className="mx-4 flex flex-wrap justify-between">
          <div className="flex" id="left_menu">
            <VolumeRange YTPlayer={YTPlayer} size="sm" sliderClassName="w-[100px]" />
            <MenuButton disabled={true} image={metronome} title="倍速" />
          </div>
          <div className="flex justify-between gap-3" id="center_menu">
            <MenuButton image={start} disabled={scene === "play"} onClick={startPlayFlow} title="開始" />
            <MenuButton image={trophy} disabled={scene !== "play"} onClick={handleSceneEnd} title="終了" />
            <MenuButton disabled={scene === "ready"} onClick={openResultDialog} image={reportPencil} title="採点結果" />
          </div>
          <nav className="flex" id="right_menu">
            <SettingPopover triggerButton={<MenuButton image={gear} title="設定" />} />
            <Link href={`/type/${mapId}`} replace>
              <Button variant="outline" size="sm" className="gap-2 text-xs">
                タイピングページに戻る
              </Button>
            </Link>
          </nav>
        </div>
      </div>
      <ResultDialog />
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
