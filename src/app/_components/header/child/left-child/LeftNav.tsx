"use client";

import { useSession } from "next-auth/react";
import LeftMenus from "./LeftMenus";
import SiteLogo from "./SiteLogo";

function LeftNav() {
  const { data: session, status } = useSession();

  return (
    <div className="flex items-center gap-6">
      <SiteLogo />
      {status !== "loading" && (!session || session.user?.name) && <LeftMenus />}
    </div>
  );
}

export default LeftNav;
