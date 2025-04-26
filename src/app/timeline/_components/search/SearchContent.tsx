import VolumeRange from "@/components/share-components/VolumeRange";
import { usePreviewPlayerState } from "@/lib/global-atoms/globalAtoms";
import { useUserAgent } from "@/util/useUserAgent";
import { Box, Flex } from "@chakra-ui/react";
import SearchInputs from "./child/SearchInputs";
import SearchModal from "./child/SearchModal";

const SearchContent = () => {
  const player = usePreviewPlayerState();
  const { isMobile } = useUserAgent();

  return (
    <Flex as="section" width="100%" alignItems="center" mb={4}>
      <Box width="100%">
        <Box mb={3}>
          <SearchInputs />
        </Box>
        <Flex justifyContent="space-between">
          <SearchModal />
          {!isMobile && (
            <Flex justifyContent="flex-end">
              <VolumeRange player={player} />
            </Flex>
          )}
        </Flex>
      </Box>
    </Flex>
  );
};

export default SearchContent;
