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
      <Link href={`/edit/${mapId}`} onClick={handleLinkClick} className="cursor-pointer p-1 hover:opacity-80">
        <BiEdit className="h-9 w-9" />
      </Link>
    </TooltipWrapper>
  );
};

export default EditIcon;
