"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import LeftMenus, { SiteLogo } from "./LeftMenus";
import HamburgerMenu from "./right-menus/HamburgerMenu";
import NewMapPopover from "./right-menus/NewMapPopover";
import NotifyBellDrawer from "./right-menus/NotifyBellDrawer";
import UserMenu from "./right-menus/UserMenu";
import ActiveUsersDrawer from "./right-menus/active-user/ActiveUsersDrawer";
import RegisterLogoutButton from "./right-menus/login/RegisterLogoutButton";
import SignInMenu from "./right-menus/login/SignInMenu";

export const LeftNav = () => {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-5">
      <SiteLogo />
      {pathname !== "/user/register" && <LeftMenus />}
    </div>
  );
};

export const RightNav = () => {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isRegisterPage = pathname === "/user/register";

  return (
    <div className="text-header-foreground flex items-center gap-2 select-none">
      {session && session.user?.name && (
        <div className="flex items-center gap-2">
          <ActiveUsersDrawer />
          <NotifyBellDrawer />
          <NewMapPopover />
        </div>
      )}
      {!isRegisterPage && (
        <>
          <HamburgerMenu className="md:hidden" />
          <RightDropDownMenu className="hidden md:flex" />
        </>
      )}
      {isRegisterPage && <RegisterLogoutButton />}
    </div>
  );
};

const RightDropDownMenu = ({ className }: { className: string }) => {
  const { data: session } = useSession();
  if (session && session.user?.name) {
    return <UserMenu userName={session.user.name} className={className} />;
  }

  return <SignInMenu className={className} />;
};
