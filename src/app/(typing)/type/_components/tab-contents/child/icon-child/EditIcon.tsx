import { useMapInfoRef } from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import Link from "@/components/ui/link/link";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { useLinkClick } from "@/utils/global-hooks/useLinkClick";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { BiEdit } from "react-icons/bi";

const EditIcon = () => {
  const { readMapInfo } = useMapInfoRef();
  const { id: mapId } = useParams();
  const handleLinkClick = useLinkClick();
  const { data: session } = useSession();

  const role = session?.user.role;
  const creatorId = readMapInfo()?.creator_id;
  const userId = session?.user.id;

  const tooltipLabel = `譜面のEditページに移動${Number(userId) !== creatorId && role === "USER" ? "(閲覧のみ)" : ""}`;
  return (
    <TooltipWrapper label={tooltipLabel}>
      <div className="flex h-[60px] items-center">
        <Link href={`/edit/${mapId}`} onClick={handleLinkClick} className="cursor-pointer pr-3 pl-0.5 hover:opacity-80">
          <BiEdit className="h-[72px] w-[72px] md:h-9 md:w-9" />
        </Link>
      </div>
    </TooltipWrapper>
  );
};

export default EditIcon;
