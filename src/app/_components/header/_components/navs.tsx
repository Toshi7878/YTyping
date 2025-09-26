"use client"

import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import LeftMenus, { SiteLogo } from "./left-menus"
import ActiveUsersSheet from "./right-menus/active-user/active-users-sheet"
import RegisterLogoutButton from "./right-menus/auth/register-logout-button"
import SignInMenu from "./right-menus/auth/sign-in-menu"
import HamburgerMenu from "./right-menus/hamburger-menu"
import NewMapPopover from "./right-menus/new-map-popover"
import NotifyBellSheet from "./right-menus/notify-bell-sheet"
import UserMenu from "./right-menus/user-menu"

export const LeftNav = () => {
  const pathname = usePathname()

  return (
    <div className="flex items-center gap-5">
      <SiteLogo />
      {pathname !== "/user/register" && <LeftMenus />}
    </div>
  )
}

export const RightNav = () => {
  const { data: session } = useSession()
  const pathname = usePathname()

  const isRegisterPage = pathname === "/user/register"

  return (
    <div className="flex items-center gap-2 select-none">
      {session?.user?.name && (
        <div className="flex items-center gap-2">
          <ActiveUsersSheet />
          <NotifyBellSheet />
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
  )
}

const RightDropDownMenu = ({ className }: { className: string }) => {
  const { data: session } = useSession()
  if (session?.user?.name) {
    return <UserMenu userName={session.user.name} className={className} />
  }

  return <SignInMenu className={className} />
}
