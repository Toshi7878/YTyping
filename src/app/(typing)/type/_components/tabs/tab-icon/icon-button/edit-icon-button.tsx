import Link from "next/link";
import { useSession } from "next-auth/react";
import { BiEdit } from "react-icons/bi";
import { useMapInfoState } from "@/app/(typing)/type/_lib/atoms/hydrate";
import { Button } from "@/components/ui/button";
import { TooltipWrapper } from "@/components/ui/tooltip";

export const EditIconButton = () => {
  const mapInfo = useMapInfoState();
  const { data: session } = useSession();

  const role = session?.user.role;
  const creatorId = mapInfo?.creator.id;
  const userId = session?.user.id;

  const tooltipLabel = `譜面のEditページに移動${Number(userId) !== Number(creatorId) && role === "USER" ? "(閲覧のみ)" : ""}`;
  return (
    <TooltipWrapper label={tooltipLabel} delayDuration={500}>
      <Link href={`/edit/${mapInfo?.id}`} replace className="max-sm:relative max-sm:top-[50px] max-sm:ml-6">
        <Button variant="unstyled" size="icon" className="hover:text-foreground/90">
          <BiEdit className="size-24 md:size-9" />
        </Button>
      </Link>
    </TooltipWrapper>
  );
};
