import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useState } from "react";
import EditIcon from "./icon-child/EditIcon";
import LikeIcon from "./icon-child/LikeIcon";
import SettingIcon from "./icon-child/SettingIcon";

const SettingCard = dynamic(() => import("./setting-card/SettingCard"), {
  ssr: false,
});

export default function TabIcons() {
  const { data: session } = useSession();
  const [isCardVisible, setIsCardVisible] = useState(false);

  return (
    <>
      <div className={cn("absolute -top-5 -right-2.5 flex items-center justify-end", "text-foreground/60")}>
        {session?.user.id ? <SettingIcon setIsCardVisible={setIsCardVisible} /> : null}
        {session?.user.id ? <LikeIcon /> : null}
        <EditIcon />
      </div>
      <SettingCard isCardVisible={isCardVisible} setIsCardVisible={setIsCardVisible} />
    </>
  );
}
