"use client";

import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import HamburgerMenu from "../hamburger-menu/HamburgerMenu";
import ActiveUsers from "./right-child/active-user/ActiveUsers";
import Login from "./right-child/login/Login";
import NewMap from "./right-child/new-map/NewMap";
import NotifyBell from "./right-child/notify-bell/NotifyBell";

interface RightNavProps {
  className?: string;
}

export default function RightNav({ className }: RightNavProps) {
  const { data: session, status } = useSession();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {status !== "loading" && session?.user?.name && (
        <>
          <ActiveUsers />
          <NotifyBell />
          <NewMap />
        </>
      )}
      <HamburgerMenu className="block md:hidden" />

      <Login className="hidden md:block" />
    </div>
  );
}
