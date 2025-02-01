import { serverApi } from "@/trpc/server";
import { Session } from "next-auth";
import HeaderClientProvider from "./HeaderClientProvider";
import HeaderContent from "./HeaderContent";

// export const runtime = "edge";

interface HeaderProps {
  session: Session | null;
}

const Header = async ({ session }: HeaderProps) => {
  const onVercel = process.env.NEXT_PUBLIC_API_URL !== "http://localhost:3000";
  const isNewNotification =
    onVercel && session?.user?.name ? await serverApi.notification.newNotificationCheck() : false;
  return (
    <HeaderClientProvider>
      <HeaderContent isNewNotification={isNewNotification} />
    </HeaderClientProvider>
  );
};

export default Header;
