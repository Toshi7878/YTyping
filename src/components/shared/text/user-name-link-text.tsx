import Link from "next/link";
import { cn } from "@/lib/utils";

interface UserNameLinkTextProps {
  userId: number;
  userName: string | null;
  className?: string;
}

export const UserNameLinkText = ({ userId, userName, className }: UserNameLinkTextProps) => {
  if (!userName) return null;

  return (
    <Link href={`/user/${userId}`} className={cn("relative z-1 text-secondary hover:underline", className)}>
      {userName}
    </Link>
  );
};
