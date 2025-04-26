import VolumeRange from "@/components/share-components/VolumeRange";
import { usePreviewPlayerState } from "@/lib/global-atoms/globalAtoms";
import { useUserAgent } from "@/util/useUserAgent";
import { Box, Flex } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import FilterInputs from "./child/FilterInputs";
import SearchInputs from "./child/SearchInputs";
import SortOptions from "./child/SortOptions";
import MapListLength from "./child/child/MapListLength";
import SearchRange from "./child/child/SearchRange";

const SearchContent = () => {
  const { data: session } = useSession();
  const player = usePreviewPlayerState();
  const { isMobile } = useUserAgent();

  const isLogin = !!session?.user?.id;
  return (
    <Flex as="section" width="100%" alignItems="center" mb={4}>
      <Box width="100%">
        <Box mb={3}>
          <SearchInputs />
        </Box>
        <Flex
          justifyContent={isLogin ? "space-between" : "flex-end"}
          gap={isLogin ? 0 : 8}
          direction={{ base: "column", md: "row" }}
        >
          <Flex alignItems="center" gap={5} direction={{ base: "column", md: "row" }}>
            {isLogin && <FilterInputs />}
            <SearchRange step={0.1} mx={4} />
          </Flex>
          {!isMobile && <VolumeRange player={player} />}
        </Flex>
        <Box mt={4}>
          <Flex
            width="100%"
            bg="background.card"
            color="text.body"
            p={2}
            borderRadius="md"
            overflowX="auto"
            flexWrap={{ base: "wrap", md: "nowrap" }}
            justifyContent="space-between"
            alignItems="center"
            gap={1}
            css={{
              "&::-webkit-scrollbar": {
                height: "8px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                borderRadius: "4px",
              },
            }}
          >
            <SortOptions />
            <MapListLength />
          </Flex>
        </Box>
      </Box>
    </Flex>
  );
};

export default SearchContent;
