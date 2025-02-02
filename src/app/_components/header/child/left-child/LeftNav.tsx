"use client";

import { Flex } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import LeftMenus from "./LeftMenus";
import SiteLogo from "./SiteLogo";

function LeftNav() {
  const { data: session } = useSession();

  return (
    <Flex gap={6} alignItems="center">
      <SiteLogo />
      {(!session || session.user?.name) && <LeftMenus />}
    </Flex>
  );
}

export default LeftNav;
