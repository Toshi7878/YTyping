import { Link } from "@chakra-ui/next-js";
import { Box, Text } from "@chakra-ui/react";

interface FingerChartUrlProps {
  url: string;
}

const FingerChartUrl = ({ url }: FingerChartUrlProps) => {
  if (!url) {
    return <Text>運指表はありません</Text>;
  }
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
