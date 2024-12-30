"use client";

import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { ThemeColors } from "@/types";
import { Box, useDisclosure, useTheme } from "@chakra-ui/react";
import { RiAddBoxFill } from "react-icons/ri";
import NewCreateModal from "./child/NewCreateModal";

export default function NewMap() {
  const newCreateModalDisclosure = useDisclosure();
  const theme: ThemeColors = useTheme();

  return (
    <>
      <CustomToolTip placement="bottom" label="譜面新規作成" fontSize="xs" openDelay={600}>
        <Box
          color={theme.colors.text.header.normal}
          _hover={{
            color: theme.colors.text.header.hover,
          }}
          cursor="pointer"
          onClick={newCreateModalDisclosure.onOpen}
        >
          <RiAddBoxFill size={20} />
        </Box>
      </CustomToolTip>

      {newCreateModalDisclosure.isOpen && (
        <NewCreateModal newCreateModalDisclosure={newCreateModalDisclosure} />
      )}
    </>
  );
}
