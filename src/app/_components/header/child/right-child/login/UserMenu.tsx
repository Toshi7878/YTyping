import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { loginMenuItem } from "@/config/headerNav";
import { useSession } from "next-auth/react";
import Link from "next/link";
import LogOutMenuItem from "./child/LogOutMenuItem";

export default function UserMenu() {
  const { data: session } = useSession();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-sm p-2">
          {session?.user?.name ? session?.user?.name : "名前未設定"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-fit">
        {loginMenuItem.map((item, index) => (
          <DropdownMenuItem key={index} asChild>
            <Link href={item.href} className="w-full">
              {item.title}
            </Link>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <LogOutMenuItem />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
