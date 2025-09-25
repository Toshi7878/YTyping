import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useProgress } from "@bprogress/next";
import { signIn, signOut } from "next-auth/react";
import { BsDiscord, BsGoogle } from "react-icons/bs";

export const SignInDropdownItems = () => {
  const { start } = useProgress();
  const items = [
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
  ];

  return (
    <>
      {items.map((item) => (
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
