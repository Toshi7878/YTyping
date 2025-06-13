import { useMapInfoRef } from "@/app/(typing)/type/atoms/stateAtoms";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { ThemeColors } from "@/types";
import { useLinkClick } from "@/utils/global-hooks/useLinkClick";
import { Box, useBreakpointValue, useTheme } from "@chakra-ui/react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { BiEdit } from "react-icons/bi";

const EditIcon = () => {
  const theme: ThemeColors = useTheme();
  const { readMapInfo } = useMapInfoRef();
  const { id: mapId } = useParams();
  const handleLinkClick = useLinkClick();
  const iconSize = useBreakpointValue({ base: 72, md: 36 });
  const { data: session } = useSession();

  const role = session?.user.role;
  const creatorId = readMapInfo()?.creator_id;
  const userId = session?.user.id;

  const tooltipLabel = `譜面のEditページに移動${Number(userId) !== creatorId && role === "USER" ? "(閲覧のみ)" : ""}`;
  return (
    <CustomToolTip label={tooltipLabel} placement="top" right={1} top={1}>
      <Box height="60px" display="flex" alignItems="center">
        <Link
          href={`/edit/${mapId}`}
          onClick={handleLinkClick}
          style={{
            cursor: "pointer",
            paddingRight: "12px",
            paddingLeft: "2px"
          }}
          className="hover:opacity-80"
        >
          <BiEdit size={iconSize} />
        </Link>
      </Box>
    </CustomToolTip>
  );
};

export default EditIcon;
