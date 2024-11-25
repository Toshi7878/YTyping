import { Link, useTheme } from "@chakra-ui/react";
import React from "react";
import { useLinkClick } from "@/lib/hooks/useLinkClick";
import { ThemeColors } from "@/types";

interface UserLInkTextProps {
  userId: number;
  userName: string;
}

const UserLinkText = ({ userId, userName }: UserLInkTextProps) => {
  const theme: ThemeColors = useTheme();

  const handleLinkClick = useLinkClick();

  return (
    <Link href={`/user/${userId}`} onClick={handleLinkClick} color={theme.colors.secondary.main}>
      {userName}
    </Link>
  );
};

export default UserLinkText;
