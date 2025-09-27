import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { BiEdit } from "react-icons/bi";
import { Button } from "@/components/ui/button";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { useTRPC } from "@/trpc/provider";

const EditIconButton = () => {
  const trpc = useTRPC();
  const { id: mapId } = useParams<{ id: string }>();
  const { data: mapInfo } = useQuery(trpc.map.getMapInfo.queryOptions({ mapId: Number(mapId) }));
  const { data: session } = useSession();

  const role = session?.user.role;
  const creatorId = mapInfo?.creator.id;
  const userId = session?.user.id;

  const tooltipLabel = `譜面のEditページに移動${Number(userId) !== Number(creatorId) && role === "USER" ? "(閲覧のみ)" : ""}`;
  return (
    <TooltipWrapper label={tooltipLabel} delayDuration={500}>
      <Link href={`/edit/${mapId}`} replace>
        <Button variant="unstyled" size="icon" className="hover:text-foreground/90">
          <BiEdit className="size-16 md:size-9" />
        </Button>
      </Link>
    </TooltipWrapper>
  );
};

export default EditIconButton;
