import { ThemeColors } from "@/types";
import { Card, useTheme } from "@chakra-ui/react";

interface CustomCardProps {
  children: React.ReactNode;
  className?: string;
}

const CustomCard = ({ children, className = "" }: CustomCardProps) => {
  const theme: ThemeColors = useTheme();

  return (
    <Card
      className={className}
      variant={"filled"}
      bg={theme.colors.background.card}
      color={theme.colors.text.body}
      boxShadow="lg"
    >
      {children}
    </Card>
  );
};

export default CustomCard;
