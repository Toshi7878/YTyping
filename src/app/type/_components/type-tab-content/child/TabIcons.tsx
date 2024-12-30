import { useTheme, Box, Flex } from "@chakra-ui/react";
import { ThemeColors } from "@/types";
import SettingCard from "./child/SettingCard";
import SettingIcon from "./icon-child/SettingIcon";
import LikeIcon from "./icon-child/LikeIcon";
import { useSession } from "next-auth/react";
import EditIcon from "./icon-child/EditIcon";
import { useState } from "react";

export default function TabIcons() {
  const theme: ThemeColors = useTheme();

  const { data: session } = useSession();
  const [isCardVisible, setIsCardVisible] = useState(false);

  return (
    <>
      <Box
        position="absolute"
        top="-20px"
        right="5px"
        color={`${theme.colors.text.body}99`}
        width="100px"
      >
        <Flex alignItems="center" justifyContent="flex-end">
          {session?.user.id ? <SettingIcon setIsCardVisible={setIsCardVisible} /> : null}
          {session?.user.id ? <LikeIcon /> : null}
          <EditIcon />
        </Flex>
      </Box>
      <SettingCard isCardVisible={isCardVisible} setIsCardVisible={setIsCardVisible} />
    </>
  );
}
