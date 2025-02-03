import { ThemeColors } from "@/types";
import { Box, Flex, useTheme } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useState } from "react";
import EditIcon from "./icon-child/EditIcon";
import LikeIcon from "./icon-child/LikeIcon";
import SettingIcon from "./icon-child/SettingIcon";
const SettingCard = dynamic(() => import("./child/SettingCard"), {
  ssr: false, // サーバーサイドレンダリングを無効にする場合、このオプションを有効にします
});
export default function TabIcons() {
  const theme: ThemeColors = useTheme();

  const { data: session } = useSession();
  const [isCardVisible, setIsCardVisible] = useState(false);

  return (
    <>
      <Box
        position="absolute"
        top={{ base: "-20px", md: "-20px" }}
        right="-10px"
        color={`${theme.colors.text.body}99`}
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
