import { Link } from "@chakra-ui/next-js";
import { Box } from "@chakra-ui/react";

interface FingerChartUrlProps {
  url: string;
}

const FingerChartUrl = ({ url }: FingerChartUrlProps) => {
  return (
    <Box>
      運指表:
      <Link href={url} isExternal color="blue.500">
        運指表を見る
      </Link>
    </Box>
  );
};

export default FingerChartUrl;
