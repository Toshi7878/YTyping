import { ThemeColors } from "@/types";
import { Card, CardProps, useTheme } from "@chakra-ui/react";

interface CustomCardProps extends CardProps {
  children: React.ReactNode;
}

const CustomCard = ({ children, ...rest }: CustomCardProps) => {
  const theme: ThemeColors = useTheme();

  return (
    <Card
      variant={"filled"}
      bg={theme.colors.background.card}
      color={theme.colors.text.body}
      boxShadow="lg"
      {...rest}
    >
      {children}
    </Card>
  );
};

export default CustomCard;
