"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { handleSignIn } from "@/server/actions/authActions";
import { AuthProvider } from "@/types/next-auth";
import { signOut } from "next-auth/react";
import { useActionState } from "react";
import { BsDiscord, BsGoogle } from "react-icons/bs";

export const SignInDropdownItems = () => {
  const [, formAction] = useActionState(async (state: void | null, provider: AuthProvider) => {
    await handleSignIn(provider);
    return null;
  }, null);

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
          onClick={() => {
            formAction(item.provider as AuthProvider);
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
  const [, formAction] = useActionState(async (state: void | null) => {
    await signOut({ redirect: false });
    return null;
  }, null);

  return (
    <DropdownMenuItem
      onClick={() => {
        formAction();
      }}
    >
      ログアウト
    </DropdownMenuItem>
  );
};
