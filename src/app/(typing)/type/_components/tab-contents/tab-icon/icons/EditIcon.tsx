import { useMapInfoRef } from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { Button } from "@/components/ui/button";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { useLinkClick } from "@/utils/global-hooks/useLinkClick";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BiEdit } from "react-icons/bi";

const EditIcon = () => {
  const { readMapInfo } = useMapInfoRef();
  const { id: mapId } = useParams<{ id: string }>();
  const handleLinkClick = useLinkClick();
  const { data: session } = useSession();

  const role = session?.user.role;
  const creatorId = readMapInfo()?.creator_id;
  const userId = session?.user.id;

  const tooltipLabel = `譜面のEditページに移動${Number(userId) !== creatorId && role === "USER" ? "(閲覧のみ)" : ""}`;
  return (
    <TooltipWrapper label={tooltipLabel} delayDuration={500}>
      <Link href={`/edit/${mapId}`} onClick={handleLinkClick}>
        <Button variant="unstyled" size="icon" className="hover:text-foreground/90">
          <BiEdit className="size-16 md:size-9" />
        </Button>
      </Link>
    </TooltipWrapper>
  );
};

export default EditIcon;
