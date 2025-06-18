import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { signIn, signOut } from "next-auth/react";
import { BsDiscord, BsGoogle } from "react-icons/bs";

export const SignInDropdownItems = () => {
  const items = [
    {
      text: "Discordでログイン",
      leftIcon: <BsDiscord className="size-6 text-white" />,
      provider: "discord",
      hover: "focus:bg-[#7289DA]",
    },
    {
      text: "Googleでログイン",
      leftIcon: <BsGoogle className="size-6 text-white" />,
      provider: "google",
      hover: "focus:bg-[#DB4437]",
    },
  ];

  return (
    <>
      {items.map((item) => (
        <DropdownMenuItem
          key={item.provider}
          onClick={async () => {
            await signIn(item.provider);
          }}
          className={cn("flex w-full items-center gap-3 p-3 px-6 text-white", item.hover)}
        >
          {item.leftIcon}
          <span className="font-semibold">{item.text}</span>
        </DropdownMenuItem>
      ))}
    </>
  );
};

export const LogOutDropdownItem = () => {
  return <DropdownMenuItem onClick={async () => await signOut({ redirect: false })}>ログアウト</DropdownMenuItem>;
};
