import { ThemeColors } from "@/types";
import { Text, useBreakpointValue, useTheme } from "@chakra-ui/react";
import styled from "@emotion/styled";

interface StatusUnderlineProps {
  children: React.ReactNode;
  label: string;
}

const StatusUnderline = ({ label, children }: StatusUnderlineProps) => {
  const theme: ThemeColors = useTheme();

  const width = useBreakpointValue({
    base: { main: "190px", sub: "106px" },
    md: { main: "159px", sub: "80px" },
  });

  const UnderlinedSpan = styled(Text)<{ label: string }>`
    position: relative;

    &::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      height: 2px;
      width: ${({ label }) => (label === "score" || label === "point" ? width?.main : width?.sub)};
      background-color: ${theme.colors.text.body};
    }
  `;

  return (
    <UnderlinedSpan as="span" label={label} className="status-underline">
      {children}
    </UnderlinedSpan>
  );
};

export default StatusUnderline;
