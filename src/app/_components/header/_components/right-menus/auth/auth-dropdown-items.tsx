import { useProgress } from "@bprogress/next";
import { signIn, signOut } from "next-auth/react";
import { BsDiscord, BsGoogle } from "react-icons/bs";
import { FaUser, FaUserShield } from "react-icons/fa";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { env } from "@/env";
import { cn } from "@/lib/utils";

export const SignInDropdownItems = () => {
  const { start } = useProgress();
  const isDevelopment = env.NODE_ENV === "development";

  const items = !isDevelopment
    ? [
        {
          text: "Discordでログイン",
          leftIcon: <BsDiscord className="text-primary-foreground size-6 group-focus:text-white" />,
          provider: "discord",
          className: "hover:bg-discord focus:bg-discord",
        },
        {
          text: "Googleでログイン",
          leftIcon: <BsGoogle className="text-primary-foreground size-6 group-focus:text-white" />,
          provider: "google",
          className: "hover:bg-google focus:bg-google",
        },
      ]
    : [];

  const devItems = isDevelopment
    ? [
        {
          text: "Admin でログイン (開発)",
          leftIcon: <FaUserShield className="text-primary-foreground size-6 group-focus:text-white" />,
          provider: "dev-admin",
          className: "hover:bg-red-600 focus:bg-red-600",
        },
        {
          text: "User でログイン (開発)",
          leftIcon: <FaUser className="text-primary-foreground size-6 group-focus:text-white" />,
          provider: "dev-user",
          className: "hover:bg-blue-600 focus:bg-blue-600",
        },
      ]
    : [];

  return (
    <>
      {[...items, ...devItems].map((item) => (
        <DropdownMenuItem
          key={item.provider}
          onSelect={async () => {
            start();
            await signIn(item.provider);
          }}
          className={cn("group flex w-full items-center gap-3 p-3 px-6 focus:text-white", item.className)}
        >
          {item.leftIcon}
          <span className="font-semibold">{item.text}</span>
        </DropdownMenuItem>
      ))}
    </>
  );
};

export const LogOutDropdownItem = () => {
  const { start, stop } = useProgress();
  return (
    <DropdownMenuItem
      onClick={async () => {
        start();
        await signOut({ redirect: false });
        stop();
      }}
    >
      ログアウト
    </DropdownMenuItem>
  );
};
