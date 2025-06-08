"use client";

import { useSession } from "next-auth/react";
import HamburgerMenu from "./HamburgerMenu";
import NewMap from "./NewMap";
import NotifyBell from "./NotifyBell";
import ActiveUsers from "./right-child/active-user/ActiveUsers";
import Login from "./right-child/login/Login";

export default function RightNav() {
  const { data: session, status } = useSession();

  return (
    <div className="flex items-center gap-2">
      {status !== "loading" && session?.user?.name && (
        <>
          <ActiveUsers />
          <NotifyBell />
          <NewMap />
        </>
      )}
      <HamburgerMenu className="md:hidden" />
      <Login className="hidden md:block" />
    </div>
  );
}
