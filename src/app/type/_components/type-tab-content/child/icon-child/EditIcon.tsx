import { useMapInfoRef } from "@/app/type/atoms/refAtoms";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { useLinkClick } from "@/lib/global-hooks/useLinkClick";
import { ThemeColors } from "@/types";
import { Link } from "@chakra-ui/next-js";
import { Box, useBreakpointValue, useTheme } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { BiEdit } from "react-icons/bi";

const EditIcon = () => {
  const theme: ThemeColors = useTheme();
  const { readMapInfoRef } = useMapInfoRef();
  const { id: mapId } = useParams();
  const handleLinkClick = useLinkClick();
  const iconSize = useBreakpointValue({ base: 72, md: 36 });
  const { data: session } = useSession();

  const role = session?.user.role;
  const creatorId = readMapInfoRef()?.creator_id;
  const userId = session?.user.id;

  const tooltipLabel = `譜面のEditページに移動${
    Number(userId) !== creatorId && role === "USER" ? "(閲覧のみ)" : ""
  }`;
  return (
    <CustomToolTip label={tooltipLabel} placement="top" right={1} top={1}>
      <Box height="60px" display="flex" alignItems="center">
        <Link
          href={`/edit/${mapId}`}
          onClick={handleLinkClick}
          _hover={{ color: theme.colors.text.body }}
          cursor="pointer"
          pr={3}
          pl={0.5}
        >
          <BiEdit size={iconSize} />
        </Link>
      </Box>
    </CustomToolTip>
  );
};

export default EditIcon;
