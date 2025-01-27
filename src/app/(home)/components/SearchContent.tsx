import { useGlobalRefs } from "@/app/_components/global-provider/GlobalRefProvider";
import VolumeRange from "@/components/custom-ui/VolumeRange";
import { IS_ANDROID, IS_IOS } from "@/config/consts/globalConst";
import { Box, Flex } from "@chakra-ui/react";
import SearchInputs from "./search/SearchInputs";

const SearchContent = () => {
  const { playerRef } = useGlobalRefs();

  return (
    <Flex as="section" width="100%" alignItems="center" mb={4}>
      <Box width="100%">
        <Box mb={3}>
          <SearchInputs />
        </Box>
        {!IS_IOS && !IS_ANDROID && (
          <Flex justifyContent="flex-end">
            <VolumeRange playerRef={playerRef} />
          </Flex>
        )}
      </Box>
    </Flex>
  );
};

export default SearchContent;
