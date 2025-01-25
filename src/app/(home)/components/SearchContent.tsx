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
        <Box mb={3}>
          <Box>
            現在、データを格納しているデータベースの無料で使用できる容量が超過しているので、
          </Box>
          <Box>
            ランキング登録、譜面投稿などデータベースに追加する処理が含まれる機能が使用できません。
          </Box>
        </Box>
      </Box>
    </Flex>
  );
};

export default SearchContent;
