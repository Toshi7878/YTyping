import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { useLinkClick } from "@/lib/global-hooks/useLinkClick";
import { ThemeColors } from "@/types";
import { Link } from "@chakra-ui/next-js";
import { Box, useBreakpointValue, useTheme } from "@chakra-ui/react";
import { useParams } from "next/navigation";
import { BiEdit } from "react-icons/bi";

const EditIcon = () => {
  const theme: ThemeColors = useTheme();
  const { id: mapId } = useParams();
  const handleLinkClick = useLinkClick();
  const iconSize = useBreakpointValue({ base: 72, md: 36 });

  return (
    <CustomToolTip label="譜面のEditページに移動" placement="top">
      <Box height="60px" display="flex" alignItems="center">
        <Link
          href={`/edit/${mapId}`}
          onClick={handleLinkClick}
          _hover={{ color: theme.colors.text.body }}
          cursor="pointer"
        >
          <BiEdit size={iconSize} />
        </Link>
      </Box>
    </CustomToolTip>
  );
};

export default EditIcon;
