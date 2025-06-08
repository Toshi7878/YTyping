import { useLinkClick } from "@/utils/global-hooks/useLinkClick";
import Link from "next/link";

interface UserLInkTextProps {
  userId: number;
  userName: string;
}

const UserLinkText = ({ userId, userName }: UserLInkTextProps) => {
  const handleLinkClick = useLinkClick();

  return (
    <Link href={`/user/${userId}`} className="text-secondary relative z-1 hover:underline" onClick={handleLinkClick}>
      {userName}
    </Link>
  );
};

export default UserLinkText;
