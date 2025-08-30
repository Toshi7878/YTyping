import Link from "next/link";

interface UserLInkTextProps {
  userId: number;
  userName: string | null;
}

const UserLinkText = ({ userId, userName }: UserLInkTextProps) => {
  if (!userName) return null;

  return (
    <Link href={`/user/${userId}`} className="text-secondary relative z-1 hover:underline">
      {userName}
    </Link>
  );
};

export default UserLinkText;
