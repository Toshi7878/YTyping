import { useMapInfoRef } from "@/app/(typing)/type/atoms/stateAtoms";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { useLinkClick } from "@/utils/global-hooks/useLinkClick";
import Link from "next/link";
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
    <CustomToolTip label={tooltipLabel} placement="top" right={1} top={1}>
      <div className="h-[60px] flex items-center">
        <Link
          href={`/edit/${mapId}`}
          onClick={handleLinkClick}
          className="cursor-pointer pr-3 pl-0.5 hover:opacity-80"
        >
          <BiEdit className="w-[72px] h-[72px] md:w-9 md:h-9" />
        </Link>
      </div>
    </CustomToolTip>
  );
};

export default EditIcon;
