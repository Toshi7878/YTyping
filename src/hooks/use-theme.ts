import { ThemeColors } from "@/types";
import { useTheme as useChakraTheme } from "@chakra-ui/react";

// Temporary hook to maintain compatibility while migrating from Chakra UI
export function useTheme(): ThemeColors {
  const theme = useChakraTheme();
  return theme as ThemeColors;
}