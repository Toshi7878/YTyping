import VolumeRange from "@/components/share-components/VolumeRange";
import { IS_ANDROID, IS_IOS } from "@/config/consts/globalConst";
import { usePreviewPlayerState } from "@/lib/global-atoms/globalAtoms";
import { Box, Flex } from "@chakra-ui/react";
import SearchInputs from "./child/SearchInputs";
import SearchModal from "./child/SearchModal";

const SearchContent = () => {
  const player = usePreviewPlayerState();
  return (
    <Flex as="section" width="100%" alignItems="center" mb={4}>
      <Box width="100%">
        <Box mb={3}>
          <SearchInputs />
        </Box>
        <Flex justifyContent="space-between">
          <SearchModal />
          {!IS_IOS && !IS_ANDROID && (
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
