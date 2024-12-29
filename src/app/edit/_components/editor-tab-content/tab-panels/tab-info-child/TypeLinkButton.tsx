import { useLinkClick } from "@/lib/global-hooks/useLinkClick";
import { ThemeColors } from "@/types";
import { Link } from "@chakra-ui/next-js";
import { Button, useTheme } from "@chakra-ui/react";
import { useParams } from "next/navigation";

const TypeLinkButton = () => {
  const theme: ThemeColors = useTheme();
  const { id } = useParams();
  const handleLinkClick = useLinkClick();
  return (
    <Link href={`/type/${id}`} onClick={handleLinkClick} cursor="pointer">
      <Button
        size="md"
        variant="outline"
        color={theme.colors.text.body}
        borderColor={theme.colors.border.card}
        _hover={{
          bg: theme.colors.button.sub.hover,
        }}
        ml={5}
      >
        タイピングページに移動
      </Button>
    </Link>
  );
};

export default TypeLinkButton;
