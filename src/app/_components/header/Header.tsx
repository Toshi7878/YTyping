import { serverApi } from "@/trpc/server";
import { Session } from "next-auth";
import HeaderContent from "./HeaderContent";

// export const runtime = "edge";

interface HeaderProps {
  session: Session | null;
}

const Header = async ({ session }: HeaderProps) => {
  const onVercel = process.env.NEXT_PUBLIC_API_URL !== "http://localhost:3000";
  const isNewNotification =
    onVercel && session?.user?.name ? await serverApi.notification.newNotificationCheck() : false;
  return <HeaderContent isNewNotification={isNewNotification} />;
};

export default Header;
